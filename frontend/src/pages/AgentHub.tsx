import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Calculator, TrendingUp, Landmark, Shield, Target, CreditCard, ArrowRight, Bot } from 'lucide-react';
import { cn } from '../lib/utils';

const agents = [
  {
    id: 'tax-planning',
    title: 'Tax Planning Advisor',
    description: 'Compare old vs new tax regime, find deductions, and get last-minute tax saving tips for FY 2024-25.',
    icon: Calculator,
    color: 'from-red-500 to-rose-400',
    bgLight: 'bg-red-50 dark:bg-red-900/20',
    features: ['Old vs New Regime', '80C/80D/NPS Deductions', 'Slab-wise Breakdown', 'Tax Saving Tips'],
  },
  {
    id: 'retirement',
    title: 'Retirement Calculator',
    description: 'Project your retirement corpus with inflation, find the gap, and get SIP top-up recommendations.',
    icon: TrendingUp,
    color: 'from-emerald-500 to-green-400',
    bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
    features: ['Corpus Projection', 'Inflation Adjustment', 'Yearly Breakdown', 'SIP Scenarios'],
  },
  {
    id: 'emi-compare',
    title: 'EMI & Loan Comparison',
    description: 'Compare EMIs across 5+ banks, analyze total interest, and find the best lender for your loan.',
    icon: Landmark,
    color: 'from-purple-500 to-violet-400',
    bgLight: 'bg-purple-50 dark:bg-purple-900/20',
    features: ['5+ Bank Comparison', 'Total Interest Analysis', 'Prepayment Impact', 'Best Lender Pick'],
  },
  {
    id: 'insurance',
    title: 'Insurance Advisor',
    description: 'Get personalized life, health, and term insurance recommendations with gap analysis.',
    icon: Shield,
    color: 'from-amber-500 to-yellow-400',
    bgLight: 'bg-amber-50 dark:bg-amber-900/20',
    features: ['Life & Health Cover', 'Gap Analysis', 'Premium Estimates', 'Tax Benefits (80C/80D)'],
  },
  {
    id: 'goal-planner',
    title: 'Goal-Based Planner',
    description: 'Set financial goals with target dates and get a prioritized SIP plan to achieve them all.',
    icon: Target,
    color: 'from-cyan-500 to-blue-400',
    bgLight: 'bg-cyan-50 dark:bg-cyan-900/20',
    features: ['Multi-Goal SIP Plan', 'Priority Ordering', 'Feasibility Scoring', 'Instrument Recommendations'],
  },
  {
    id: 'credit-score',
    title: 'Credit Score Improvement',
    description: 'Analyze your CIBIL score, understand factors, and get a step-by-step improvement plan.',
    icon: CreditCard,
    color: 'from-indigo-500 to-blue-400',
    bgLight: 'bg-indigo-50 dark:bg-indigo-900/20',
    features: ['Factor Breakdown', 'Score Projection', 'Action Plan', 'Things to Avoid'],
  },
];

export default function AgentHub() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-4 py-1.5 rounded-full text-sm font-medium">
          <Bot className="h-4 w-4" />
          Powered by Agno + LangChain + Nebius AI
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          AI Financial <span className="gradient-text">Agents</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Choose an agent below to get expert AI-powered financial analysis.
          Each agent specializes in a different aspect of personal finance.
        </p>
      </div>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {agents.map((agent) => {
          const Icon = agent.icon;
          return (
            <button
              key={agent.id}
              onClick={() => navigate(`/agents/${agent.id}`)}
              className={cn(
                'group relative text-left p-6 rounded-2xl border transition-all duration-300',
                'hover:shadow-xl hover:-translate-y-1 hover:shadow-blue-500/10',
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 hover:border-blue-500/50'
                  : 'bg-white border-gray-200 hover:border-blue-300'
              )}
            >
              {/* Icon */}
              <div className={cn('inline-flex rounded-xl p-3 mb-4 bg-gradient-to-br', agent.color)}>
                <Icon className="h-6 w-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {agent.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                {agent.description}
              </p>

              {/* Feature tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {agent.features.map((feature) => (
                  <span
                    key={feature}
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      agent.bgLight,
                      'text-gray-600 dark:text-gray-300 font-medium'
                    )}
                  >
                    {feature}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:gap-2.5 transition-all">
                Open Agent
                <ArrowRight className="h-4 w-4" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="text-center text-xs text-gray-400 dark:text-gray-500 pt-4">
        All agents use Nebius AI (Gemma 3 27B-IT) with Agno agent orchestration and LangChain prompt templates.
        Requires <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">NEBIUS_API_KEY</code> in backend <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">.env</code> for AI analysis.
      </div>
    </div>
  );
}
