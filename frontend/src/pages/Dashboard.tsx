import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calculator, IndianRupee, Landmark, PiggyBank, Wallet,
  BadgeDollarSign, Heart, GraduationCap, Building2, Coins,
  LineChart, BarChart3, Briefcase, Building, Trophy,
  Search, Filter
} from 'lucide-react';
import { useSavedSchemes } from '../contexts/SavedSchemesContext';
import { useAuth } from '../contexts/AuthContext';
import type { InvestmentScheme } from '../types';

const schemes: InvestmentScheme[] = [
  { id: 'real-estate', title: 'Real Estate Investment', description: 'Long-term investment in property assets', icon: 'Building2', path: '/scheme/real-estate', category: 'fixed' },
  { id: 'fd', title: 'Fixed Deposit', description: 'Secure fixed-term investments with guaranteed returns', icon: 'Landmark', path: '/scheme/fd', category: 'fixed' },
  { id: 'gold', title: 'Gold Investment', description: 'Investment in physical and digital gold', icon: 'Coins', path: '/scheme/gold', category: 'fixed' },
  { id: 'shares', title: 'Share Market', description: 'Direct equity investments in stocks', icon: 'LineChart', path: '/scheme/shares', category: 'fixed' },
  { id: 'swp', title: 'SWP Mutual Funds', description: 'Systematic withdrawal from investments', icon: 'IndianRupee', path: '/scheme/swp', category: 'fixed' },
  { id: 'index-funds', title: 'Index Funds', description: 'Passive investment tracking market indices', icon: 'BarChart3', path: '/scheme/index-funds', category: 'fixed' },
  { id: 'ulip', title: 'ULIP Plans', description: 'Combined insurance and investment benefits', icon: 'Briefcase', path: '/scheme/ulip', category: 'fixed' },
  { id: 'suku', title: 'Sukanya Samriddhi Yojana', description: 'Government backed savings for girl child', icon: 'Wallet', path: '/scheme/post-office', category: 'fixed' },
  { id: 'startups', title: 'Startup Investment', description: 'Investment in emerging businesses', icon: 'Building', path: '/scheme/startups', category: 'fixed' },
  { id: 'senior-citizen', title: 'Senior Citizen Savings', description: 'Special savings schemes for seniors', icon: 'GraduationCap', path: '/scheme/senior-citizen', category: 'fixed' },
  { id: 'ipo', title: 'IPO Investment', description: 'Investment in new public offerings', icon: 'Trophy', path: '/scheme/ipo', category: 'fixed' },
  { id: 'reit', title: 'REITs', description: 'Real Estate Investment Trusts', icon: 'Building2', path: '/scheme/reit', category: 'fixed' },
  { id: 'rd', title: 'Recurring Deposit', description: 'Regular savings with fixed returns', icon: 'PiggyBank', path: '/scheme/rd', category: 'recurring' },
  { id: 'sip', title: 'Systematic Investment Plan (SIP)', description: 'Regular investment in mutual funds', icon: 'Calculator', path: '/scheme/sip', category: 'recurring' },
];

const iconComponents: Record<string, React.ComponentType> = {
  Calculator, IndianRupee, Landmark, PiggyBank, Wallet,
  BadgeDollarSign, Heart, GraduationCap, Building2, Coins,
  LineChart, BarChart3, Briefcase, Building, Trophy
};

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, <span className="gradient-text">{user?.username || 'Investor'}</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Explore {schemes.length} investment options across {fixedCount} fixed and {recurringCount} recurring schemes
        </p>
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
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search investment schemes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
          />
        </div>

        {/* Category Filter */}
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
