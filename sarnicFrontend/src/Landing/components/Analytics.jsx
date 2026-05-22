import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { TrendingUp, Users, DollarSign, Zap } from 'lucide-react';

const revenueData = [
  { m: 'Jan', v: 48 }, { m: 'Feb', v: 62 }, { m: 'Mar', v: 55 },
  { m: 'Apr', v: 78 }, { m: 'May', v: 71 }, { m: 'Jun', v: 95 },
  { m: 'Jul', v: 88 }, { m: 'Aug', v: 112 }, { m: 'Sep', v: 105 },
  { m: 'Oct', v: 128 }, { m: 'Nov', v: 142 }, { m: 'Dec', v: 158 },
];

const userGrowth = [
  { m: 'Jan', u: 800 }, { m: 'Feb', u: 1100 }, { m: 'Mar', u: 950 },
  { m: 'Apr', u: 1400 }, { m: 'May', u: 1650 }, { m: 'Jun', u: 2100 },
  { m: 'Jul', u: 1900 }, { m: 'Aug', u: 2400 }, { m: 'Sep', u: 2200 },
  { m: 'Oct', u: 2700 }, { m: 'Nov', u: 3100 }, { m: 'Dec', u: 2847 },
];

const companyGrowth = [
  { m: 'Q1', c: 12 }, { m: 'Q2', c: 21 }, { m: 'Q3', c: 35 }, { m: 'Q4', c: 48 },
];

// Animated counter hook
function useCounter(target, duration = 2000, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return value;
}

const statItems = [
  { icon: <DollarSign className="w-5 h-5" />, label: 'Monthly Revenue', target: 158, suffix: 'K', prefix: '$', color: 'text-emerald-400', border: 'border-emerald-500/20' },
  { icon: <Users className="w-5 h-5" />, label: 'Active Users', target: 2847, suffix: '', prefix: '', color: 'text-indigo-400', border: 'border-indigo-500/20' },
  { icon: <TrendingUp className="w-5 h-5" />, label: 'Companies', target: 48, suffix: '', prefix: '', color: 'text-purple-400', border: 'border-purple-500/20' },
  { icon: <Zap className="w-5 h-5" />, label: 'Tasks Completed', target: 18392, suffix: '', prefix: '', color: 'text-amber-400', border: 'border-amber-500/20' },
];

function StatCard({ item, inView }) {
  const value = useCounter(item.target, 1800, inView);
  return (
    <div className={`glass rounded-2xl p-5 border ${item.border}`}>
      <div className={`flex items-center gap-2 mb-2 ${item.color}`}>
        {item.icon}
        <span className="text-xs font-medium text-slate-400">{item.label}</span>
      </div>
      <div className={`text-3xl font-black ${item.color} counter-value`}>
        {item.prefix}{value.toLocaleString()}{item.suffix}
      </div>
    </div>
  );
}

const tooltipStyle = {
  background: 'rgba(15,23,42,0.95)',
  border: '1px solid rgba(99,102,241,0.2)',
  borderRadius: 10,
  fontSize: 11,
};

export default function Analytics() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold: 0.2 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="analytics" className="relative z-10 py-28 px-6" ref={ref}>
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
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-slate-400 font-medium">Real-Time Analytics</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
            Data That <span className="gradient-text">Drives Decisions</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-lg">
            Live metrics, growth curves, and subscription health at a glance.
          </p>
        </motion.div>

        {/* Stat counters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {statItems.map((item, i) => (
            <StatCard key={i} item={item} inView={inView} />
          ))}
        </motion.div>

        {/* Charts grid */}
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Revenue Chart — wide */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 glass rounded-2xl p-6 glow-indigo"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-white font-bold">Revenue Trend</div>
                <div className="text-xs text-slate-500">Monthly SaaS revenue in $K</div>
              </div>
              <span className="text-emerald-400 text-sm font-semibold">+24% YoY</span>
            </div>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="analyticsRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="m" stroke="#475569" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#475569" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`$${v}K`, 'Revenue']} />
                  <Area type="monotone" dataKey="v" stroke="#6366f1" strokeWidth={2.5} fill="url(#analyticsRev)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Company Growth */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass rounded-2xl p-6 glow-emerald"
          >
            <div className="mb-4">
              <div className="text-white font-bold">Company Growth</div>
              <div className="text-xs text-slate-500">New companies onboarded</div>
            </div>
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={companyGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="m" stroke="#475569" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#475569" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="c" fill="#10b981" radius={[4, 4, 0, 0]} name="Companies" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 text-center">
              <span className="text-emerald-400 text-lg font-bold">48</span>
              <span className="text-slate-500 text-xs ml-1">total companies</span>
            </div>
          </motion.div>

          {/* User Growth */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3 glass rounded-2xl p-6 glow-purple"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-white font-bold">User Growth Timeline</div>
                <div className="text-xs text-slate-500">Monthly active user registrations</div>
              </div>
              <span className="text-purple-400 text-sm font-semibold">+256% Annual Growth</span>
            </div>
            <div style={{ height: 160 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <LineChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="m" stroke="#475569" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#475569" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="u" stroke="#a855f7" strokeWidth={2.5} dot={{ fill: '#a855f7', r: 3 }} name="Users" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
