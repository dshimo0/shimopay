'use client';
import {useEffect} from 'react';
export default function PitchActions(){useEffect(()=>{const print=(event:MouseEvent)=>{if((event.target as Element)?.closest('[data-print-pitch]'))window.print();};document.addEventListener('click',print);return()=>document.removeEventListener('click',print);},[]);return null;}
