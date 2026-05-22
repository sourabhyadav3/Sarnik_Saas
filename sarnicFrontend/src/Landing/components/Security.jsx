import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, FileText, Eye, RefreshCw, Globe } from 'lucide-react';

const securityItems = [
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Tenant Isolation',
    desc: 'Every company is sandboxed. company_id enforced at every DB query. Zero crossover.',
    color: 'text-indigo-400',
    glow: 'rgba(99,102,241,0.15)',
    border: 'rgba(99,102,241,0.25)',
  },
  {
    icon: <RefreshCw className="w-6 h-6" />,
    title: 'Token Rotation',
    desc: 'JWT refresh token rotation with theft detection. Compromised sessions purged instantly.',
    color: 'text-emerald-400',
    glow: 'rgba(16,185,129,0.15)',
    border: 'rgba(16,185,129,0.25)',
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: 'Rate Limiting',
    desc: 'Auth endpoints: 20 req/15min. API endpoints: 300 req/15min. Brute force blocked.',
    color: 'text-amber-400',
    glow: 'rgba(245,158,11,0.15)',
    border: 'rgba(245,158,11,0.25)',
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: 'Audit Logging',
    desc: 'Every create, update, delete is logged with user, IP, timestamp, and payload context.',
    color: 'text-purple-400',
    glow: 'rgba(168,85,247,0.15)',
    border: 'rgba(168,85,247,0.25)',
  },
  {
    icon: <Eye className="w-6 h-6" />,
    title: 'XSS Sanitization',
    desc: 'Recursive payload sanitizer strips script tags and javascript: schemes before routing.',
    color: 'text-rose-400',
    glow: 'rgba(244,63,94,0.15)',
    border: 'rgba(244,63,94,0.25)',
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: 'Secure Headers',
    desc: 'Helmet.js + custom CSP, HSTS, X-Frame-Options, X-XSS-Protection enforced globally.',
    color: 'text-sky-400',
    glow: 'rgba(56,189,248,0.15)',
    border: 'rgba(56,189,248,0.25)',
  },
];

export default function Security() {
  return (
    <section id="security" className="relative z-10 py-6 px-6">
      <div className="max-w-full px-6 md:px-12 lg:px-20 mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-3">
            <Shield className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-xs text-slate-400 font-medium">Enterprise Security</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
            Security <span className="gradient-text">Built Deep</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-lg">
            Enterprise-grade protection at every layer. Not an afterthought — a foundation.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {securityItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6, scale: 1.01 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08, type: 'spring', stiffness: 300, damping: 20 }}
              className="glass rounded-2xl p-6 cursor-pointer"
              style={{
                boxShadow: `0 0 0 1px ${item.border}`,
                background: `radial-gradient(ellipse at top left, ${item.glow} 0%, rgba(2,8,23,0) 60%)`,
              }}
            >
              {/* Animated shield icon */}
              <div className="relative w-12 h-12 mb-4">
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
                  className="absolute inset-0 rounded-xl"
                  style={{ background: item.glow }}
                />
                <div className={`relative w-12 h-12 glass rounded-xl flex items-center justify-center ${item.color}`}>
                  {item.icon}
                </div>
              </div>
              <h3 className="text-white font-bold text-base mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>

              {/* Progress bar visual */}
              <div className="mt-4">
                <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: i * 0.1 + 0.5 }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${item.glow}, transparent)`, borderRight: `2px solid ${item.border}` }}
                  />
                </div>
                <div className={`text-xs mt-1.5 font-semibold ${item.color}`}>Protected</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Big trust badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 glass rounded-2xl p-8 text-center border border-white/5"
        >
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
            <span className="text-emerald-400 text-sm font-semibold">All Systems Operational</span>
          </div>
          <div className="text-white font-bold text-xl mb-1">99.9% Platform Uptime SLA</div>
          <div className="text-slate-400 text-sm">Real-time monitoring, zero-downtime deployments, auto-failover configured.</div>
        </motion.div>
      </div>
    </section>
  );
}
