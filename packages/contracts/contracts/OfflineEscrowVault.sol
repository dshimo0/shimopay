// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {EIP712} from '@openzeppelin/contracts/utils/cryptography/EIP712.sol';
import {ECDSA} from '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import {ReentrancyGuard} from '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
contract OfflineEscrowVault is EIP712, ReentrancyGuard {
    using SafeERC20 for IERC20;
    struct OfflineSession { address owner; address sessionSigner; address token; uint256 maxAmount; uint256 spentAmount; uint64 expiresAt; bool active; address merchantRestriction; }
    struct PaymentIntent { bytes32 sessionId; address payer; address merchant; address settlementToken; uint256 settlementAmount; string displayCurrency; uint256 displayAmountMinor; bytes32 fxQuoteId; uint256 sequence; bytes32 nonce; uint64 createdAt; uint64 expiresAt; }
    bytes32 public constant INTENT_TYPEHASH = keccak256('PaymentIntent(bytes32 sessionId,address payer,address merchant,address settlementToken,uint256 settlementAmount,string displayCurrency,uint256 displayAmountMinor,bytes32 fxQuoteId,uint256 sequence,bytes32 nonce,uint64 createdAt,uint64 expiresAt)');
    mapping(address => mapping(address => uint256)) public balances;
    mapping(bytes32 => OfflineSession) private sessions;
    mapping(bytes32 => mapping(bytes32 => bool)) public consumedNonces;
    mapping(bytes32 => mapping(uint256 => bool)) public consumedSequences;
    error InvalidSession(); error InsufficientBalance(); error SessionInactive(); error SessionExpiredError(); error IntentExpired(); error InvalidIntent(); error InvalidSignature(); error WrongMerchant(); error NonceAlreadyUsed(); error SequenceAlreadyUsed(); error InsufficientSessionBalance(); error NotOwner(); error NotExpired(); error UnsupportedToken();
    event Deposited(address indexed owner, address indexed token, uint256 amount);
    event SessionCreated(bytes32 indexed sessionId, address indexed owner, address indexed signer, address token, uint256 amount, uint64 expiresAt);
    event PaymentSettled(bytes32 indexed sessionId, bytes32 indexed nonce, address indexed merchant, uint256 amount);
    event SessionCancelled(bytes32 indexed sessionId);
    event SessionExpired(bytes32 indexed sessionId);
    event FundsReleased(bytes32 indexed sessionId, address indexed owner, uint256 amount);
    constructor() EIP712('ShimoPay', '1') {}
    function deposit(address token, uint256 amount) external nonReentrant {
        if (amount == 0) revert InvalidIntent();
        uint256 beforeBalance = IERC20(token).balanceOf(address(this));
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        if (IERC20(token).balanceOf(address(this)) - beforeBalance != amount) revert UnsupportedToken();
        balances[msg.sender][token] += amount;
        emit Deposited(msg.sender, token, amount);
    }
    function withdraw(address token, uint256 amount) external nonReentrant {
        if (amount == 0 || balances[msg.sender][token] < amount) revert InsufficientBalance();
        balances[msg.sender][token] -= amount;
        IERC20(token).safeTransfer(msg.sender, amount);
    }
    function createSession(bytes32 id, address signer, address token, uint256 amount, uint64 expiresAt, address restriction) external nonReentrant {
        if (id == bytes32(0) || sessions[id].owner != address(0) || signer == address(0) || signer == msg.sender || amount == 0 || expiresAt <= block.timestamp) revert InvalidSession();
        if (balances[msg.sender][token] < amount) revert InsufficientBalance();
        balances[msg.sender][token] -= amount;
        sessions[id] = OfflineSession(msg.sender, signer, token, amount, 0, expiresAt, true, restriction);
        emit SessionCreated(id, msg.sender, signer, token, amount, expiresAt);
    }
    function intentDigest(PaymentIntent calldata p) public view returns (bytes32) {
        return _hashTypedDataV4(keccak256(abi.encode(INTENT_TYPEHASH, p.sessionId, p.payer, p.merchant, p.settlementToken, p.settlementAmount, keccak256(bytes(p.displayCurrency)), p.displayAmountMinor, p.fxQuoteId, p.sequence, p.nonce, p.createdAt, p.expiresAt)));
    }
    function settlePayment(PaymentIntent calldata p, bytes calldata signature) external nonReentrant {
        OfflineSession storage s = sessions[p.sessionId];
        if (!s.active) revert SessionInactive();
        if (block.timestamp >= s.expiresAt) revert SessionExpiredError();
        if (block.timestamp >= p.expiresAt) revert IntentExpired();
        // Merchant is the caller. A relayer must be authorized separately in a future version.
        if (msg.sender != p.merchant || (s.merchantRestriction != address(0) && p.merchant != s.merchantRestriction)) revert WrongMerchant();
        if (p.payer != s.owner || p.settlementToken != s.token || p.settlementAmount == 0 || p.sequence == 0 || p.createdAt > block.timestamp || p.createdAt >= p.expiresAt || p.expiresAt > s.expiresAt || p.displayAmountMinor == 0 || keccak256(bytes(p.displayCurrency)) != keccak256('BRL')) revert InvalidIntent();
        if (consumedNonces[p.sessionId][p.nonce]) revert NonceAlreadyUsed();
        if (consumedSequences[p.sessionId][p.sequence]) revert SequenceAlreadyUsed();
        if (ECDSA.recover(intentDigest(p), signature) != s.sessionSigner) revert InvalidSignature();
        if (p.settlementAmount > s.maxAmount - s.spentAmount) revert InsufficientSessionBalance();
        consumedNonces[p.sessionId][p.nonce] = true;
        consumedSequences[p.sessionId][p.sequence] = true;
        s.spentAmount += p.settlementAmount;
        IERC20(s.token).safeTransfer(p.merchant, p.settlementAmount);
        emit PaymentSettled(p.sessionId, p.nonce, p.merchant, p.settlementAmount);
    }
    function cancelSession(bytes32 id) external nonReentrant {
        OfflineSession storage s = sessions[id];
        if (msg.sender != s.owner) revert NotOwner();
        if (!s.active) revert SessionInactive();
        _release(id, s); emit SessionCancelled(id);
    }
    function closeExpiredSession(bytes32 id) external nonReentrant {
        OfflineSession storage s = sessions[id];
        if (!s.active) revert SessionInactive();
        if (block.timestamp < s.expiresAt) revert NotExpired();
        _release(id, s); emit SessionExpired(id);
    }
    function _release(bytes32 id, OfflineSession storage s) private {
        s.active = false;
        uint256 amount = s.maxAmount - s.spentAmount;
        balances[s.owner][s.token] += amount;
        emit FundsReleased(id, s.owner, amount);
    }
    function getSession(bytes32 id) external view returns (OfflineSession memory) { return sessions[id]; }
    function remainingAmount(bytes32 id) external view returns (uint256) { OfflineSession storage s = sessions[id]; return s.active ? s.maxAmount - s.spentAmount : 0; }
}
