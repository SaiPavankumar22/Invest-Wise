import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calculator, IndianRupee, Landmark, PiggyBank, Wallet,
  BadgeDollarSign, Heart, GraduationCap, Building2, Coins,
  LineChart, BarChart3, Briefcase, Building, Trophy,
  Search, Filter, Bot, ArrowRight, Shield, Target, CreditCard, TrendingUp
} from 'lucide-react';
import { useSavedSchemes } from '../contexts/SavedSchemesContext';
import { useAuth } from '../contexts/AuthContext';
import type { InvestmentScheme } from '../types';

const schemes: InvestmentScheme[] = [
  { id: 'fd', title: 'Fixed Deposit', description: '6.5 - 7.5% p.a. | Min Rs.1,000 | 7 days - 10 years lock-in', icon: 'Landmark', path: '/scheme/fd', category: 'fixed' },
  { id: 'gold', title: 'Gold Investment', description: '22K: ~Rs.6,650/g | 24K: ~Rs.7,250/g | Physical, Digital, SGBs', icon: 'Coins', path: '/scheme/gold', category: 'fixed' },
  { id: 'shares', title: 'Share Market', description: 'Direct equity | Avg 12-15% returns | High risk, high reward', icon: 'LineChart', path: '/scheme/shares', category: 'fixed' },
  { id: 'index-funds', title: 'Index Funds', description: 'Tracks Nifty/Sensex | 12% avg returns | Lowest fund fees (0.1-0.5%)', icon: 'BarChart3', path: '/scheme/index-funds', category: 'fixed' },
  { id: 'real-estate', title: 'Real Estate', description: 'Property appreciation + rental yield | 8-12% returns | High capital needed', icon: 'Building2', path: '/scheme/real-estate', category: 'fixed' },
  { id: 'swp', title: 'SWP Mutual Funds', description: 'Systematic Withdrawal Plan | Monthly income from investments', icon: 'IndianRupee', path: '/scheme/swp', category: 'fixed' },
  { id: 'ulip', title: 'ULIP Plans', description: 'Insurance + Investment combo | Tax benefits under 80C | 5-year lock-in', icon: 'Briefcase', path: '/scheme/ulip', category: 'fixed' },
  { id: 'suku', title: 'Sukanya Samriddhi Yojana', description: '8.2% p.a. | For girl child below 14 | Tax-free under 80C', icon: 'Wallet', path: '/scheme/post-office', category: 'fixed' },
  { id: 'startups', title: 'Startup Investment', description: 'High growth potential | SEBI-regulated platforms | High risk', icon: 'Building', path: '/scheme/startups', category: 'fixed' },
  { id: 'senior-citizen', title: 'Senior Citizen SCSS', description: '8.2% p.a. | For 60+ years | Rs.30L max deposit | Quarterly payout', icon: 'GraduationCap', path: '/scheme/senior-citizen', category: 'fixed' },
  { id: 'ipo', title: 'IPO Investment', description: 'Invest in companies going public | Apply via demat account', icon: 'Trophy', path: '/scheme/ipo', category: 'fixed' },
  { id: 'reit', title: 'REITs', description: 'Real Estate trusts | 6-8% yield | Listed on stock exchanges', icon: 'Building2', path: '/scheme/reit', category: 'fixed' },
  { id: 'rd', title: 'Recurring Deposit', description: '5.5 - 7% p.a. | Min Rs.100/month | Perfect for disciplined saving', icon: 'PiggyBank', path: '/scheme/rd', category: 'recurring' },
  { id: 'sip', title: 'SIP (Mutual Funds)', description: 'Start Rs.500/mo | 12% avg returns | Power of compounding', icon: 'Calculator', path: '/scheme/sip', category: 'recurring' },
];

const iconComponents: Record<string, React.ComponentType> = {
  Calculator, IndianRupee, Landmark, PiggyBank, Wallet,
  BadgeDollarSign, Heart, GraduationCap, Building2, Coins,
  LineChart, BarChart3, Briefcase, Building, Trophy
};

