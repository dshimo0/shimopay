export interface RailRecord {id:string;rail:'pix'|'card';amountMinor:number;status:string;createdAt:number;}
const key='shimopay-rail-history-v1';
export function railHistory():RailRecord[]{try{return JSON.parse(localStorage.getItem(key)??'[]');}catch{return [];}}
export function saveRailRecord(record:Omit<RailRecord,'createdAt'>){const all=railHistory(),existing=all.find(r=>r.id===record.id&&r.rail===record.rail);localStorage.setItem(key,JSON.stringify([...all.filter(r=>r!==existing),{...record,createdAt:existing?.createdAt??Date.now()}]));window.dispatchEvent(new Event('shimopay-rail-history'));}
