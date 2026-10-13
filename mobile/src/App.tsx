import { lazy, Suspense, useEffect } from "react";

import { Toaster } from "@/components/ui/toaster";

import { Toaster as Sonner } from "@/components/ui/sonner";

import { TooltipProvider } from "@/components/ui/tooltip";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";

import Landing from "./pages/Landing";

const Payments = lazy(() => import('./pages/payments/MobilePayments'));
const Pitch = lazy(() => import('./pages/payments/Pitch'));

const Auth = lazy(() => import("./pages/Auth"));


const Stores = lazy(() => import("./pages/customer/Stores"));











const NotFound = lazy(() => import("./pages/NotFound"));

const Onboarding = lazy(() => import("./pages/Onboarding"));



const PrivacyPolicy = lazy(() => import("./pages/legal/Legal").then(m => ({ default: m.PrivacyPolicy })));

const TermsOfUse = lazy(() => import("./pages/legal/Legal").then(m => ({ default: m.TermsOfUse })));





import { MockProvider } from "./contexts/MockContext";



const queryClient = new QueryClient();



function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

const App = () => (

  <QueryClientProvider client={queryClient}>

    <MockProvider>

      <TooltipProvider>

        <Toaster />

        <Sonner />

        <BrowserRouter>
          <ScrollToTop />

          <Suspense fallback={<main className="p-8 text-center" role="status">Carregando ShimoPay…</main>}>

          <Routes>

          <Route path="/" element={<Landing />} />
          <Route path="/demo" element={<Payments guided />} />
          <Route path="/pitch" element={<Pitch />} />
          <Route path="/customer/preview" element={<Navigate to="/customer/home" replace />} />
          <Route path="/customer/preview-wallet" element={<Navigate to="/customer/wallet" replace />} />
          <Route path="/customer/preview-pay" element={<Navigate to="/customer/scanner" replace />} />
          <Route path="/customer/preview-qr" element={<Navigate to="/customer/qr" replace />} />
          <Route path="/customer/preview-offline" element={<Navigate to="/customer/offline" replace />} />
          <Route path="/customer/preview-history" element={<Navigate to="/customer/history" replace />} />
          <Route path="/merchant/preview" element={<Navigate to="/merchant/dashboard" replace />} />

          <Route path="/onboarding" element={<Onboarding />} />

          <Route path="/landing" element={<Landing />} />

          <Route path="/auth" element={<Auth />} />

          <Route path="/customer/home" element={<Payments />} />

          <Route path="/customer/stores" element={<Stores />} />

          <Route path="/customer/scanner" element={<Payments initialTab="pay" />} />

          <Route path="/customer/qr" element={<Payments initialTab="pay" />} />

          <Route path="/customer/offline" element={<Payments initialTab="offline" />} />

          <Route path="/customer/profile" element={<Navigate to="/auth" replace />} />

          <Route path="/customer/history" element={<Payments initialTab="history" />} />

          <Route path="/customer/wallet" element={<Payments />} />

          <Route path="/customer/notifications" element={<Payments initialTab="pending" />} />

          <Route path="/merchant/miniapps" element={<Payments role="merchant" initialTab="miniapps" />} />
          <Route path="/merchant/dashboard" element={<Payments role="merchant" />} />

          <Route path="/network" element={<Navigate to="/customer/history" replace />} />

          <Route path="/privacidade" element={<PrivacyPolicy />} />

          <Route path="/termos" element={<TermsOfUse />} />

          <Route path="/admin" element={<Navigate to="/auth" replace />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}

          <Route path="*" element={<NotFound />} />

        </Routes>

          </Suspense>

        </BrowserRouter>

      </TooltipProvider>

    </MockProvider>

  </QueryClientProvider>

);



export default App;
