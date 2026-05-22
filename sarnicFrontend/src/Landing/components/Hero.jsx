import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import {
  ArrowUp, ChevronRight, Play,
  FolderKanban, Briefcase, Factory, Users2,
  CheckCircle2, Clock, AlertCircle, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

/* ─── Job Completion Data by Range ─── */
const analyticData = {
  '12M': {
    jobs: '1,248', change: '+24%',
    chart: [
      { name: 'Jan', completed: 72, inProgress: 30 },
      { name: 'Feb', completed: 85, inProgress: 25 },
      { name: 'Mar', completed: 68, inProgress: 35 },
      { name: 'Apr', completed: 110, inProgress: 40 },
      { name: 'May', completed: 95, inProgress: 32 },
      { name: 'Jun', completed: 130, inProgress: 45 },
      { name: 'Jul', completed: 115, inProgress: 38 },
      { name: 'Aug', completed: 140, inProgress: 50 },
      { name: 'Sep', completed: 125, inProgress: 42 },
      { name: 'Oct', completed: 155, inProgress: 55 },
      { name: 'Nov', completed: 142, inProgress: 48 },
      { name: 'Dec', completed: 168, inProgress: 60 },
    ],
  },
  '30D': {
    jobs: '312', change: '+18%',
    chart: [
      { name: 'Week 1', completed: 62, inProgress: 18 },
      { name: 'Week 2', completed: 78, inProgress: 22 },
      { name: 'Week 3', completed: 85, inProgress: 28 },
      { name: 'Week 4', completed: 92, inProgress: 20 },
    ],
  },
  '7D': {
    jobs: '87', change: '+12%',
    chart: [
      { name: 'Mon', completed: 10, inProgress: 4 },
      { name: 'Tue', completed: 14, inProgress: 6 },
      { name: 'Wed', completed: 12, inProgress: 5 },
      { name: 'Thu', completed: 16, inProgress: 8 },
      { name: 'Fri', completed: 13, inProgress: 6 },
      { name: 'Sat', completed: 18, inProgress: 3 },
      { name: 'Sun', completed: 4, inProgress: 2 },
    ],
  },
};

/* ─── Animated word cycling ─── */
const words = ['Projects', 'Teams', 'Production', 'Invoicing', 'Workflows'];

/* ─── Recent Job Activity ─── */
const recentJobs = [
  { title: 'Logo Design — Acme Corp', status: 'completed', time: '5m ago' },
  { title: 'Packaging Layout — FreshBite', status: 'completed', time: '18m ago' },
  { title: 'Label Print — MediCare Plus', status: 'inprogress', time: 'In progress' },
  { title: 'Brochure Design — TechNova', status: 'assigned', time: 'Assigned' },
];

const statusConfig = {
  completed: { icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />, color: 'text-emerald-400' },
  inprogress: { icon: <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />, color: 'text-amber-400' },
  assigned: { icon: <AlertCircle className="w-3.5 h-3.5 text-indigo-400" />, color: 'text-indigo-400' },
};

/* ─── Donut SVG ring component ─── */
function DonutRing({ percent, color, size = 56, strokeWidth = 5 }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */

export default function Hero() {
  const [wordIdx, setWordIdx] = useState(0);
  const [range, setRange] = useState('12M');

  useEffect(() => {
    const t = setInterval(() => setWordIdx(i => (i + 1) % words.length), 2200);
    return () => clearInterval(t);
  }, []);

  const data = analyticData[range];

  return (
    <section className="relative flex items-center pt-32 pb-6 overflow-hidden w-full">
      <div className="relative z-10 max-w-full px-6 md:px-12 lg:px-20 w-full">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full">

          {/* ─── LEFT — Copy ─── */}
          <div className="lg:col-span-5 w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
              <span className="text-xs text-slate-300 font-medium">Workflow Management System — Live</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-[1.05] mb-2">
              Manage Your
            </motion.h1>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-black leading-[1.05] mb-2 h-[1.1em] overflow-hidden">
              <motion.span key={wordIdx} initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                exit={{ y: -60, opacity: 0 }} transition={{ duration: 0.4 }} className="gradient-text block">
                {words[wordIdx]}
              </motion.span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-[1.05] mb-6">
              Like Never Before.
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="text-slate-400 text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
              Workflow Management System is a multi-tenant enterprise platform that unifies project management,
              job tracking, production workflows, invoicing & billing, and timesheet management — all in one place.
            </motion.p>

            {/* CTAs */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-4 mb-10">
              <Link to="/login" className="btn-primary-glow text-white font-semibold px-7 py-3.5 rounded-xl flex items-center gap-2 text-sm">
                Start Free Trial <ChevronRight className="w-4 h-4" />
              </Link>
              <button className="btn-outline-glow text-slate-300 hover:text-white font-medium px-7 py-3.5 rounded-xl flex items-center gap-2 text-sm">
                <Play className="w-4 h-4 text-indigo-400" /> Watch Demo
              </button>
            </motion.div>

            {/* Stats row */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.6 }}
              className="flex gap-8">
              {[
                { label: 'Companies', value: '500+' },
                { label: 'Projects', value: '4.2K+' },
                { label: 'Jobs Done', value: '28K+' },
              ].map(s => (
                <div key={s.label}>
                  <div className="text-2xl font-bold text-white">{s.value}</div>
                  <div className="text-xs text-slate-500 font-medium">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ─── RIGHT — Dashboard Mockup ─── */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="hero-dashboard lg:col-span-7 w-full mt-12 lg:mt-0"
          >
            <div className="hero-dashboard-inner">
              {/* ── TOP ROW: 4 stat pills ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
                {[
                  { icon: <FolderKanban className="w-3.5 h-3.5" />, label: 'Projects', val: '142', badge: '+8 new', color: 'text-indigo-400', iconBg: 'bg-indigo-500/15' },
                  { icon: <Briefcase className="w-3.5 h-3.5" />, label: 'Active Jobs', val: '87', badge: '24 today', color: 'text-emerald-400', iconBg: 'bg-emerald-500/15' },
                  { icon: <Factory className="w-3.5 h-3.5" />, label: 'Production', val: '38', badge: 'In Progress', color: 'text-amber-400', iconBg: 'bg-amber-500/15' },
                  { icon: <Users2 className="w-3.5 h-3.5" />, label: 'Employees', val: '256', badge: '12 online', color: 'text-purple-400', iconBg: 'bg-purple-500/15' },
                ].map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="glass rounded-xl p-3 group hover:border-indigo-500/30 transition-all duration-300 cursor-default"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-6 h-6 rounded-lg ${s.iconBg} ${s.color} flex items-center justify-center`}>
                        {s.icon}
                      </div>
                      <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">{s.label}</span>
                    </div>
                    <div className="text-white font-extrabold text-sm leading-none">{s.val}</div>
                    <div className={`text-[10px] font-bold mt-1 ${s.color}`}>{s.badge}</div>
                  </motion.div>
                ))}
              </div>

              {/* ── MAIN CHART CARD — Job Completion Trends ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="glass-strong rounded-2xl p-4 glow-indigo mb-3"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm leading-tight">Job Completion Trends</div>
                      <div className="text-[9px] text-slate-500 font-medium">Completed vs In-Progress jobs</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex bg-white/[0.03] border border-white/5 rounded-lg p-0.5 gap-0.5">
                      {['7D', '30D', '12M'].map(r => (
                        <button
                          key={r}
                          onClick={() => setRange(r)}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all duration-200 cursor-pointer ${
                            range === r
                              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                              : 'text-slate-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" /> Live
                    </div>
                  </div>
                </div>

                {/* Big number + legend */}
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-end gap-2">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={range}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="text-2xl font-black text-white leading-none"
                      >
                        {data.jobs}
                      </motion.span>
                    </AnimatePresence>
                    <span className="text-[11px] text-slate-500 font-medium mb-0.5">jobs</span>
                    <span className="flex items-center gap-0.5 text-emerald-400 text-xs font-bold mb-0.5">
                      <ArrowUp className="w-3 h-3" /> {data.change}
                    </span>
                  </div>
                  <div className="flex gap-3 text-[9px] font-bold text-slate-400">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-indigo-500" /> Completed</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-400" /> In Progress</span>
                  </div>
                </div>

                {/* Chart */}
                <div style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <AreaChart data={data.chart} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gCompleted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gInProgress" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={9} tickLine={false} axisLine={false} dy={4} />
                      <Tooltip
                        contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 10, fontSize: 10, color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', padding: '8px 12px' }}
                        formatter={(v, name) => [
                          `${v} jobs`,
                          name === 'completed' ? 'Completed' : 'In Progress'
                        ]}
                      />
                      <Area type="monotone" dataKey="completed" stroke="#6366f1" strokeWidth={2.5} fill="url(#gCompleted)" dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: '#6366f1' }} />
                      <Area type="monotone" dataKey="inProgress" stroke="#f59e0b" strokeWidth={1.5} fill="url(#gInProgress)" dot={false} activeDot={{ r: 3, strokeWidth: 0, fill: '#f59e0b' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

    </section>
  );
}
