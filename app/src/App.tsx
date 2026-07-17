import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import Layout from '@/components/Layout';
import ScrollToTop from '@/components/ScrollToTop';
import Home from '@/pages/Home';

// Public routes below the fold / rarely hit first are code-split so the entry
// chunk stays small. Home stays eager because it is the landing experience.
const Artists = lazy(() => import('@/pages/Artists'));
const ArtistProfile = lazy(() => import('@/pages/ArtistProfile'));
const Locations = lazy(() => import('@/pages/Locations'));
const Studios = lazy(() => import('@/pages/Studios'));
const Safety = lazy(() => import('@/pages/Safety'));
const Pricing = lazy(() => import('@/pages/Pricing'));
const FAQ = lazy(() => import('@/pages/FAQ'));
const HowItWorks = lazy(() => import('@/pages/HowItWorks'));
const Contact = lazy(() => import('@/pages/Contact'));
const Login = lazy(() => import('@/pages/Login'));
const Inspiration = lazy(() => import('@/pages/Inspiration'));
const StudioProfile = lazy(() => import('@/pages/StudioProfile'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const Terms = lazy(() => import('@/pages/Terms'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Booking = lazy(() => import('@/pages/Booking'));
const LocationPage = lazy(() => import('@/pages/LocationPage'));
const StudioApply = lazy(() => import('@/pages/StudioApply'));
const ArtistDashboard = lazy(() => import('@/pages/ArtistDashboard'));
const ArtistProfileBuilder = lazy(() => import('@/pages/ArtistProfileBuilder'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const AdminArtists = lazy(() => import('@/pages/AdminArtists'));
const AdminBookings = lazy(() => import('@/pages/AdminBookings'));
const AdminCommissions = lazy(() => import('@/pages/AdminCommissions'));
const AdminApplications = lazy(() => import('@/pages/AdminApplications'));
const AdminPricing = lazy(() => import('@/pages/AdminPricing'));

function RouteFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-champagne-gold/30 border-t-champagne-gold rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Main layout wraps customer-facing pages */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/artists" element={<Artists />} />
          <Route path="/artists/:slug" element={<ArtistProfile />} />
          <Route path="/studios" element={<Studios />} />
          <Route path="/studios/:id" element={<StudioProfile />} />
          <Route path="/locations" element={<Locations />} />
          <Route path="/locations/:slug" element={<LocationPage />} />
          <Route path="/safety" element={<Safety />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/price-calculator" element={<Navigate to="/pricing" replace />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/inspiration" element={<Inspiration />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
        </Route>

        {/* Booking — uses Layout but needs slug */}
        <Route element={<Layout />}>
          <Route path="/booking/:slug" element={<Booking />} />
        </Route>

        {/* Auth & standalone pages — no Layout */}
        <Route path="/login" element={<Login />} />

        {/* Studio Partner Application — no Layout (has own nav) */}
        <Route path="/studio/apply" element={<StudioApply />} />
        <Route path="/artist/apply" element={<Navigate to="/studio/apply" replace />} />

        {/* Artist Portal — no Layout (has own nav); for artists onboarded inside a studio */}
        <Route path="/artist/dashboard" element={<ArtistDashboard />} />
        <Route path="/artist/profile" element={<ArtistProfileBuilder />} />

        {/* Admin — no Layout (has own nav) */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/artists" element={<AdminArtists />} />
        <Route path="/admin/applications" element={<AdminApplications />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
        <Route path="/admin/commissions" element={<AdminCommissions />} />
        <Route path="/admin/pricing" element={<AdminPricing />} />

        {/* Catch-all: real 404 page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </>
  );
}
