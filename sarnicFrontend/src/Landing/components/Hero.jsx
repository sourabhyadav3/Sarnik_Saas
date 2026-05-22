import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowUp, Users, DollarSign, Activity, ChevronRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const revenueData = [
  { v: 12 }, { v: 19 }, { v: 15 }, { v: 28 }, { v: 24 },
  { v: 35 }, { v: 32 }, { v: 45 }, { v: 40 }, { v: 52 },
  { v: 48 }, { v: 63 },
];

const floatCards = [
  {
    icon: <DollarSign className="w-4 h-4 text-emerald-400" />,
    label: 'Total Revenue',
    value: '$128,450',
    badge: '+24%',
    badgeColor: 'text-emerald-400',
    bg: 'from-emerald-500/10 to-transparent',
    delay: 0,
    position: 'top-4 -right-6',
  },
  {
    icon: <Users className="w-4 h-4 text-indigo-400" />,
    label: 'Active Users',
    value: '2,847',
    badge: '+12%',
    badgeColor: 'text-indigo-400',
    bg: 'from-indigo-500/10 to-transparent',
    delay: 0.5,
    position: 'bottom-16 -left-8',
  },
  {
    icon: <Activity className="w-4 h-4 text-purple-400" />,
    label: 'Tasks Done',
    value: '18,392',
    badge: 'Today',
    badgeColor: 'text-purple-400',
    bg: 'from-purple-500/10 to-transparent',
    delay: 1,
    position: 'bottom-4 -right-4',
  },
];

// Animated word cycling
const words = ['Projects', 'Teams', 'Production', 'Revenue', 'Growth'];

export default function Hero() {
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setWordIdx(i => (i + 1) % words.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* LEFT — Copy */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
              <span className="text-xs text-slate-300 font-medium">Enterprise SaaS Platform — Live</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl lg:text-7xl font-black text-white leading-[1.05] mb-2"
            >
              Manage Your
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-5xl lg:text-7xl font-black leading-[1.05] mb-2 h-[1.1em] overflow-hidden"
            >
              <motion.span
                key={wordIdx}
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -60, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="gradient-text block"
              >
                {words[wordIdx]}
              </motion.span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-5xl lg:text-7xl font-black text-white leading-[1.05] mb-6"
            >
              Like Never Before.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-slate-400 text-lg leading-relaxed mb-8 max-w-lg"
            >
              Sarnik is a multi-tenant enterprise SaaS that unifies employee management, production workflows, real-time analytics, and subscription billing — all in one blazing-fast platform.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-4 mb-10"
            >
              <Link
                to="/login"
                className="btn-primary-glow text-white font-semibold px-7 py-3.5 rounded-xl flex items-center gap-2 text-sm"
              >
                Start Free Trial <ChevronRight className="w-4 h-4" />
              </Link>
              <button className="btn-outline-glow text-slate-300 hover:text-white font-medium px-7 py-3.5 rounded-xl flex items-center gap-2 text-sm">
                <Play className="w-4 h-4 text-indigo-400" /> Watch Demo
              </button>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex gap-8"
            >
              {[
                { label: 'Companies', value: '500+' },
                { label: 'Users', value: '12K+' },
                { label: 'Uptime', value: '99.9%' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-bold text-white">{s.value}</div>
                  <div className="text-xs text-slate-500 font-medium">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT — Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="hero-dashboard hidden lg:block"
          >
            <div className="hero-dashboard-inner relative">
              {/* Main Dashboard Card */}
              <div className="glass-strong rounded-2xl p-5 glow-indigo relative z-10">
                {/* Top bar */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-0.5">Platform Overview</div>
                    <div className="text-white font-bold text-lg">Revenue Dashboard</div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
                    Live
                  </div>
                </div>

                {/* Revenue Chart */}
                <div className="mb-4">
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-3xl font-black text-white">$128.4K</span>
                    <span className="flex items-center gap-1 text-emerald-400 text-sm font-semibold mb-1">
                      <ArrowUp className="w-3.5 h-3.5" /> 24%
                    </span>
                  </div>
                  <div style={{ height: 100 }}>
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="v" stroke="#6366f1" strokeWidth={2} fill="url(#heroGrad)" dot={false} />
                        <Tooltip
                          contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, fontSize: 11 }}
                          formatter={(v) => [`$${v}K`, 'Revenue']}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Mini stat grid */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Companies', val: '48', color: 'text-indigo-400' },
                    { label: 'Active Subs', val: '312', color: 'text-emerald-400' },
                    { label: 'Employees', val: '2.8K', color: 'text-purple-400' },
                  ].map(s => (
                    <div key={s.label} className="glass rounded-xl p-3 text-center">
                      <div className={`text-lg font-bold ${s.color}`}>{s.val}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Cards */}
              {floatCards.map((card, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3 + i, repeat: Infinity, delay: card.delay, ease: 'easeInOut' }}
                  className={`absolute ${card.position} glass rounded-xl p-3 flex items-center gap-3 min-w-[160px] z-20 shadow-xl`}
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.bg} flex items-center justify-center`}>
                    {card.icon}
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">{card.label}</div>
                    <div className="text-white font-bold text-sm">{card.value}</div>
                    <div className={`text-xs font-semibold ${card.badgeColor}`}>{card.badge}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600"
      >
        <div className="w-px h-10 bg-gradient-to-b from-transparent to-indigo-500/50" />
        <span className="text-xs font-medium">Scroll</span>
      </motion.div>
    </section>
  );
}
