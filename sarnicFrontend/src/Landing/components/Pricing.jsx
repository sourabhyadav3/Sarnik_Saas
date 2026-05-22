import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Starter',
    monthlyPrice: 29,
    yearlyPrice: 23,
    desc: 'Perfect for small teams getting started.',
    color: 'text-slate-300',
    border: 'border-white/10',
    glow: '',
    features: [
      'Up to 10 users',
      'Up to 5 projects',
      '5GB storage',
      'Basic analytics',
      'Email support',
      'Standard reports',
    ],
    popular: false,
    cta: 'Get Started',
    ctaClass: 'btn-outline-glow text-slate-300',
  },
  {
    name: 'Growth',
    monthlyPrice: 79,
    yearlyPrice: 63,
    desc: 'For growing teams with advanced needs.',
    color: 'text-indigo-400',
    border: 'border-indigo-500/40',
    glow: 'pricing-popular',
    features: [
      'Up to 100 users',
      'Unlimited projects',
      '50GB storage',
      'Advanced analytics',
      'Priority support',
      'Audit logs',
      'Custom roles',
      'API access',
    ],
    popular: true,
    cta: 'Start Free Trial',
    ctaClass: 'btn-primary-glow text-white',
  },
  {
    name: 'Enterprise',
    monthlyPrice: 199,
    yearlyPrice: 159,
    desc: 'For large organizations with full control.',
    color: 'text-emerald-400',
    border: 'border-emerald-500/20',
    glow: '',
    features: [
      'Unlimited users',
      'Unlimited everything',
      'Unlimited storage',
      'Custom analytics',
      'Dedicated support',
      'Full audit logs',
      'SSO & SAML',
      'SLA guarantee',
      'On-premise option',
    ],
    popular: false,
    cta: 'Contact Sales',
    ctaClass: 'btn-outline-glow text-emerald-400',
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="relative z-10 py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-5">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs text-slate-400 font-medium">Simple Pricing</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
            Choose Your <span className="gradient-text">Growth Plan</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-lg mb-8">
            No hidden fees. No long contracts. Cancel anytime.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-4 glass rounded-full px-5 py-2">
            <button
              onClick={() => setYearly(false)}
              className={`text-sm font-medium transition-colors ${!yearly ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(!yearly)}
              className="w-12 h-6 rounded-full bg-indigo-500/30 relative transition-colors hover:bg-indigo-500/50"
            >
              <motion.div
                animate={{ x: yearly ? 24 : 2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="w-4 h-4 bg-indigo-400 rounded-full absolute top-1 shadow-lg"
              />
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`text-sm font-medium transition-colors ${yearly ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Yearly
              <span className="ml-2 text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">-20%</span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`pricing-card glass rounded-2xl p-7 border ${plan.border} ${plan.glow} relative ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <div className={`text-sm font-semibold ${plan.color} mb-1`}>{plan.name}</div>
              <div className="text-slate-400 text-xs mb-4">{plan.desc}</div>

              <div className="flex items-end gap-1 mb-6">
                <span className="text-white text-5xl font-black">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={yearly ? 'y' : 'm'}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="inline-block"
                    >
                      ${yearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <span className="text-slate-500 text-sm mb-2">/mo</span>
              </div>

              <Link
                to="/login"
                className={`w-full block text-center py-3 rounded-xl text-sm font-semibold mb-6 ${plan.ctaClass}`}
              >
                {plan.cta}
              </Link>

              <div className="space-y-3">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${plan.popular ? 'bg-indigo-500/20' : 'bg-white/5'}`}>
                      <Check className={`w-2.5 h-2.5 ${plan.popular ? 'text-indigo-400' : 'text-emerald-400'}`} />
                    </div>
                    <span className="text-slate-300 text-sm">{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-slate-500 text-sm mt-8"
        >
          All plans include 14-day free trial. No credit card required.
        </motion.p>
      </div>
    </section>
  );
}
