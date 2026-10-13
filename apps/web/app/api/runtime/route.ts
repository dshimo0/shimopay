import {NextResponse,type NextRequest} from 'next/server';
import {mpCapabilities} from '../../../../../packages/sdk/src/mp-capabilities';
import {pixProviderError} from '../../../../../packages/sdk/src/fiat';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(req:NextRequest){const hostname=new URL(`http://${req.headers.get('host')??'invalid'}`).hostname;if(!['localhost','127.0.0.1','[::1]'].includes(hostname))return new NextResponse(null,{status:404});if(req.nextUrl.searchParams.get('diagnostic')==='capabilities')return NextResponse.json(await mpCapabilities(process.env.MERCADOPAGO_ACCESS_TOKEN??'',process.env.MERCADOPAGO_TEST_PAYER_EMAIL??''),{headers:{'Cache-Control':'no-store'}});if(req.nextUrl.searchParams.get('diagnostic')==='pix'){
 const token=process.env.MERCADOPAGO_ACCESS_TOKEN;
 if(!token)return NextResponse.json({configured:false});
 const response=await fetch('https://api.mercadopago.com/users/me',{headers:{Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(20000)});
 if(!response.ok)return NextResponse.json({stage:'users/me',...await pixProviderError(response)});
 const account=await response.json();
 const buyerResponse=await fetch('https://api.mercadopago.com/users/3758554146',{headers:{Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(20000)});
 const buyer=buyerResponse.ok?await buyerResponse.json():null;
 const testEmail=typeof buyer?.email==='string'&&/^[^@\s]+@testuser\.com$/.test(buyer.email)?buyer.email:null;
 return NextResponse.json({buyerLookupHttp:buyerResponse.status,buyerEmailAvailable:Boolean(testEmail),buyerEmailMatches:testEmail?testEmail===process.env.MERCADOPAGO_TEST_PAYER_EMAIL:null,confirmedBuyerTestEmail:testEmail,stage:'users/me',http:response.status,isExpectedSeller:String(account.id)==='3758554144',isTestUser:Array.isArray(account.tags)&&account.tags.includes('test_user')},{headers:{'Cache-Control':'no-store'}});
 }return NextResponse.json({fingerprint:process.env.SHIMOPAY_RUNTIME_FINGERPRINT??null},{headers:{'Cache-Control':'no-store'}});}
