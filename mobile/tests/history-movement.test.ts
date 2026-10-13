import {describe,it,expect} from 'vitest';
import {historyMovements} from '../src/integrations/shimopay/historyMovement';
import type {ChainReceipt} from '../src/integrations/shimopay/chainReceipt';
const receipt=(from:string,to:string,amount='20000000'):ChainReceipt=>({signature:'s',network:'devnet',status:'finalized',slot:1,blockTime:1,feeLamports:'5000',feePayer:'payer',checkedAt:1,detailsAvailable:true,executionFailed:false,transfers:[{source:'ata1',destination:'ata2',sourceOwner:from,destinationOwner:to,amount,decimals:6,asset:'USDC',mint:'usdc'}]});
describe('wallet-relative history',()=>{
 it('shows exact incoming and outgoing amounts',()=>{expect(historyMovements(receipt('other','payer'),'payer')[0].value).toBe('+20,00 USDC');expect(historyMovements(receipt('payer','merchant','181819'),'payer')[0].value).toBe('−0,181819 USDC');});
 it('separates reserve moves from spending',()=>{expect(historyMovements(receipt('payer','reserve'),'payer','reserve')[0].direction).toBe('internal');expect(historyMovements(receipt('reserve','merchant'),'payer','reserve')[0].direction).toBe('out');expect(historyMovements(receipt('reserve','merchant'),'merchant')[0].direction).toBe('in');});
 it('never books failed or unrelated transfers',()=>{expect(historyMovements({...receipt('payer','merchant'),executionFailed:true},'payer')).toEqual([]);expect(historyMovements(receipt('other','merchant'),'payer')).toEqual([]);});
 it('nets multiple transfers in same asset without floating point',()=>{const r=receipt('payer','merchant');r.transfers.push(...receipt('merchant','payer','1').transfers);expect(historyMovements(r,'payer')[0].value).toBe('−19,999999 USDC');});
});