const agentShortcuts = [
  { title: 'Tax Planning', desc: 'Compare old vs new regime', icon: Calculator, color: 'from-red-500 to-rose-400', path: '/agents/tax-planning' },
  { title: 'Retirement', desc: 'Plan your retirement corpus', icon: TrendingUp, color: 'from-emerald-500 to-green-400', path: '/agents/retirement' },
  { title: 'EMI Compare', desc: 'Compare loans across banks', icon: Landmark, color: 'from-purple-500 to-violet-400', path: '/agents/emi-compare' },
  { title: 'Insurance', desc: 'Life & health coverage', icon: Shield, color: 'from-amber-500 to-yellow-400', path: '/agents/insurance' },
  { title: 'Goal Planner', desc: 'SIP plan for your goals', icon: Target, color: 'from-cyan-500 to-blue-400', path: '/agents/goal-planner' },
  { title: 'Credit Score', desc: 'Improve your CIBIL score', icon: CreditCard, color: 'from-indigo-500 to-blue-400', path: '/agents/credit-score' },
];

const categories = [
  { value: 'all', label: 'All Schemes' },
  { value: 'fixed', label: 'Fixed Capital' },
  { value: 'recurring', label: 'Recurring Capital' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toggleSaveScheme, isSchemesSaved } = useSavedSchemes();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredSchemes = useMemo(() => {
    return schemes.filter(s => {
      const matchesCategory = activeCategory === 'all' || s.category === activeCategory;
      const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
                           s.description.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  const recurringCount = schemes.filter(s => s.category === 'recurring').length;
  const fixedCount = schemes.filter(s => s.category === 'fixed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, <span className="gradient-text">{user?.username || 'Investor'}</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Explore {schemes.length} investment options and {agentShortcuts.length} AI-powered financial agents
        </p>
      </div>

      {/* Quick Agent Access */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Bot className="h-4 w-4 text-blue-500" />
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">AI Financial Agents</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {agentShortcuts.map((agent) => {
            const Icon = agent.icon;
            return (
              <button
                key={agent.path}
                onClick={() => navigate(agent.path)}
                className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-md transition-all duration-200 text-center"
              >
                <div className={`bg-gradient-to-br ${agent.color} rounded-lg p-2 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">{agent.title}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{agent.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Schemes', value: schemes.length, color: 'from-blue-500 to-cyan-500' },
          { label: 'Fixed Capital', value: fixedCount, color: 'from-purple-500 to-pink-500' },
          { label: 'Recurring', value: recurringCount, color: 'from-emerald-500 to-teal-500' },
          { label: 'Saved', value: schemes.filter(s => isSchemesSaved(s.id)).length, color: 'from-amber-500 to-orange-500' },
        ].map((stat, i) => (
          <div key={i} className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50">
            <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>{stat.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search schemes by name or returns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
          />
        </div>
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeCategory === cat.value
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Schemes Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Investment Schemes
        </h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">{filteredSchemes.length} schemes</span>
      </div>

      {/* Schemes Grid */}
      {filteredSchemes.length === 0 ? (
        <div className="text-center py-16">
          <Filter className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No schemes found</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredSchemes.map((scheme) => (
            <SchemeCard
              key={scheme.id}
              scheme={scheme}
              onNavigate={navigate}
              onToggleSave={toggleSaveScheme}
              isSaved={isSchemesSaved(scheme.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SchemeCardProps {
  scheme: InvestmentScheme;
  onNavigate: (path: string) => void;
  onToggleSave: (scheme: InvestmentScheme) => void;
  isSaved: boolean;
}

const SchemeCard: React.FC<SchemeCardProps> = ({ scheme, onNavigate, onToggleSave, isSaved }) => {
  const IconComponent = iconComponents[scheme.icon as keyof typeof iconComponents];

  return (
    <div
      className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50 cursor-pointer card-hover relative overflow-hidden"
      onClick={() => onNavigate(scheme.path)}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <button
        onClick={(e) => { e.stopPropagation(); onToggleSave(scheme); }}
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
      >
        <Heart className={`h-5 w-5 transition-colors ${isSaved ? 'text-red-500 fill-red-500' : 'text-gray-300 hover:text-red-400'}`} />
      </button>
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
          <IconComponent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider mb-2 ${
          scheme.category === 'recurring'
            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
            : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
        }`}>
          {scheme.category}
        </span>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {scheme.title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
          {scheme.description}
        </p>
      </div>
    </div>
  );
};
