import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'What is multi-tenant isolation and how does Sarnik implement it?',
    a: 'Multi-tenancy means each company on Sarnik gets a completely isolated environment. Every database query is filtered by company_id, so one company can never access another\'s data. SuperAdmins have platform-wide visibility, while all other roles are strictly scoped to their tenant.',
  },
  {
    q: 'Can I try Sarnik before committing to a paid plan?',
    a: 'Absolutely! Every plan starts with a 14-day free trial. No credit card required. You can onboard your full team, explore all features, and decide which plan fits your organization — completely risk free.',
  },
  {
    q: 'How does role-based access control work?',
    a: 'Sarnik has 4 built-in roles: SuperAdmin (platform-wide), Admin (company-wide), Production (production jobs only), and Designer/Employee (personal jobs). Each role sees exactly what it needs, nothing more.',
  },
  {
    q: 'Is my data secure on Sarnik?',
    a: 'Yes. Sarnik uses JWT access + refresh token rotation, Helmet.js security headers, XSS sanitization, rate limiting, Content Security Policy, and full audit logging. Every action is recorded with user, IP, and timestamp.',
  },
  {
    q: 'Can I manage billing and subscriptions for my company?',
    a: 'SuperAdmins manage all tenant subscriptions, plans, renewals, and billing from a centralized console. You can create, update, suspend, or renew any company subscription, with full revenue analytics.',
  },
  {
    q: 'Does Sarnik support large teams across multiple departments?',
    a: 'Yes — Sarnik scales from 5 to 5,000+ users with no performance degradation. Production, design, finance, and admin departments all work within the same unified platform, with isolated access.',
  },
  {
    q: 'Can we integrate Sarnik with our existing tools?',
    a: 'Growth and Enterprise plans include full API access for custom integrations. Connect your CRM, ERP, or any third-party tool via REST API. Enterprise customers get dedicated integration support.',
  },
];

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div className="faq-item">
      <button
        className="w-full flex items-center justify-between py-5 px-4 text-left group"
        onClick={onToggle}
      >
        <span className={`text-sm font-semibold pr-4 transition-colors ${isOpen ? 'text-indigo-400' : 'text-slate-200 group-hover:text-white'}`}>
          {item.q}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className={`flex-shrink-0 w-6 h-6 rounded-full glass flex items-center justify-center ${isOpen ? 'text-indigo-400' : 'text-slate-500'}`}
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="text-slate-400 text-sm leading-relaxed px-4 pb-5">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <section className="relative z-10 py-28 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-5">
            <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-xs text-slate-400 font-medium">Common Questions</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
            Got <span className="gradient-text">Questions?</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-lg">
            Everything you need to know before you get started.
          </p>
        </motion.div>

        {/* FAQ items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass rounded-2xl overflow-hidden border border-white/5"
        >
          {faqs.map((item, i) => (
            <FaqItem
              key={i}
              item={item}
              isOpen={openIdx === i}
              onToggle={() => setOpenIdx(openIdx === i ? null : i)}
            />
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-slate-500 text-sm mt-8"
        >
          Still have questions?{' '}
          <a href="mailto:support@sarnik.com" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Contact our team
          </a>
        </motion.p>
      </div>
    </section>
  );
}
