// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import {ERC20} from '@openzeppelin/contracts/token/ERC20/ERC20.sol';
/// @dev Adversarial test fixture only.
contract ReentrantToken is ERC20 {
 address public vault; bool public blocked; bool private attacking;
 constructor() ERC20('Attack fixture','ATT') {}
 function mint(address to, uint256 amount) external { _mint(to,amount); }
 function setVault(address v) external { vault=v; }
 function prime() external {
   _approve(address(this),vault,1);
   (bool ok,) = vault.call(abi.encodeWithSignature('deposit(address,uint256)',address(this),1));
   require(ok,'prime failed');
 }
 function transfer(address to,uint256 value) public override returns(bool) {
   if (attacking) return super.transfer(to,value);
   attacking = true;
   (bool ok,) = vault.call(abi.encodeWithSignature('withdraw(address,uint256)',address(this),1));
   blocked = !ok;
   attacking = false;
   return super.transfer(to,value);
 }
}
