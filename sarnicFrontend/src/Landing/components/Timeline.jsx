import React from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Users, FolderKanban, Factory, BarChart3, ArrowDown
} from 'lucide-react';

const steps = [
  {
    num: '01',
    icon: <Building2 className="w-6 h-6" />,
    title: 'Create Workspace',
    desc: 'Set up your isolated company workspace in seconds. Configure branding, settings, and team structure.',
    color: 'text-indigo-400',
    bg: 'from-indigo-500/20 to-transparent',
    border: 'border-indigo-500/30',
  },
  {
    num: '02',
    icon: <Users className="w-6 h-6" />,
    title: 'Invite Your Team',
    desc: 'Add admins, designers, and production staff with one click. Role permissions apply automatically.',
    color: 'text-emerald-400',
    bg: 'from-emerald-500/20 to-transparent',
    border: 'border-emerald-500/30',
  },
  {
    num: '03',
    icon: <FolderKanban className="w-6 h-6" />,
    title: 'Assign Projects & Jobs',
    desc: 'Create projects, break them into jobs, assign to designers, set priorities and deadlines.',
    color: 'text-amber-400',
    bg: 'from-amber-500/20 to-transparent',
    border: 'border-amber-500/30',
  },
  {
    num: '04',
    icon: <Factory className="w-6 h-6" />,
    title: 'Track Production',
    desc: 'Production managers see live job status. Time logs, reviews, rejections — everything tracked.',
    color: 'text-purple-400',
    bg: 'from-purple-500/20 to-transparent',
    border: 'border-purple-500/30',
  },
  {
    num: '05',
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Analyze & Report',
    desc: 'Deep analytics on team performance, project completion rates, billing, and revenue growth.',
    color: 'text-rose-400',
    bg: 'from-rose-500/20 to-transparent',
    border: 'border-rose-500/30',
  },
];

export default function Timeline() {
  return (
    <section className="relative z-10 py-6 px-6">
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
            <Factory className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs text-slate-400 font-medium">How It Works</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
            From Setup to <span className="gradient-text">Success</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-lg">
            Get your entire organization running in minutes, not months.
          </p>
        </motion.div>

        {/* Steps Grid: 2 Rows */}
        <div className="w-full flex flex-col gap-6">
          {/* Row 1: 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {steps.slice(0, 3).map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className={`glass rounded-xl p-5 border ${step.border} bg-gradient-to-br ${step.bg} cursor-pointer flex flex-col justify-between h-full`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-8 h-8 rounded-lg glass flex items-center justify-center ${step.color}`}>
                      {React.cloneElement(step.icon, { className: 'w-4 h-4' })}
                    </div>
                    <span className={`text-xl font-black font-mono tracking-wider ${step.color}`}>{step.num}</span>
                  </div>
                  <h3 className="text-white font-extrabold text-sm mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Row 2: 2 cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
            {steps.slice(3, 5).map((step, i) => (
              <motion.div
                key={i + 3}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className={`glass rounded-xl p-5 border ${step.border} bg-gradient-to-br ${step.bg} cursor-pointer flex flex-col justify-between h-full`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-8 h-8 rounded-lg glass flex items-center justify-center ${step.color}`}>
                      {React.cloneElement(step.icon, { className: 'w-4 h-4' })}
                    </div>
                    <span className={`text-xl font-black font-mono tracking-wider ${step.color}`}>{step.num}</span>
                  </div>
                  <h3 className="text-white font-extrabold text-sm mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
