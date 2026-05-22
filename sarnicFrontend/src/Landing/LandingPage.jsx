import React, { useEffect } from 'react';
import './landing.css';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Analytics from './components/Analytics';
import Architecture from './components/Architecture';
import Timeline from './components/Timeline';
import Pricing from './components/Pricing';
import Security from './components/Security';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import CTA from './components/CTA';
import Footer from './components/Footer';

export default function LandingPage() {
  // Prevent the existing app layout from mounting
  useEffect(() => {
    document.title = 'Sarnik — Enterprise SaaS Platform';
  }, []);

  return (
    <div className="landing-root">
      {/* Fixed backgrounds */}
      <div className="grid-bg" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Page sections */}
      <Navbar />
      <Hero />
      <Features />
      <Analytics />
      <Architecture />
      <Timeline />
      <Pricing />
      <Security />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
