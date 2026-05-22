import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CTA() {
  return (
    <section className="relative z-10 py-6 px-6 overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.10) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      <div className="max-w-full px-6 md:px-12 lg:px-20 mx-auto text-center relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="glass-strong rounded-3xl p-6 sm:p-10 border border-indigo-500/20"
          style={{ boxShadow: '0 0 80px rgba(99,102,241,0.12), 0 0 160px rgba(99,102,241,0.05)' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
            <span className="text-xs text-slate-300 font-medium">14-Day Free Trial — No Credit Card</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-5 leading-tight"
          >
            Ready to Transform
            <br />
            <span className="gradient-text">Your Business?</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 text-base sm:text-lg md:text-xl mb-10 max-w-xl mx-auto"
          >
            Join 500+ companies already running on Sarnik. Set up in minutes, scale to thousands.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/login"
              className="btn-primary-glow text-white font-bold px-10 py-4 rounded-xl flex items-center justify-center gap-2 text-base w-full sm:w-auto"
            >
              <Zap className="w-5 h-5" />
              Start Free Trial
              <ChevronRight className="w-5 h-5" />
            </Link>
            <button className="btn-outline-glow text-slate-300 hover:text-white font-semibold px-10 py-4 rounded-xl text-base w-full sm:w-auto">
              Book a Demo
            </button>
          </motion.div>

          {/* Trust line */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-center justify-center gap-6 mt-10 flex-wrap"
          >
            {['No credit card required', '99.9% uptime SLA', 'Cancel anytime', 'GDPR compliant'].map(t => (
              <div key={t} className="flex items-center gap-1.5 text-slate-500 text-sm">
                <div className="w-1 h-1 rounded-full bg-slate-600" />
                {t}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
