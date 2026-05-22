import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, Layers, UserCircle, ChevronDown } from 'lucide-react';

const nodes = [
  {
    id: 'superadmin',
    label: 'Super Admin',
    sub: 'Platform Control',
    icon: <Building2 className="w-5 h-5" />,
    color: 'from-indigo-500 to-purple-600',
    glow: 'rgba(99,102,241,0.4)',
    border: 'rgba(99,102,241,0.5)',
  },
  {
    id: 'companies',
    label: 'Companies',
    sub: 'Tenant Accounts',
    icon: <Building2 className="w-5 h-5" />,
    color: 'from-emerald-500 to-teal-600',
    glow: 'rgba(16,185,129,0.4)',
    border: 'rgba(16,185,129,0.5)',
    count: '48 Active',
  },
  {
    id: 'departments',
    label: 'Departments',
    sub: 'Role Clusters',
    icon: <Layers className="w-5 h-5" />,
    color: 'from-amber-500 to-orange-600',
    glow: 'rgba(245,158,11,0.4)',
    border: 'rgba(245,158,11,0.5)',
    count: 'Admin · Production · Design',
  },
  {
    id: 'employees',
    label: 'Employees',
    sub: 'End Users',
    icon: <UserCircle className="w-5 h-5" />,
    color: 'from-rose-500 to-pink-600',
    glow: 'rgba(244,63,94,0.4)',
    border: 'rgba(244,63,94,0.5)',
    count: '2,847 Users',
  },
];

export default function Architecture() {
  const [hoveredNode, setHoveredNode] = useState(null);

  return (
    <section id="architecture" className="relative z-10 py-6 px-6">
      <div className="max-w-full px-6 md:px-12 lg:px-20 mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-slate-400 font-medium">Multi-Tenant Architecture</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
            Isolation by <span className="gradient-text">Design</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-lg">
            Each tenant operates in a completely sandboxed environment. Zero data crossover, ever.
          </p>
        </motion.div>

        {/* Node Diagram */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {nodes.map((node, i) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              onHoverStart={() => setHoveredNode(node.id)}
              onHoverEnd={() => setHoveredNode(null)}
              className="w-full glass rounded-xl p-3.5 cursor-pointer transition-all duration-300 flex flex-col justify-between"
              style={{
                boxShadow: hoveredNode === node.id
                  ? `0 0 30px ${node.glow}, 0 0 1px 1px ${node.border}`
                  : `0 0 0 1px rgba(255,255,255,0.07)`,
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${node.color} flex items-center justify-center text-white flex-shrink-0`}
                    style={{ boxShadow: `0 0 15px ${node.glow}` }}>
                    {React.cloneElement(node.icon, { className: 'w-4 h-4' })}
                  </div>
                  {/* Animated rings */}
                  <div className="relative w-5 h-5 flex-shrink-0">
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                      className="absolute inset-0 rounded-full"
                      style={{ background: `${node.glow}` }}
                    />
                    <div className="absolute inset-0.5 rounded-full"
                      style={{ background: `linear-gradient(135deg, ${node.glow}, transparent)` }} />
                  </div>
                </div>

                <div className="text-white font-extrabold text-sm mb-0.5">{node.label}</div>
                <div className="text-slate-400 text-[11px] leading-tight mb-2">{node.sub}</div>
              </div>

              <div>
                {node.count && (
                  <div className="text-[10px] text-indigo-400/80 font-semibold font-mono bg-indigo-500/5 rounded px-2 py-0.5 w-fit mb-2">
                    {node.count}
                  </div>
                )}

                {/* Isolation badge */}
                <div className="flex gap-1 flex-wrap mt-1">
                  {['Isolated Data', 'Role Gated'].map(badge => (
                    <span key={badge} className="text-[8px] bg-white/5 text-slate-400 rounded-full px-2 py-0.5">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12"
        >
          {[
            { title: 'Zero Leakage', desc: 'Company data is strictly isolated via company_id filtering at every query level.', color: 'text-emerald-400' },
            { title: 'Superadmin Override', desc: 'SuperAdmin has global visibility with granular control and no tenant restrictions.', color: 'text-indigo-400' },
            { title: 'Scale Infinitely', desc: 'Onboard hundreds of companies with no performance degradation whatsoever.', color: 'text-purple-400' },
          ].map((c) => (
            <div key={c.title} className="glass rounded-xl p-4">
              <div className={`font-bold mb-1 text-sm ${c.color}`}>{c.title}</div>
              <div className="text-slate-400 text-xs leading-relaxed">{c.desc}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
