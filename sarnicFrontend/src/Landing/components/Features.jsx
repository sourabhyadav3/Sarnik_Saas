import React from 'react';
import { motion } from 'framer-motion';
import {
  Users, Workflow, Shield, BarChart3, FileText,
  Lock, CreditCard, UserCheck, Zap, ArrowRight
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar } from 'recharts';

const miniData1 = [{ v: 4 }, { v: 8 }, { v: 6 }, { v: 12 }, { v: 9 }, { v: 15 }];
const miniData2 = [{ v: 3 }, { v: 7 }, { v: 5 }, { v: 9 }, { v: 11 }, { v: 8 }];

const features = [
  {
    icon: <Users className="w-6 h-6" />,
    color: 'text-indigo-400',
    glow: 'rgba(99,102,241,0.15)',
    border: 'rgba(99,102,241,0.2)',
    title: 'Employee Management',
    desc: 'Manage your entire workforce with role-based profiles, departments, and activity tracking.',
    span: 'col-span-1',
    chart: true,
    chartColor: '#6366f1',
    chartData: miniData1,
  },
  {
    icon: <Workflow className="w-6 h-6" />,
    color: 'text-emerald-400',
    glow: 'rgba(16,185,129,0.15)',
    border: 'rgba(16,185,129,0.2)',
    title: 'Production Workflow',
    desc: 'End-to-end job tracking from creation to delivery with real-time status updates and time logs.',
    span: 'col-span-2',
    chart: false,
    extra: true,
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'text-amber-400',
    glow: 'rgba(245,158,11,0.15)',
    border: 'rgba(245,158,11,0.2)',
    title: 'Smart Analytics',
    desc: 'Revenue trends, team KPIs, subscription health, and growth velocity — all in real time.',
    span: 'col-span-2',
    chart: true,
    chartColor: '#f59e0b',
    chartData: miniData2,
    bar: true,
  },
  {
    icon: <Shield className="w-6 h-6" />,
    color: 'text-purple-400',
    glow: 'rgba(168,85,247,0.15)',
    border: 'rgba(168,85,247,0.2)',
    title: 'Tenant Isolation',
    desc: 'Each company has completely isolated data, users, and configs. Zero data leakage.',
    span: 'col-span-1',
    chart: false,
  },
  {
    icon: <FileText className="w-6 h-6" />,
    color: 'text-sky-400',
    glow: 'rgba(56,189,248,0.15)',
    border: 'rgba(56,189,248,0.2)',
    title: 'Audit Logs',
    desc: 'Every action logged with user context, IP, timestamp, and module — full accountability.',
    span: 'col-span-1',
    chart: false,
  },
  {
    icon: <Lock className="w-6 h-6" />,
    color: 'text-rose-400',
    glow: 'rgba(244,63,94,0.15)',
    border: 'rgba(244,63,94,0.2)',
    title: 'Secure Auth',
    desc: 'JWT rotation, refresh tokens, brute-force protection, XSS sanitization, and rate limiting.',
    span: 'col-span-1',
    chart: false,
  },
  {
    icon: <CreditCard className="w-6 h-6" />,
    color: 'text-teal-400',
    glow: 'rgba(20,184,166,0.15)',
    border: 'rgba(20,184,166,0.2)',
    title: 'Subscription Billing',
    desc: 'Manage SaaS plans, renewals, expirations, and company billing in one unified console.',
    span: 'col-span-2',
    chart: false,
    billing: true,
  },
  {
    icon: <UserCheck className="w-6 h-6" />,
    color: 'text-orange-400',
    glow: 'rgba(249,115,22,0.15)',
    border: 'rgba(249,115,22,0.2)',
    title: 'Role-Based Access',
    desc: 'SuperAdmin, Admin, Production, Designer — granular permission layers built in.',
    span: 'col-span-1',
    chart: false,
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const roles = ['Super Admin', 'Admin', 'Production', 'Designer'];

const plans = ['Starter', 'Growth', 'Enterprise'];

export default function Features() {
  return (
    <section id="features" className="relative z-10 py-28 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-5">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs text-slate-400 font-medium">Everything You Need</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
            Built for <span className="gradient-text">Enterprise Scale</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-lg">
            A complete toolkit for managing people, projects, production, and revenue at scale.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`bento-card glass rounded-2xl p-6 ${f.span} relative overflow-hidden`}
              style={{
                boxShadow: `0 0 0 1px ${f.border}`,
                background: `radial-gradient(ellipse at top left, ${f.glow} 0%, rgba(2,8,23,0.0) 60%)`,
              }}
            >
              {/* Hover glow overlay */}
              <motion.div
                className="absolute inset-0 opacity-0 rounded-2xl pointer-events-none"
                whileHover={{ opacity: 1 }}
                style={{ background: `radial-gradient(circle at 50% 0%, ${f.glow} 0%, transparent 70%)` }}
              />

              <div className={`w-10 h-10 rounded-xl glass flex items-center justify-center mb-4 ${f.color}`}>
                {f.icon}
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>

              {/* Mini Chart */}
              {f.chart && !f.bar && (
                <div className="mt-4 h-16 opacity-60">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <AreaChart data={f.chartData}>
                      <defs>
                        <linearGradient id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={f.chartColor} stopOpacity={0.4} />
                          <stop offset="95%" stopColor={f.chartColor} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="v" stroke={f.chartColor} strokeWidth={1.5} fill={`url(#grad${i})`} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
              {f.chart && f.bar && (
                <div className="mt-4 h-16 opacity-60">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart data={f.chartData}>
                      <Bar dataKey="v" fill={f.chartColor} radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Workflow extra (for Production card) */}
              {f.extra && (
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  {['Create Job', 'Assign', 'In Progress', 'Review', 'Complete'].map((s, si) => (
                    <React.Fragment key={s}>
                      <span className="text-xs text-slate-400 bg-white/5 rounded-full px-3 py-1">{s}</span>
                      {si < 4 && <ArrowRight className="w-3 h-3 text-slate-600" />}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* Billing extra */}
              {f.billing && (
                <div className="mt-4 flex gap-3">
                  {plans.map((p, pi) => (
                    <div key={p} className={`flex-1 text-center py-2 rounded-lg text-xs font-semibold ${pi === 1 ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-white/5 text-slate-400'}`}>
                      {p}
                    </div>
                  ))}
                </div>
              )}

              {/* Role badges for RBAC card */}
              {f.title === 'Role-Based Access' && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {roles.map((r) => (
                    <span key={r} className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-slate-400 border border-white/10">{r}</span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
