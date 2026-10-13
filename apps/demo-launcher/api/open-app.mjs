import {getRunningDemo} from './start-demo.mjs';
export default async function handler(request,response){
 response.setHeader('Cache-Control','no-store');
 try{const demo=await getRunningDemo();const url=new URL(demo.url);url.pathname=request.query.role==='merchant'?'/app/merchant':'/app';return response.redirect(302,url.href);}
 catch{return response.status(503).send('ShimoPay is starting. Please try again shortly.');}
}
