export interface ChainTransfer {source:string;destination:string;sourceOwner:string|null;destinationOwner:string|null;amount:string;decimals:number;asset:string;mint:string|null;}
export interface ChainReceipt {signature:string;network:'devnet';status:'submitted'|'confirmed'|'finalized'|'failed'|'unavailable';slot:number|null;blockTime:number|null;feeLamports:string|null;feePayer:string|null;transfers:ChainTransfer[];checkedAt:number;detailsAvailable:boolean;executionFailed:boolean;}
export function decimalAmount(raw:string,decimals:number){const digits=raw.padStart(decimals+1,'0');if(!decimals)return digits;return digits.slice(0,-decimals)+','+digits.slice(-decimals).replace(/0+$/,'').padEnd(2,'0');}
export const shortAddress=(address:string)=>address.slice(0,5)+'…'+address.slice(-5);
export const chainStatus={submitted:'Enviada',confirmed:'Confirmada',finalized:'Finalizada',failed:'Falhou',unavailable:'Não localizada'};

export interface ReceiptEntry {signature:string;slot:number;blockTime:number|null;status:ChainReceipt['status'];}
