import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, LogOut, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clearAuthSession } from '../../utils/auth';
import { getStoredTrial, startFreeTrial } from '../../utils/trial';
import './SubscriptionRequired.css';

const plans = [
  {
    name: 'Starter',
    price: 29,
    desc: 'Perfect for small teams getting started.',
    color: 'text-slate-300',
    border: 'border-white/10',
    features: [
      'Up to 10 users',
      'Up to 5 projects',
      '5GB storage',
      'Basic analytics',
      'Email support',
    ],
    popular: false,
    cta: 'Upgrade to Starter',
    badge: 'Basic',
  },
  {
    name: 'Growth',
    price: 79,
    desc: 'For growing teams with advanced needs.',
    color: 'text-indigo-400',
    border: 'border-indigo-500/40',
    features: [
      'Up to 100 users',
      'Unlimited projects',
      '50GB storage',
      'Advanced analytics',
      'Priority support',
      'Audit logs',
      'Custom roles',
    ],
    popular: true,
    cta: 'Upgrade to Growth',
    badge: 'Best Value',
  },
  {
    name: 'Enterprise',
    price: 199,
    desc: 'For large organizations with full control.',
    color: 'text-emerald-400',
    border: 'border-emerald-500/20',
    features: [
      'Unlimited users',
      'Unlimited everything',
      'Unlimited storage',
      'Custom analytics',
      'Dedicated support',
      'Full audit logs',
      'SSO & SAML',
    ],
    popular: false,
    cta: 'Contact Sales',
    badge: 'Enterprise',
  },
];

export default function SubscriptionRequired() {
  const navigate = useNavigate();
  const [yearly, setYearly] = useState(false);
  const trial = getStoredTrial();

  const handleLogout = () => {
    clearAuthSession();
    navigate('/');
  };

  const handleResetTrial = () => {
    // Premium feature to restart trial for testing/demo purposes!
    startFreeTrial();
    window.location.href = '/admin/dashboard';
  };

  return (
    <div className="sub-req-container">
      {/* Background glowing lights */}
      <div className="bg-glow-orb orb-1"></div>
      <div className="bg-glow-orb orb-2"></div>
      <div className="bg-glow-orb orb-3"></div>

      {/* Top Header/Nav */}
      <header className="sub-req-header">
        <div className="sub-req-brand">
          <Zap className="brand-icon-glow" />
          <span>Sarnik SaaS</span>
        </div>
        <button className="sub-req-logout-btn" onClick={handleLogout}>
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Main Expired Warning Hero Section */}
      <main className="sub-req-main">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="warning-hero-card"
        >
          <div className="warning-badge-pulsing">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            <span>TRIAL EXPIRED</span>
          </div>

          <h1 className="warning-title">
            Your 7-Day Trial Has <span className="text-gradient-red">Expired</span>
          </h1>

          <p className="warning-subtitle">
            Your team reached the limit of the free trial period. All dashboards, projects, tasks, and analytics are currently restricted until you upgrade to a premium plan.
          </p>

          {/* Quick Statistics Banner */}
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">Trial Status</span>
              <span className="status-value text-red-400">Suspended</span>
            </div>
            <div className="status-item">
              <span className="status-label">Access Level</span>
              <span className="status-value text-slate-400">Restricted</span>
            </div>
            <div className="status-item">
              <span className="status-label">Remaining Days</span>
              <span className="status-value text-red-400">0 Days</span>
            </div>
          </div>

          {/* Upgrade Call-to-action */}
          <div className="warning-actions">
            <a href="#plans-section" className="btn-upgrade-scroll">
              Explore Premium Plans
            </a>
            <button className="btn-demo-extend" onClick={handleResetTrial}>
              ⚡ Restart 7-Day Trial (Demo Mode)
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards Section */}
        <section id="plans-section" className="sub-req-plans">
          <div className="plans-header">
            <h2>Select a Plan to Restore Full Access</h2>
            <p>Choose the plan that fits your business. Cancel or upgrade anytime.</p>

            {/* Toggle */}
            <div className="billing-toggle">
              <span className={!yearly ? 'active' : ''}>Monthly</span>
              <button 
                onClick={() => setYearly(!yearly)}
                className="toggle-switch"
              >
                <div className={`toggle-dot ${yearly ? 'yearly' : 'monthly'}`} />
              </button>
              <span className={yearly ? 'active' : ''}>
                Yearly <span className="discount-tag">Save 20%</span>
              </span>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="plans-grid">
            {plans.map((plan, i) => {
              const displayPrice = yearly ? Math.round(plan.price * 0.8) : plan.price;
              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`plan-card glass-premium ${plan.popular ? 'popular' : ''}`}
                >
                  {plan.popular && (
                    <div className="popular-badge-wrap">
                      <span className="popular-badge">RECOMMENDED</span>
                    </div>
                  )}

                  <div className="plan-name-wrap">
                    <span className="plan-badge-outline">{plan.badge}</span>
                    <h3 className="plan-name">{plan.name}</h3>
                  </div>

                  <p className="plan-desc">{plan.desc}</p>

                  <div className="plan-price-wrap">
                    <span className="price-symbol">$</span>
                    <span className="price-amount">{displayPrice}</span>
                    <span className="price-period">/month</span>
                  </div>

                  <button 
                    className={`btn-plan-select ${plan.popular ? 'btn-premium-solid' : 'btn-premium-outline'}`}
                    onClick={() => {
                      alert(`Successfully upgraded to the ${plan.name} plan! Redirecting you to your dashboard...`);
                      startFreeTrial(); // Reset trial for the upgraded active subscription representation
                      window.location.href = '/admin/dashboard';
                    }}
                  >
                    {plan.cta}
                  </button>

                  <div className="plan-divider"></div>

                  <ul className="plan-features-list">
                    {plan.features.map((feature, index) => (
                      <li key={index}>
                        <Check className="feature-check-icon" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Feature Comparison Section */}
        <section className="comparison-section">
          <div className="comparison-header">
            <h2>Compare Plan Features</h2>
            <p>Check the breakdown of what each subscription model offers.</p>
          </div>

          <div className="comparison-table-wrapper glass-premium">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Core Platform Feature</th>
                  <th>Starter</th>
                  <th>Growth</th>
                  <th>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Team Member Seats</td>
                  <td>Up to 10</td>
                  <td>Up to 100</td>
                  <td>Unlimited</td>
                </tr>
                <tr>
                  <td>Active Project Pipelines</td>
                  <td>5 Projects</td>
                  <td>Unlimited</td>
                  <td>Unlimited</td>
                </tr>
                <tr>
                  <td>Advanced Analytics Dashboard</td>
                  <td>❌</td>
                  <td>✅</td>
                  <td>✅</td>
                </tr>
                <tr>
                  <td>Custom Role-based Access</td>
                  <td>❌</td>
                  <td>✅</td>
                  <td>✅</td>
                </tr>
                <tr>
                  <td>API Integration & Webhooks</td>
                  <td>❌</td>
                  <td>❌</td>
                  <td>✅</td>
                </tr>
                <tr>
                  <td>Dedicated account manager</td>
                  <td>❌</td>
                  <td>❌</td>
                  <td>✅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="sub-req-footer">
        <p>© {new Date().getFullYear()} Sarnik SaaS. Premium Enterprise Workspace.</p>
      </footer>
    </div>
  );
}
