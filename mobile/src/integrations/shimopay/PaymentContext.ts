import {createContext,useContext} from 'react';
import type {PaymentValue} from './PaymentProvider';
export const PaymentContext=createContext<PaymentValue|null>(null);
export function usePayment(){const value=useContext(PaymentContext);if(!value)throw new Error('Missing PaymentProvider');return value;}
