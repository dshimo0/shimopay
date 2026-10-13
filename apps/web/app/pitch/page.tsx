import type {Metadata} from 'next';
import Pitch from './Pitch';
import PitchActions from './PitchActions';
export const metadata:Metadata={title:'ShimoPay — Pitch deck',description:'Identidade, autorização offline e escrow programável. Conheça a tese, o produto e o modelo de negócio do ShimoPay.'};
export default function PitchPage(){return <><Pitch/><PitchActions/></>;}
