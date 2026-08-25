import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, TrendingUp, Shield, Zap, ChevronRight, Star, ArrowUpRight,
  CheckCircle2, Sparkles, Globe, Lock, BarChart3, Coins, FileText, Bot
} from 'lucide-react';

const features = [
  { icon: TrendingUp, title: 'Smart Recommendations', desc: 'AI-powered investment suggestions tailored to your age, risk appetite, and goals', color: 'from-blue-500 to-cyan-400' },
  { icon: Shield, title: 'Secure & Private', desc: 'Your financial data is encrypted and never shared with third parties', color: 'from-emerald-500 to-teal-400' },
  { icon: Zap, title: 'Real-time Analysis', desc: 'Live gold rates, mutual fund NAVs, LIC policies, and stock data', color: 'from-amber-500 to-orange-400' },
  { icon: Globe, title: 'Live Market Data', desc: 'Scraped from top sources — Economic Times, BankBazaar, LIC India', color: 'from-purple-500 to-pink-400' },
  { icon: FileText, title: 'AI Document Analysis', desc: 'Upload financial docs and get instant AI-powered insights and summaries', color: 'from-rose-500 to-red-400' },
  { icon: Lock, title: 'Bank-Grade Security', desc: 'JWT authentication, encrypted storage, and zero data selling', color: 'from-indigo-500 to-blue-400' },
];

const steps = [
  { step: '01', title: 'Create Account', desc: 'Sign up in seconds with your email' },
  { step: '02', title: 'Set Your Goals', desc: 'Tell us your age, budget, and risk level' },
  { step: '03', title: 'Get Recommendations', desc: 'Our AI finds the best options for you' },
  { step: '04', title: 'Track & Grow', desc: 'Monitor your portfolio and watch it grow' },
];

const stats = [
  { value: '14+', label: 'Investment Options' },
  { value: '6+', label: 'Live Data Sources' },
  { value: '24/7', label: 'AI Advisory' },
  { value: '100%', label: 'Free to Use' },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'Software Engineer', quote: 'InvestWise helped me understand where to put my money. The AI recommendations were spot-on for my risk profile.', rating: 5 },
  { name: 'Amit Patel', role: 'Business Owner', quote: 'The document analyzer saved me hours of reading. I just upload my statements and get clear insights.', rating: 5 },
  { name: 'Sarah Johnson', role: 'Marketing Manager', quote: 'Best investment platform I have used. Clean interface, real data, and the chatbot actually gives useful advice.', rating: 5 },
];

const highlights = [
  { icon: Coins, label: 'Gold Rates', desc: 'Live city-wise rates' },
  { icon: BarChart3, label: 'Mutual Funds', desc: 'Top performing funds' },
  { icon: Shield, label: 'LIC Policies', desc: 'Endowment & money back' },
  { icon: Bot, label: 'AI Advisor', desc: 'Ask anything about finance' },
];

export const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-0">
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HERO SECTION                                              */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-8 overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium mb-8 animate-fade-in-up">
              <Sparkles className="h-4 w-4" />
              AI-Powered Financial Advisory Platform
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight animate-fade-in-up stagger-1">
              Invest Smarter.
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Build Wealth Faster.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-blue-100/80 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up stagger-2">
              Explore 14+ investment options with AI-powered recommendations, real-time market data, and expert financial guidance — all in one place.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up stagger-3">
              <button
                onClick={() => navigate('/signUp')}
                className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 flex items-center gap-2 text-base"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-white/10 backdrop-blur text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 text-base"
              >
                Sign In
              </button>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-blue-200/60 animate-fade-in-up stagger-4">
              {[
                { icon: CheckCircle2, text: 'No hidden fees' },
                { icon: CheckCircle2, text: 'Free to use' },
                { icon: CheckCircle2, text: 'Bank-grade security' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <item.icon className="h-4 w-4 text-cyan-400" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto animate-fade-in-up stagger-5">
            {stats.map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur">
                <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-blue-200/60 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* WHAT YOU GET — Product highlights                         */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="py-20">
          <div className="text-center mb-12">
            <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold uppercase tracking-wider">What you get</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2">Real data. Real advice. Real results.</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {highlights.map((h, i) => (
              <div key={i} className="group p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 text-center card-hover">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <h.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{h.label}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{h.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* HOW IT WORKS                                              */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="py-20">
          <div className="text-center mb-12">
            <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold uppercase tracking-wider">How it works</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2">Start investing in 4 steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative text-center group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{step.desc}</p>
                {i < steps.length - 1 && (
                  <ChevronRight className="hidden md:block absolute top-6 -right-4 h-5 w-5 text-gray-300 dark:text-gray-600" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* FEATURES                                                   */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="py-20">
          <div className="text-center mb-12">
            <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold uppercase tracking-wider">Features</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2">Everything you need to invest wisely</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-2xl mx-auto">Powerful tools and real-time data to make informed investment decisions</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="group p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 card-hover cursor-default">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* TESTIMONIALS                                               */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="py-20">
          <div className="text-center mb-12">
            <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold uppercase tracking-wider">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2">Trusted by thousands of investors</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 card-hover">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-semibold text-sm">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-gray-900 dark:text-white">{t.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* CTA                                                        */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="py-20">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 text-white p-10 md:p-16">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-300 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
            </div>
            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to start your investment journey?</h2>
              <p className="text-blue-100 text-lg mb-8">Join thousands of smart investors who trust InvestWise for their financial growth.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => navigate('/signUp')}
                  className="group px-8 py-4 bg-white text-blue-700 font-semibold rounded-xl hover:shadow-xl hover:shadow-white/20 transition-all duration-300 flex items-center gap-2"
                >
                  Create Free Account
                  <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-8 py-4 bg-white/10 backdrop-blur text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
