import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';
import { Calculator, TrendingUp, Landmark, Shield, Target, CreditCard, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

/* ─────────────────────────────────────────────
   Shared result display components
   ───────────────────────────────────────────── */

function StatCard({ label, value, icon: Icon, color = 'blue' }: { label: string; value: string; icon: any; color?: string }) {
  const colorMap: Record<string, string> = {
    blue: 'from-blue-500 to-cyan-400',
    green: 'from-emerald-500 to-green-400',
    red: 'from-red-500 to-rose-400',
    purple: 'from-purple-500 to-violet-400',
    amber: 'from-amber-500 to-yellow-400',
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-3">
        <div className={cn('bg-gradient-to-br rounded-lg p-2', colorMap[color])}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ResultSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ═════════════════════════════════════════════
   1. TAX PLANNING
   ═════════════════════════════════════════════ */

export function TaxPlanningPage() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const [form, setForm] = useState({
    annual_income: '',
    basic_salary: '',
    hra_received: '',
    rent_paid: '',
    is_metro: false,
    investments_80c: '',
    insurance_80d: '',
    nps_80ccd: '',
    home_loan_interest: '',
    other_deductions: '',
  });

  const handleSubmit = async () => {
    if (!form.annual_income) { setError('Annual income is required'); return; }
    setLoading(true); setError('');
    try {
      const body: any = { annual_income: Number(form.annual_income) };
      if (form.basic_salary) body.basic_salary = Number(form.basic_salary);
      if (form.hra_received) body.hra_received = Number(form.hra_received);
      if (form.rent_paid) body.rent_paid = Number(form.rent_paid);
      if (form.is_metro) body.is_metro = true;
      if (form.investments_80c) body.investments_80c = Number(form.investments_80c);
      if (form.insurance_80d) body.insurance_80d = Number(form.insurance_80d);
      if (form.nps_80ccd) body.nps_80ccd = Number(form.nps_80ccd);
      if (form.home_loan_interest) body.home_loan_interest = Number(form.home_loan_interest);
      if (form.other_deductions) body.other_deductions = Number(form.other_deductions);

      const res = await fetch('http://localhost:5000/tax-planning', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Request failed');
      setResult(await res.json());
    } catch { setError('Failed to analyze. Check if the backend is running.'); }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-red-500 to-rose-400 rounded-xl p-3"><Calculator className="h-6 w-6 text-white" /></div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tax Planning Advisor</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Compare old vs new tax regime and find deductions</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'annual_income', label: 'Annual Income (₹)', placeholder: '1200000', required: true },
            { key: 'basic_salary', label: 'Basic Salary (₹/year)', placeholder: '600000' },
            { key: 'hra_received', label: 'HRA Received (₹/year)', placeholder: '200000' },
            { key: 'rent_paid', label: 'Monthly Rent (₹)', placeholder: '15000' },
            { key: 'investments_80c', label: '80C Investments (₹)', placeholder: '150000' },
            { key: 'insurance_80d', label: '80D Insurance (₹)', placeholder: '25000' },
            { key: 'nps_80ccd', label: 'NPS 80CCD(1B) (₹)', placeholder: '50000' },
            { key: 'home_loan_interest', label: 'Home Loan Interest 24(b) (₹)', placeholder: '200000' },
            { key: 'other_deductions', label: 'Other Deductions (₹)', placeholder: '' },
          ].map(({ key, label, placeholder, required }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}{required && ' *'}</label>
              <input type="number" placeholder={placeholder} value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          <input type="checkbox" checked={form.is_metro} onChange={e => setForm({ ...form, is_metro: e.target.checked })} className="rounded" />
          Live in metro city (Delhi, Mumbai, Chennai, Kolkata)
        </label>
        {error && <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg"><AlertCircle className="h-4 w-4" />{error}</div>}
        <button onClick={handleSubmit} disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
          {loading ? 'Analyzing...' : 'Analyze Tax'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Old Regime Tax" value={`₹${result.old_regime?.total_tax?.toLocaleString() || '—'}`} icon={Landmark} color="amber" />
            <StatCard label="New Regime Tax" value={`₹${result.new_regime?.total_tax?.toLocaleString() || '—'}`} icon={Calculator} color="blue" />
            <StatCard label="Recommended" value={result.recommended_regime?.toUpperCase() || '—'} icon={TrendingUp} color="green" />
            <StatCard label="You Save" value={`₹${result.savings?.toLocaleString() || '—'}`} icon={Target} color="green" />
          </div>

          {/* Regime comparison */}
          <div className="grid md:grid-cols-2 gap-4">
            {['old_regime', 'new_regime'].map(regime => {
              const r = result[regime]; if (!r) return null;
              const isRecommended = result.recommended_regime === regime.replace('_regime', '');
              return (
                <div key={regime} className={cn('bg-white dark:bg-gray-800 rounded-xl border p-5', isRecommended ? 'border-green-400 dark:border-green-500 ring-2 ring-green-400/20' : 'border-gray-200 dark:border-gray-700')}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white capitalize">{regime.replace('_', ' ')} Regime</h3>
                    {isRecommended && <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">RECOMMENDED</span>}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Gross Income</span><span className="font-medium">₹{r.gross_income?.toLocaleString()}</span></div>
                    {r.total_deductions !== undefined && <div className="flex justify-between"><span className="text-gray-500">Deductions</span><span className="font-medium">-₹{r.total_deductions?.toLocaleString()}</span></div>}
                    {r.standard_deduction !== undefined && <div className="flex justify-between"><span className="text-gray-500">Standard Deduction</span><span className="font-medium">-₹{r.standard_deduction?.toLocaleString()}</span></div>}
                    <div className="flex justify-between"><span className="text-gray-500">Taxable Income</span><span className="font-medium">₹{r.taxable_income?.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Tax + Cess</span><span className="font-medium">₹{r.total_tax?.toLocaleString()}</span></div>
                  </div>
                  {r.slab_breakdown && (
                    <div className="mt-4 space-y-1">
                      {r.slab_breakdown.map((s: any, i: number) => (
                        <div key={i} className="flex justify-between text-xs text-gray-500">
                          <span>{s.slab}</span>
                          <span>{s.rate} → ₹{s.tax?.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Deduction suggestions */}
          {result.deduction_suggestions?.length > 0 && (
            <ResultSection title="💡 Deduction Suggestions">
              <div className="space-y-3">
                {result.deduction_suggestions.map((d: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className={cn('text-xs font-bold px-2 py-0.5 rounded-full mt-0.5', d.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : d.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400')}>
                      {d.priority}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{d.section} — {d.description}</p>
                      <p className="text-xs text-gray-500">Max benefit: ₹{d.max_benefit?.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ResultSection>
          )}

          {result.last_minute_tips?.length > 0 && (
            <ResultSection title="⏰ Last-Minute Tips">
              <ul className="space-y-2">
                {result.last_minute_tips.map((tip: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </ResultSection>
          )}
        </div>
      )}
    </div>
  );
}

/* ═════════════════════════════════════════════
   2. RETIREMENT CALCULATOR
   ═════════════════════════════════════════════ */

export function RetirementCalculatorPage() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const [form, setForm] = useState({
    current_age: '', retirement_age: '60', current_monthly_savings: '',
    monthly_expenses: '', expected_return_rate: '12', inflation_rate: '6', current_corpus: '',
  });

  const handleSubmit = async () => {
    if (!form.current_age || !form.current_monthly_savings || !form.monthly_expenses) { setError('Age, savings, and expenses are required'); return; }
    setLoading(true); setError('');
    try {
      const body: any = { current_age: Number(form.current_age), retirement_age: Number(form.retirement_age), current_monthly_savings: Number(form.current_monthly_savings), monthly_expenses: Number(form.monthly_expenses), expected_return_rate: Number(form.expected_return_rate) / 100, inflation_rate: Number(form.inflation_rate) / 100 };
      if (form.current_corpus) body.current_corpus = Number(form.current_corpus);
      const res = await fetch('http://localhost:5000/retirement-calculator', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Request failed');
      setResult(await res.json());
    } catch { setError('Failed to calculate. Check if the backend is running.'); }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-emerald-500 to-green-400 rounded-xl p-3"><TrendingUp className="h-6 w-6 text-white" /></div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Retirement Corpus Calculator</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Project your retirement corpus and find the SIP top-up needed</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'current_age', label: 'Current Age', placeholder: '30', required: true },
            { key: 'retirement_age', label: 'Retirement Age', placeholder: '60' },
            { key: 'current_monthly_savings', label: 'Monthly Savings (₹)', placeholder: '15000', required: true },
            { key: 'monthly_expenses', label: 'Monthly Expenses (₹)', placeholder: '40000', required: true },
            { key: 'expected_return_rate', label: 'Expected Return (%)', placeholder: '12' },
            { key: 'inflation_rate', label: 'Inflation Rate (%)', placeholder: '6' },
            { key: 'current_corpus', label: 'Current Corpus (₹)', placeholder: '500000' },
          ].map(({ key, label, placeholder, required }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}{required && ' *'}</label>
              <input type="number" placeholder={placeholder} value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
          ))}
        </div>
        {error && <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg"><AlertCircle className="h-4 w-4" />{error}</div>}
        <button onClick={handleSubmit} disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
          {loading ? 'Calculating...' : 'Calculate Retirement'}
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Corpus Needed" value={`₹${(result.projections?.corpus_needed || 0).toLocaleString()}`} icon={Target} color="blue" />
            <StatCard label="Current Trajectory" value={`₹${(result.projections?.current_trajectory || 0).toLocaleString()}`} icon={TrendingUp} color="green" />
            <StatCard label="Gap" value={`₹${(result.projections?.gap || 0).toLocaleString()}`} icon={AlertCircle} color="red" />
            <StatCard label="SIP Top-Up" value={`₹${(result.sip_recommendations?.top_up_needed || 0).toLocaleString()}/mo`} icon={Calculator} color="purple" />
          </div>

          {result.sip_recommendations && (
            <ResultSection title="📈 SIP Recommendations">
              <div className="grid md:grid-cols-3 gap-3">
                {result.sip_recommendations.alternative_scenarios?.map((s: any, i: number) => (
                  <div key={i} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">₹{s.monthly_sip?.toLocaleString()}/mo</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">→ ₹{s.expected_corpus?.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </ResultSection>
          )}

          {result.yearly_breakdown?.length > 0 && (
            <ResultSection title="📊 Yearly Breakdown">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 text-gray-500">Age</th>
                    <th className="text-left py-2 text-gray-500">Year</th>
                    <th className="text-right py-2 text-gray-500">Invested</th>
                    <th className="text-right py-2 text-gray-500">Corpus</th>
                  </tr></thead>
                  <tbody>
                    {result.yearly_breakdown.filter((_: any, i: number) => i % 5 === 0 || i === result.yearly_breakdown.length - 1).map((row: any, i: number) => (
                      <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-2 font-medium">{row.age}</td>
                        <td className="py-2 text-gray-500">{row.year}</td>
                        <td className="py-2 text-right">₹{row.invested?.toLocaleString()}</td>
                        <td className="py-2 text-right font-medium text-green-600 dark:text-green-400">₹{row.corpus?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ResultSection>
          )}
        </div>
      )}
    </div>
  );
}

/* ═════════════════════════════════════════════
   3. EMI & LOAN COMPARISON
   ═════════════════════════════════════════════ */

export function EMIComparisonPage() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const [form, setForm] = useState({ loan_amount: '', tenure_years: '10', loan_type: 'home', prepayment_amount: '' });

  const handleSubmit = async () => {
    if (!form.loan_amount) { setError('Loan amount is required'); return; }
    setLoading(true); setError('');
    try {
      const body: any = { loan_amount: Number(form.loan_amount), tenure_years: Number(form.tenure_years), loan_type: form.loan_type };
      if (form.prepayment_amount) body.prepayment_amount = Number(form.prepayment_amount);
      const res = await fetch('http://localhost:5000/emi-comparison', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Request failed');
      setResult(await res.json());
    } catch { setError('Failed to compare. Check if the backend is running.'); }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-purple-500 to-violet-400 rounded-xl p-3"><Landmark className="h-6 w-6 text-white" /></div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">EMI & Loan Comparison</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Compare EMIs across 5+ banks and find the best lender</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loan Amount (₹) *</label>
            <input type="number" placeholder="5000000" value={form.loan_amount} onChange={e => setForm({ ...form, loan_amount: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tenure (Years)</label>
            <input type="number" placeholder="10" value={form.tenure_years} onChange={e => setForm({ ...form, tenure_years: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loan Type</label>
            <select value={form.loan_type} onChange={e => setForm({ ...form, loan_type: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
              <option value="home">Home Loan</option>
              <option value="car">Car Loan</option>
              <option value="education">Education Loan</option>
              <option value="personal">Personal Loan</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prepayment Amount (₹/month, optional)</label>
            <input type="number" placeholder="5000" value={form.prepayment_amount} onChange={e => setForm({ ...form, prepayment_amount: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
          </div>
        </div>
        {error && <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg"><AlertCircle className="h-4 w-4" />{error}</div>}
        <button onClick={handleSubmit} disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Landmark className="h-4 w-4" />}
          {loading ? 'Comparing...' : 'Compare EMIs'}
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          {/* Best lender highlight */}
          {result.best_lender && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-400 rounded-xl p-5 text-white">
              <p className="text-sm font-medium opacity-80">🏆 Best Lender</p>
              <p className="text-2xl font-bold">{result.best_lender.name}</p>
              <p className="text-sm opacity-90 mt-1">{result.best_lender.reason}</p>
              <p className="text-sm font-semibold mt-1">Saves ₹{result.best_lender.total_savings?.toLocaleString()}</p>
            </div>
          )}

          {/* Bank comparison table */}
          {result.comparisons?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Bank</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">Rate</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">EMI</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">Total Interest</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">Total Payment</th>
                  </tr></thead>
                  <tbody>
                    {result.comparisons.map((c: any, i: number) => (
                      <tr key={i} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{c.bank}</td>
                        <td className="px-4 py-3 text-right">{c.interest_rate}%</td>
                        <td className="px-4 py-3 text-right font-semibold text-blue-600 dark:text-blue-400">₹{c.monthly_emi?.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-red-600 dark:text-red-400">₹{c.total_interest?.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">₹{c.total_payment?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Prepayment analysis */}
          {result.prepayment_analysis && (
            <ResultSection title="💰 Prepayment Impact">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-500">Extra Monthly</p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">₹{result.prepayment_analysis.monthly_extra?.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-gray-500">New Tenure</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">{result.prepayment_analysis.new_tenure_months} months</p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm text-gray-500">Interest Saved</p>
                  <p className="text-xl font-bold text-purple-600 dark:text-purple-400">₹{result.prepayment_analysis.interest_saved?.toLocaleString()}</p>
                </div>
              </div>
            </ResultSection>
          )}
        </div>
      )}
    </div>
  );
}

/* ═════════════════════════════════════════════
   4. INSURANCE ADVISOR
   ═════════════════════════════════════════════ */

export function InsuranceAdvisorPage() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const [form, setForm] = useState({ age: '', annual_income: '', dependants: '0', health_conditions: '', city: '' });

  const handleSubmit = async () => {
    if (!form.age || !form.annual_income) { setError('Age and income are required'); return; }
    setLoading(true); setError('');
    try {
      const body: any = { age: Number(form.age), annual_income: Number(form.annual_income), dependants: Number(form.dependants) };
      if (form.health_conditions) body.health_conditions = form.health_conditions.split(',').map(s => s.trim());
      if (form.city) body.city = form.city;
      const res = await fetch('http://localhost:5000/insurance-advisor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Request failed');
      setResult(await res.json());
    } catch { setError('Failed. Check if the backend is running.'); }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-amber-500 to-yellow-400 rounded-xl p-3"><Shield className="h-6 w-6 text-white" /></div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Insurance Advisor</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Get personalized life, health, and term insurance recommendations</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'age', label: 'Age', placeholder: '30', required: true },
            { key: 'annual_income', label: 'Annual Income (₹)', placeholder: '1200000', required: true },
            { key: 'dependants', label: 'Number of Dependants', placeholder: '2' },
            { key: 'health_conditions', label: 'Health Conditions (comma-separated)', placeholder: 'diabetes, hypertension' },
          ].map(({ key, label, placeholder, required }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}{required && ' *'}</label>
              <input type={key === 'health_conditions' ? 'text' : 'number'} placeholder={placeholder} value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
          ))}
        </div>
        {error && <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg"><AlertCircle className="h-4 w-4" />{error}</div>}
        <button onClick={handleSubmit} disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
          {loading ? 'Analyzing...' : 'Get Insurance Advice'}
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          {result.gap_analysis && (
            <div className={cn('rounded-xl p-5 text-white', result.gap_analysis.gap_status === 'underinsured' ? 'bg-gradient-to-r from-red-500 to-rose-400' : result.gap_analysis.gap_status === 'adequately_insured' ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-blue-500 to-cyan-400')}>
              <p className="text-sm font-medium opacity-80">Coverage Status</p>
              <p className="text-2xl font-bold capitalize">{result.gap_analysis.gap_status?.replace('_', ' ')}</p>
              <p className="text-sm opacity-90 mt-1">Gap: ₹{result.gap_analysis.coverage_gap?.toLocaleString()}</p>
            </div>
          )}

          {result.recommended_coverage && (
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(result.recommended_coverage).map(([key, val]: [string, any]) => (
                <div key={key} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white capitalize mb-2">{key.replace(/_/g, ' ')}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Recommended</span><span className="font-medium">₹{val.recommended_amount?.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Est. Premium</span><span className="font-medium">₹{val.monthly_premium_estimate?.toLocaleString()}/mo</span></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{val.reasoning}</p>
                </div>
              ))}
            </div>
          )}

          {result.tax_benefits && (
            <ResultSection title="💰 Tax Benefits">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div><p className="text-sm text-gray-500">80C (Life)</p><p className="text-lg font-bold">₹{result.tax_benefits.section_80c?.toLocaleString()}</p></div>
                <div><p className="text-sm text-gray-500">80D (Health)</p><p className="text-lg font-bold">₹{result.tax_benefits.section_80d?.toLocaleString()}</p></div>
                <div><p className="text-sm text-gray-500">Total Saved</p><p className="text-lg font-bold text-green-600">₹{result.tax_benefits.total_tax_saved?.toLocaleString()}</p></div>
              </div>
            </ResultSection>
          )}
        </div>
      )}
    </div>
  );
}

/* ═════════════════════════════════════════════
   5. GOAL-BASED FINANCIAL PLANNER
   ═════════════════════════════════════════════ */

export function GoalPlannerPage() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [monthlyExpenses, setMonthlyExpenses] = useState('');
  const [currentSavings, setCurrentSavings] = useState('');
  const [goals, setGoals] = useState([
    { name: 'House Down Payment', target_amount: '1500000', target_date: '2028-12-31' },
    { name: 'Child Education', target_amount: '2000000', target_date: '2035-06-01' },
  ]);

  const addGoal = () => setGoals([...goals, { name: '', target_amount: '', target_date: '' }]);
  const removeGoal = (i: number) => setGoals(goals.filter((_, idx) => idx !== i));
  const updateGoal = (i: number, key: string, val: string) => { const g = [...goals]; (g[i] as any)[key] = val; setGoals(g); };

  const handleSubmit = async () => {
    if (!monthlyIncome || goals.length === 0) { setError('Income and at least one goal are required'); return; }
    setLoading(true); setError('');
    try {
      const body = { monthly_income: Number(monthlyIncome), monthly_expenses: Number(monthlyExpenses) || 0, current_savings: Number(currentSavings) || 0, goals: goals.filter(g => g.name && g.target_amount).map(g => ({ name: g.name, target_amount: Number(g.target_amount), target_date: g.target_date })) };
      const res = await fetch('http://localhost:5000/goal-planner', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Request failed');
      setResult(await res.json());
    } catch { setError('Failed. Check if the backend is running.'); }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-cyan-500 to-blue-400 rounded-xl p-3"><Target className="h-6 w-6 text-white" /></div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Goal-Based Financial Planner</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Set goals and get a personalized SIP plan</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { state: monthlyIncome, set: setMonthlyIncome, label: 'Monthly Income (₹) *', placeholder: '100000' },
            { state: monthlyExpenses, set: setMonthlyExpenses, label: 'Monthly Expenses (₹)', placeholder: '40000' },
            { state: currentSavings, set: setCurrentSavings, label: 'Current Savings (₹)', placeholder: '500000' },
          ].map(({ state, set, label, placeholder }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
              <input type="number" placeholder={placeholder} value={state} onChange={e => set(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Goals</h3>
            <button onClick={addGoal} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">+ Add Goal</button>
          </div>
          <div className="space-y-2">
            {goals.map((goal, i) => (
              <div key={i} className="flex items-center gap-2">
                <input placeholder="Goal name" value={goal.name} onChange={e => updateGoal(i, 'name', e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" />
                <input type="number" placeholder="Amount (₹)" value={goal.target_amount} onChange={e => updateGoal(i, 'target_amount', e.target.value)}
                  className="w-32 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" />
                <input type="date" value={goal.target_date} onChange={e => updateGoal(i, 'target_date', e.target.value)}
                  className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" />
                {goals.length > 1 && <button onClick={() => removeGoal(i)} className="text-red-400 hover:text-red-600 text-lg">×</button>}
              </div>
            ))}
          </div>
        </div>

        {error && <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg"><AlertCircle className="h-4 w-4" />{error}</div>}
        <button onClick={handleSubmit} disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
          {loading ? 'Planning...' : 'Plan My Goals'}
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          {result.monthly_budget_allocation && (
            <div className={cn('rounded-xl p-5 text-white', (result.monthly_budget_allocation.surplus_deficit || 0) >= 0 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-red-500 to-rose-400')}>
              <p className="text-sm font-medium opacity-80">Monthly Budget</p>
              <p className="text-2xl font-bold">Total SIP: ₹{result.monthly_budget_allocation.total_sip_needed?.toLocaleString()}/mo</p>
              <p className="text-sm opacity-90">{result.monthly_budget_allocation.adjustment_suggestion}</p>
            </div>
          )}

          {result.goals?.map((goal: any, i: number) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">{goal.name}</h3>
                <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', goal.feasibility === 'easily_achievable' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : goal.feasibility === 'stretch' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400')}>
                  {goal.feasibility?.replace('_', ' ')}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div><p className="text-gray-500">Target</p><p className="font-medium">₹{goal.target_amount?.toLocaleString()}</p></div>
                <div><p className="text-gray-500">Monthly SIP</p><p className="font-bold text-blue-600 dark:text-blue-400">₹{goal.monthly_sip_needed?.toLocaleString()}</p></div>
                <div><p className="text-gray-500">Lumpsum Today</p><p className="font-medium">₹{goal.lumpsum_today?.toLocaleString()}</p></div>
                <div><p className="text-gray-500">Years Left</p><p className="font-medium">{goal.years_remaining}</p></div>
              </div>
              {goal.recommended_instruments && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {goal.recommended_instruments.map((inst: any, j: number) => (
                    <span key={j} className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full">{inst.name} ({inst.allocation}%)</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═════════════════════════════════════════════
   6. CREDIT SCORE IMPROVEMENT
   ═════════════════════════════════════════════ */

export function CreditScorePage() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const [form, setForm] = useState({
    current_score: '', credit_cards: '2', total_credit_limit: '', current_utilization: '',
    oldest_account_years: '', recent_inquiries: '0', payment_history: 'good', missed_payments: '0',
  });

  const handleSubmit = async () => {
    setLoading(true); setError('');
    try {
      const body: any = {};
      if (form.current_score) body.current_score = Number(form.current_score);
      if (form.credit_cards) body.credit_cards = Number(form.credit_cards);
      if (form.total_credit_limit) body.total_credit_limit = Number(form.total_credit_limit);
      if (form.current_utilization) body.current_utilization = Number(form.current_utilization);
      if (form.oldest_account_years) body.oldest_account_years = Number(form.oldest_account_years);
      if (form.recent_inquiries) body.recent_inquiries = Number(form.recent_inquiries);
      if (form.payment_history) body.payment_history = form.payment_history;
      if (form.missed_payments) body.missed_payments = Number(form.missed_payments);
      const res = await fetch('http://localhost:5000/credit-score', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Request failed');
      setResult(await res.json());
    } catch { setError('Failed. Check if the backend is running.'); }
    setLoading(false);
  };

  const ratingColors: Record<string, string> = {
    poor: 'from-red-500 to-rose-400',
    fair: 'from-amber-500 to-yellow-400',
    good: 'from-blue-500 to-cyan-400',
    very_good: 'from-green-500 to-emerald-400',
    excellent: 'from-purple-500 to-violet-400',
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-indigo-500 to-blue-400 rounded-xl p-3"><CreditCard className="h-6 w-6 text-white" /></div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Credit Score Improvement</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Analyze your CIBIL score and get a personalized improvement plan</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'current_score', label: 'CIBIL Score (if known)', placeholder: '700' },
            { key: 'credit_cards', label: 'Active Credit Cards', placeholder: '2' },
            { key: 'total_credit_limit', label: 'Total Credit Limit (₹)', placeholder: '500000' },
            { key: 'current_utilization', label: 'Credit Utilization (%)', placeholder: '40' },
            { key: 'oldest_account_years', label: 'Oldest Account (years)', placeholder: '5' },
            { key: 'recent_inquiries', label: 'Hard Inquiries (last 6 mo)', placeholder: '2' },
            { key: 'missed_payments', label: 'Missed Payments (last 12 mo)', placeholder: '0' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
              <input type="number" placeholder={placeholder} value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment History</label>
            <select value={form.payment_history} onChange={e => setForm({ ...form, payment_history: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>
        </div>
        {error && <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg"><AlertCircle className="h-4 w-4" />{error}</div>}
        <button onClick={handleSubmit} disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
          {loading ? 'Analyzing...' : 'Analyze Credit Score'}
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          {/* Score rating banner */}
          {result.current_score_analysis && (
            <div className={cn('rounded-xl p-5 text-white bg-gradient-to-r', ratingColors[result.current_score_analysis.rating] || 'from-gray-500 to-gray-400')}>
              <p className="text-sm font-medium opacity-80">Your Score Range</p>
              <p className="text-3xl font-bold">{result.current_score_analysis.estimated_score_range}</p>
              <p className="text-lg capitalize">{result.current_score_analysis.rating?.replace('_', ' ')}</p>
            </div>
          )}

          {/* Factor breakdown */}
          {result.factor_breakdown && (
            <ResultSection title="📊 Factor Breakdown">
              <div className="space-y-3">
                {Object.entries(result.factor_breakdown).map(([key, val]: [string, any]) => (
                  <div key={key} className="flex items-center gap-4">
                    <div className="w-32 text-xs font-medium text-gray-500 capitalize">{key.replace(/_/g, ' ')}</div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div className={cn('h-2.5 rounded-full', val.score >= 7 ? 'bg-green-500' : val.score >= 4 ? 'bg-amber-500' : 'bg-red-500')}
                        style={{ width: `${(val.score || 0) * 10}%` }} />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{val.score}/10</span>
                  </div>
                ))}
              </div>
            </ResultSection>
          )}

          {/* Projected timeline */}
          {result.projected_timeline && (
            <ResultSection title="📈 Projected Score Timeline">
              <div className="grid grid-cols-4 gap-4 text-center">
                {Object.entries(result.projected_timeline).map(([period, score]: [string, any]) => (
                  <div key={period} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs text-gray-500">{period}</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{score}</p>
                  </div>
                ))}
              </div>
            </ResultSection>
          )}

          {/* Improvement plan */}
          {result.improvement_plan && (
            <ResultSection title="✅ Improvement Plan">
              {['immediate_actions', 'short_term', 'long_term'].map(period => {
                const items = result.improvement_plan[period];
                if (!items?.length) return null;
                return (
                  <div key={period} className="mb-4 last:mb-0">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 capitalize">{period.replace(/_/g, ' ')}</h4>
                    <div className="space-y-2">
                      {items.map((item: any, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-white">{item.action}</p>
                            <div className="flex gap-3 mt-1">
                              <span className="text-xs text-green-600 dark:text-green-400 font-medium">{item.expected_impact}</span>
                              <span className="text-xs text-gray-500">{item.timeline}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </ResultSection>
          )}

          {/* Things to avoid */}
          {result.things_to_avoid?.length > 0 && (
            <ResultSection title="🚫 Things to Avoid">
              <ul className="space-y-2">
                {result.things_to_avoid.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-red-500 mt-0.5">✕</span>{item}
                  </li>
                ))}
              </ul>
            </ResultSection>
          )}
        </div>
      )}
    </div>
  );
}
