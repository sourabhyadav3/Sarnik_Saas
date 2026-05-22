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
    <section className="relative z-10 py-28 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-5">
            <Factory className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs text-slate-400 font-medium">How It Works</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
            From Setup to <span className="gradient-text">Success</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-lg">
            Get your entire organization running in minutes, not months.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Center line — desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-indigo-500/30 to-transparent -translate-x-1/2" />

          <div className="flex flex-col gap-4">
            {steps.map((step, i) => {
              const isLeft = i % 2 === 0;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.55, delay: i * 0.08 }}
                  className={`relative flex items-center ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} flex-col md:gap-8 gap-4`}
                >
                  {/* Card */}
                  <div className="md:w-5/12 w-full">
                    <motion.div
                      whileHover={{ scale: 1.02, y: -4 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className={`glass rounded-2xl p-6 border ${step.border} bg-gradient-to-br ${step.bg} cursor-pointer`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl glass flex items-center justify-center ${step.color}`}>
                          {step.icon}
                        </div>
                        <span className={`text-xs font-mono font-bold ${step.color}`}>{step.num}</span>
                      </div>
                      <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                    </motion.div>
                  </div>

                  {/* Center node */}
                  <div className="hidden md:flex md:w-2/12 items-center justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${step.bg} border ${step.border} flex items-center justify-center ${step.color} relative z-10`}
                      style={{ boxShadow: `0 0 20px ${step.border.replace('border-', '').replace('/30', '')}` }}
                    >
                      <span className="text-xs font-bold">{i + 1}</span>
                    </motion.div>
                  </div>

                  {/* Spacer for opposite side */}
                  <div className="md:w-5/12 hidden md:block" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
