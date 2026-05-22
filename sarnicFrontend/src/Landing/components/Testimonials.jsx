import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Arjun Mehta',
    role: 'CTO, Printcraft India',
    avatar: 'AM',
    color: 'from-indigo-500 to-purple-600',
    stars: 5,
    text: 'Sarnik completely transformed how we manage our 60-person studio. The multi-tenant isolation means each client brand stays completely separate. Incredible platform.',
  },
  {
    name: 'Sarah Williams',
    role: 'Operations Director, DesignHub',
    avatar: 'SW',
    color: 'from-emerald-500 to-teal-600',
    stars: 5,
    text: 'The production workflow tracking alone saved us 12 hours a week. Job status updates, time logs, designer assignments — all in one place. Worth every penny.',
  },
  {
    name: 'Rajesh Kumar',
    role: 'CEO, PackagePro Solutions',
    avatar: 'RK',
    color: 'from-amber-500 to-orange-600',
    stars: 5,
    text: 'We onboarded 3 subsidiaries as separate tenants. Zero crossover, zero headaches. The analytics dashboard gives us a bird\'s eye view of the entire organization.',
  },
  {
    name: 'Emily Chen',
    role: 'Product Manager, FlexPrint',
    avatar: 'EC',
    color: 'from-rose-500 to-pink-600',
    stars: 5,
    text: 'Security-wise, Sarnik is on another level. Rate limiting, audit logs, JWT rotation — our IT team was genuinely impressed. Enterprise-grade at startup price.',
  },
  {
    name: 'Mohammed Al-Rashid',
    role: 'COO, AlphaBrand Studio',
    avatar: 'MR',
    color: 'from-sky-500 to-blue-600',
    stars: 5,
    text: 'The subscription management portal is a lifesaver. We manage 15 client subscriptions, renewals, and billing from one screen. Revenue tracking is phenomenal.',
  },
  {
    name: 'Priya Nair',
    role: 'Admin Manager, CreativeForce',
    avatar: 'PN',
    color: 'from-violet-500 to-purple-700',
    stars: 5,
    text: 'Role-based access is exactly what we needed. Our designers see only their jobs, production sees theirs, and I see everything. Clean, fast, and beautiful.',
  },
];

// Duplicate for seamless scroll loop
const allTestimonials = [...testimonials, ...testimonials];

export default function Testimonials() {
  return (
    <section className="relative z-10 py-6 overflow-hidden">
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
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs text-slate-400 font-medium">Customer Stories</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
            Loved by <span className="gradient-text">Teams Worldwide</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-lg">
            Hear from the companies that run on Sarnik every day.
          </p>
        </motion.div>
      </div>

      {/* Infinite Scroll Strip */}
      <div className="relative">
        {/* Edge fades */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#020817] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#020817] to-transparent z-10 pointer-events-none" />

        <div className="testimonial-track">
          {allTestimonials.map((t, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03, y: -5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="flex-shrink-0 w-80 glass rounded-2xl p-6 border border-white/7 cursor-pointer"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.stars }).map((_, si) => (
                  <Star key={si} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                ))}
              </div>

              <p className="text-slate-300 text-sm leading-relaxed mb-5">"{t.text}"</p>

              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xs font-bold`}>
                  {t.avatar}
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">{t.name}</div>
                  <div className="text-slate-500 text-xs">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
