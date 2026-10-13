import type {Metadata,Viewport} from 'next';
import './globals.css';
import './pitch/pitch.css';
export const metadata:Metadata={title:'ShimoPay — Payments that don’t stop',description:'Escrow-backed offline authorization. Online settlement. Demo funds only.',manifest:'/manifest.webmanifest',appleWebApp:{capable:true,title:'ShimoPay'}};
export const viewport:Viewport={themeColor:'#183f35',width:'device-width',initialScale:1};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
