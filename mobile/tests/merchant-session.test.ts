import {it,expect} from 'vitest';
import {merchantSessionAddress,publicPaymentError} from '../src/integrations/shimopay/model';
it('validates merchant session before RPC and accepts only 32-byte base58 addresses',()=>{for(const value of ['', 'abc','0'.repeat(44),'1'.repeat(33)])expect(()=>merchantSessionAddress(value)).toThrow('sessão válido');const id='6ALcjFgtB9GboxJgBT3HNXbkex3rJkSQ6rsZYhN9XJWs';expect(merchantSessionAddress(' '+id+' ')).toBe(id);});
it('does not expose raw validation internals in product messages',()=>{expect(publicPaymentError('[{"code":"too_small","path":["id"]}]')).toContain('Confira o QR');expect(publicPaymentError('Invalid signature')).toBe('Invalid signature');});
