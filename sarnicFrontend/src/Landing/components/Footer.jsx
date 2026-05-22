import React from 'react';
import { motion } from 'framer-motion';
import { Zap, MessageCircle, GitBranch, Globe, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const footerLinks = {
  Product: ['Features', 'Pricing', 'Analytics', 'Security', 'Changelog'],
  Company: ['About Us', 'Blog', 'Careers', 'Press', 'Contact'],
  Resources: ['Documentation', 'API Reference', 'Status Page', 'Support Center', 'Community'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'],
};

const socials = [
  { icon: <MessageCircle className="w-4 h-4" />, label: 'Twitter' },
  { icon: <GitBranch className="w-4 h-4" />, label: 'GitHub' },
  { icon: <Globe className="w-4 h-4" />, label: 'LinkedIn' },
  { icon: <Mail className="w-4 h-4" />, label: 'Email' },
];

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold text-xl tracking-tight">Sarnik</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-5 max-w-xs">
              The enterprise SaaS platform for managing people, production, and revenue at scale.
            </p>
            <div className="flex gap-3">
              {socials.map((s) => (
                <motion.a
                  key={s.label}
                  href="#"
                  whileHover={{ scale: 1.15, y: -2 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="w-9 h-9 glass rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors border border-white/5 hover:border-indigo-500/30"
                  aria-label={s.label}
                >
                  {s.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <div className="text-white text-sm font-semibold mb-4">{category}</div>
              <div className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="text-slate-500 hover:text-slate-200 text-sm transition-colors"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-slate-600 text-sm">
            © {new Date().getFullYear()} Sarnik SaaS. All rights reserved.
          </div>
          <div className="flex items-center gap-2 text-slate-600 text-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
            All systems operational — 99.9% uptime
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-slate-500 hover:text-white text-sm transition-colors">Sign In</Link>
            <Link to="/login" className="btn-primary-glow text-white text-sm font-semibold px-4 py-1.5 rounded-lg">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
