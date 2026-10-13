use anchor_lang::prelude::*;
use solana_program::{ed25519_program, hash::hash, sysvar::instructions::{load_current_index_checked, load_instruction_at_checked}};
use anchor_spl::{associated_token::AssociatedToken, token::{self, Mint, Token, TokenAccount, Transfer}};

declare_id!("9iWAPSp9p9mbQ7LouMZEdt3qhtpnZGiaSyoCBSXDPYKg");
const ACTIVE: u8 = 1;

#[program]
pub mod shimopay_solana {
    use super::*;
    pub fn initialize_reserve(ctx: Context<InitializeReserve>, network: [u8;32]) -> Result<()> {
        let r = &mut ctx.accounts.reserve;
        r.owner = ctx.accounts.owner.key(); r.token_mint = ctx.accounts.mint.key();
        r.vault_token_account = ctx.accounts.vault.key(); r.network = network;
        r.created_at = Clock::get()?.unix_timestamp; r.bump = ctx.bumps.reserve;
        Ok(())
    }
    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        require!(amount > 0, PayError::InvalidAmount);
        token::transfer(CpiContext::new(ctx.accounts.token_program.to_account_info(), Transfer {
            from:ctx.accounts.owner_token.to_account_info(), to:ctx.accounts.vault.to_account_info(), authority:ctx.accounts.owner.to_account_info()
        }), amount)?;
        let r = &mut ctx.accounts.reserve;
        r.total_deposited = r.total_deposited.checked_add(amount).ok_or(PayError::Arithmetic)?;
        r.available_reserve = r.available_reserve.checked_add(amount).ok_or(PayError::Arithmetic)?;
        emit!(ReserveDeposited {reserve:r.key(), owner:r.owner, amount}); Ok(())
    }
    pub fn create_allowance(ctx: Context<CreateAllowance>, session_key: Pubkey, session_id: [u8;32], maximum_amount:u64, expires_at:i64) -> Result<()> {
        let time = Clock::get()?.unix_timestamp;
        require!(session_key != ctx.accounts.owner.key() && session_key != Pubkey::default(), PayError::WrongSessionKey);
        require!(maximum_amount > 0, PayError::InvalidAmount);
        require!(expires_at > time && expires_at <= time + 86400, PayError::Expired);
        let r = &mut ctx.accounts.reserve;
        require!(r.available_reserve >= maximum_amount, PayError::InsufficientReserve);
        r.available_reserve -= maximum_amount;
        let a = &mut ctx.accounts.allowance;
        a.owner = r.owner; a.session_public_key = session_key; a.reserve = r.key(); a.session_id = session_id;
        a.maximum_amount = maximum_amount; a.expires_at = expires_at; a.status = ACTIVE; a.bump = ctx.bumps.allowance;
        emit!(AllowanceCreated {allowance:a.key(), reserve:r.key(), session_public_key:session_key, maximum_amount, expires_at}); Ok(())
    }
    pub fn settle(ctx: Context<Settle>, domain:[u8;18], intent:IntentData) -> Result<()> {
        require!(&domain == b"ShimoPay/Solana/v2", PayError::WrongDomain);
        let time = Clock::get()?.unix_timestamp;
        let a = &ctx.accounts.allowance; let r = &ctx.accounts.reserve;
        require!(a.status == ACTIVE, PayError::InactiveAllowance);
        require!(time < a.expires_at && time < intent.expires_at && intent.expires_at <= a.expires_at && intent.issued_at <= time + 30 && intent.issued_at < intent.expires_at, PayError::Expired);
        require!(intent.amount > 0 && intent.display_amount_minor > 0 && intent.sequence > 0, PayError::InvalidAmount);
        require_keys_eq!(intent.consumer, r.owner, PayError::WrongOwner);
        require_keys_eq!(intent.session_public_key, a.session_public_key, PayError::WrongSessionKey);
        require_keys_eq!(intent.merchant, ctx.accounts.merchant.key(), PayError::WrongMerchant);
        require_keys_eq!(intent.currency_mint, r.token_mint, PayError::WrongMint);
        require_keys_eq!(intent.reserve, r.key(), PayError::WrongReserve);
        require_keys_eq!(intent.allowance, a.key(), PayError::WrongAllowance);
        require!(intent.network == r.network && intent.program == crate::ID, PayError::WrongDomain);
        let remaining = a.maximum_amount.checked_sub(a.spent_amount).ok_or(PayError::Arithmetic)?;
        require!(intent.amount <= remaining, PayError::AllowanceExceeded);
        require!(ctx.accounts.vault.amount >= intent.amount, PayError::InsufficientReserve);
        let message = intent.canonical();
        verify_ed25519(&ctx.accounts.instructions.to_account_info(), &a.session_public_key, &message)?;
        let owner = r.owner; let mint = r.token_mint; let bump = [r.bump];
        let seeds: &[&[u8]] = &[b"reserve", owner.as_ref(), mint.as_ref(), &bump];
        token::transfer(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), Transfer {
            from:ctx.accounts.vault.to_account_info(), to:ctx.accounts.merchant_token.to_account_info(), authority:r.to_account_info()
        }, &[seeds]), intent.amount)?;
        let a = &mut ctx.accounts.allowance;
        a.spent_amount = a.spent_amount.checked_add(intent.amount).ok_or(PayError::Arithmetic)?;
        a.settled_count = a.settled_count.checked_add(1).ok_or(PayError::Arithmetic)?;
        let receipt = &mut ctx.accounts.receipt;
        receipt.payment_intent_hash = hash(&message).to_bytes(); receipt.merchant = intent.merchant;
        receipt.amount = intent.amount; receipt.allowance = a.key(); receipt.nonce = intent.nonce; receipt.settled_at = time;
        emit!(PaymentSettled {receipt:receipt.key(), allowance:a.key(), merchant:intent.merchant, amount:intent.amount, payment_intent_hash:receipt.payment_intent_hash}); Ok(())
    }
    pub fn cancel_allowance(ctx: Context<CancelAllowance>) -> Result<()> {
        let a = &mut ctx.accounts.allowance;
        require!(a.status == ACTIVE, PayError::InactiveAllowance);
        let remaining = a.maximum_amount.checked_sub(a.spent_amount).ok_or(PayError::Arithmetic)?;
        ctx.accounts.reserve.available_reserve = ctx.accounts.reserve.available_reserve.checked_add(remaining).ok_or(PayError::Arithmetic)?;
        a.status = if Clock::get()?.unix_timestamp >= a.expires_at {3} else {2};
        emit!(AllowanceReleased {allowance:a.key(), amount:remaining, status:a.status}); Ok(())
    }
    pub fn withdraw(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        require!(amount > 0 && amount <= ctx.accounts.reserve.available_reserve, PayError::InsufficientReserve);
        let r = &ctx.accounts.reserve; let owner = r.owner; let mint = r.token_mint; let bump = [r.bump];
        let seeds: &[&[u8]] = &[b"reserve", owner.as_ref(), mint.as_ref(), &bump];
        token::transfer(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), Transfer {
            from:ctx.accounts.vault.to_account_info(), to:ctx.accounts.owner_token.to_account_info(), authority:r.to_account_info()
        }, &[seeds]), amount)?;
        ctx.accounts.reserve.available_reserve -= amount; Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeReserve<'info> {
    #[account(mut)] pub owner: Signer<'info>,
    pub mint: Account<'info, Mint>,
    #[account(init,payer=owner,space=8+UserReserve::INIT_SPACE,seeds=[b"reserve",owner.key().as_ref(),mint.key().as_ref()],bump)] pub reserve: Account<'info,UserReserve>,
    #[account(init,payer=owner,associated_token::mint=mint,associated_token::authority=reserve)] pub vault: Account<'info,TokenAccount>,
    pub token_program: Program<'info,Token>, pub associated_token_program:Program<'info,AssociatedToken>, pub system_program:Program<'info,System>,
}
#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)] pub owner:Signer<'info>,
    #[account(mut,seeds=[b"reserve",owner.key().as_ref(),reserve.token_mint.as_ref()],bump=reserve.bump,has_one=owner)] pub reserve:Account<'info,UserReserve>,
    #[account(mut,address=reserve.vault_token_account,token::mint=reserve.token_mint,token::authority=reserve)] pub vault:Account<'info,TokenAccount>,
    #[account(mut,token::mint=reserve.token_mint,token::authority=owner)] pub owner_token:Account<'info,TokenAccount>,
    pub token_program:Program<'info,Token>,
}
#[derive(Accounts)]
#[instruction(session_key:Pubkey,session_id:[u8;32])]
pub struct CreateAllowance<'info> {
    #[account(mut)] pub owner:Signer<'info>,
    #[account(mut,seeds=[b"reserve",owner.key().as_ref(),reserve.token_mint.as_ref()],bump=reserve.bump,has_one=owner)] pub reserve:Account<'info,UserReserve>,
    #[account(init,payer=owner,space=8+OfflineAllowance::INIT_SPACE,seeds=[b"allowance",reserve.key().as_ref(),session_id.as_ref()],bump)] pub allowance:Account<'info,OfflineAllowance>,
    pub system_program:Program<'info,System>,
}
#[derive(Accounts)]
#[instruction(domain:[u8;18],intent:IntentData)]
pub struct Settle<'info> {
    #[account(mut)] pub merchant:Signer<'info>,
    #[account(seeds=[b"reserve",reserve.owner.as_ref(),reserve.token_mint.as_ref()],bump=reserve.bump)] pub reserve:Account<'info,UserReserve>,
    #[account(mut,seeds=[b"allowance",reserve.key().as_ref(),allowance.session_id.as_ref()],bump=allowance.bump,has_one=reserve)] pub allowance:Account<'info,OfflineAllowance>,
    #[account(mut,address=reserve.vault_token_account,token::mint=reserve.token_mint,token::authority=reserve)] pub vault:Account<'info,TokenAccount>,
    #[account(mut,token::mint=reserve.token_mint,token::authority=merchant)] pub merchant_token:Account<'info,TokenAccount>,
    #[account(init,payer=merchant,space=8+SettlementReceipt::INIT_SPACE,seeds=[b"receipt",allowance.key().as_ref(),intent.nonce.as_ref()],bump)] pub receipt:Account<'info,SettlementReceipt>,
    /// CHECK: fixed instructions sysvar; validated by address and checked loader.
    #[account(address=anchor_lang::solana_program::sysvar::instructions::ID)] pub instructions:UncheckedAccount<'info>,
    pub token_program:Program<'info,Token>, pub system_program:Program<'info,System>,
}
#[derive(Accounts)]
pub struct CancelAllowance<'info> {
    pub owner:Signer<'info>,
    #[account(mut,seeds=[b"reserve",owner.key().as_ref(),reserve.token_mint.as_ref()],bump=reserve.bump,has_one=owner)] pub reserve:Account<'info,UserReserve>,
    #[account(mut,seeds=[b"allowance",reserve.key().as_ref(),allowance.session_id.as_ref()],bump=allowance.bump,has_one=reserve,has_one=owner)] pub allowance:Account<'info,OfflineAllowance>,
}
#[account] #[derive(InitSpace)]
pub struct UserReserve { pub owner:Pubkey,pub token_mint:Pubkey,pub vault_token_account:Pubkey,pub network:[u8;32],pub total_deposited:u64,pub available_reserve:u64,pub created_at:i64,pub bump:u8 }
#[account] #[derive(InitSpace)]
pub struct OfflineAllowance {pub owner:Pubkey,pub session_public_key:Pubkey,pub reserve:Pubkey,pub session_id:[u8;32],pub maximum_amount:u64,pub spent_amount:u64,pub expires_at:i64,pub status:u8,pub settled_count:u64,pub bump:u8}
#[account] #[derive(InitSpace)]
pub struct SettlementReceipt {pub payment_intent_hash:[u8;32],pub merchant:Pubkey,pub amount:u64,pub allowance:Pubkey,pub nonce:[u8;32],pub settled_at:i64}
#[derive(AnchorSerialize,AnchorDeserialize,Clone)]
pub struct IntentData {pub network:[u8;32],pub program:Pubkey,pub reserve:Pubkey,pub allowance:Pubkey,pub consumer:Pubkey,pub session_public_key:Pubkey,pub merchant:Pubkey,pub currency_mint:Pubkey,pub amount:u64,pub nonce:[u8;32],pub issued_at:i64,pub expires_at:i64,pub sequence:u64,pub display_amount_minor:u64,pub fx_quote_id:[u8;32],pub device_id_hash:[u8;32]}
impl IntentData { pub fn canonical(&self)->Vec<u8>{let mut out=b"ShimoPay/Solana/v2".to_vec();self.serialize(&mut out).expect("fixed-size serialization");out} }
fn verify_ed25519(sysvar:&AccountInfo, signer:&Pubkey, message:&[u8])->Result<()> {
    let current=load_current_index_checked(sysvar)?;
    require!(current>0,PayError::InvalidSignature);
    let ix=load_instruction_at_checked((current-1) as usize,sysvar)?;
    require!(ix.program_id==ed25519_program::ID && ix.accounts.is_empty(),PayError::InvalidSignature);
    let d=&ix.data;
    require!(d.len()>=16 && d[0]==1 && d[1]==0,PayError::InvalidSignature);
    let u16_at=|offset:usize|u16::from_le_bytes([d[offset],d[offset+1]]) as usize;
    let sig=u16_at(2);let pk=u16_at(6);let msg=u16_at(10);let size=u16_at(12);
    require!(u16_at(4)==65535 && u16_at(8)==65535 && u16_at(14)==current as usize && msg==8,PayError::InvalidSignature);
    require!(sig+64<=d.len() && pk+32<=d.len(),PayError::InvalidSignature);
    let settlement=load_instruction_at_checked(current as usize,sysvar)?;
    require!(settlement.program_id==crate::ID && msg+size<=settlement.data.len(),PayError::InvalidSignature);
    require!(d[pk..pk+32]==signer.to_bytes() && size==message.len() && settlement.data[msg..msg+size]==*message,PayError::InvalidSignature);
    Ok(())
}
#[event] pub struct ReserveDeposited {pub reserve:Pubkey,pub owner:Pubkey,pub amount:u64}
#[event] pub struct AllowanceCreated {pub allowance:Pubkey,pub reserve:Pubkey,pub session_public_key:Pubkey,pub maximum_amount:u64,pub expires_at:i64}
#[event] pub struct PaymentSettled {pub receipt:Pubkey,pub allowance:Pubkey,pub merchant:Pubkey,pub amount:u64,pub payment_intent_hash:[u8;32]}
#[event] pub struct AllowanceReleased {pub allowance:Pubkey,pub amount:u64,pub status:u8}
#[error_code]
pub enum PayError {
 #[msg("Invalid amount")] InvalidAmount,
 #[msg("Arithmetic overflow")] Arithmetic,
 #[msg("Insufficient reserve")] InsufficientReserve,
 #[msg("Wrong session key")] WrongSessionKey,
 #[msg("Intent or allowance expired")] Expired,
 #[msg("Inactive allowance")] InactiveAllowance,
 #[msg("Wrong consumer")] WrongOwner,
 #[msg("Wrong merchant")] WrongMerchant,
 #[msg("Wrong mint")] WrongMint,
 #[msg("Wrong reserve")] WrongReserve,
 #[msg("Wrong allowance")] WrongAllowance,
 #[msg("Wrong network or program")] WrongDomain,
 #[msg("Insufficient allowance remaining")] AllowanceExceeded,
 #[msg("Invalid signature or canonical message")] InvalidSignature,
}
