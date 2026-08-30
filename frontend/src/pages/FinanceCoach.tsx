import { useState, useRef } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import {
  Brain, Upload, Plus, Trash2, DollarSign, TrendingDown,
  PiggyBank, CreditCard, Loader2, AlertCircle, ChevronDown, ChevronUp,
  Download, FileText,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const EXPENSE_CATEGORIES = [
  { key: 'Housing', label: 'Housing', icon: '🏠' },
  { key: 'Utilities', label: 'Utilities', icon: '🔌' },
  { key: 'Food', label: 'Food', icon: '🍽️' },
  { key: 'Transportation', label: 'Transportation', icon: '🚗' },
  { key: 'Healthcare', label: 'Healthcare', icon: '🏥' },
  { key: 'Entertainment', label: 'Entertainment', icon: '🎭' },
  { key: 'Personal', label: 'Personal', icon: '👤' },
  { key: 'Education', label: 'Education', icon: '📚' },
  { key: 'Savings', label: 'Savings', icon: '💰' },
  { key: 'Other', label: 'Other', icon: '📦' },
];

const PIE_COLORS = [
  '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#64748b',
];

interface BudgetAnalysis {
  total_expenses: number;
  monthly_income: number;
  spending_categories: { category: string; amount: number; percentage: number }[];
  recommendations: { category: string; recommendation: string; potential_savings: number }[];
}

interface SavingsStrategy {
  emergency_fund: { recommended_amount: number; current_amount: number; current_status: string };
  recommendations: { category: string; amount: number; rationale: string }[];
  automation_techniques: { name: string; description: string }[];
}

interface DebtReduction {
  total_debt: number;
  debts: { name: string; amount: number; interest_rate: number; min_payment: number }[];
  payoff_plans: {
    avalanche: { total_interest: number; months_to_payoff: number; monthly_payment: number };
    snowball: { total_interest: number; months_to_payoff: number; monthly_payment: number };
  };
  recommendations: { title: string; description: string; impact: string }[];
}

interface Debt {
  name: string;
  amount: number;
  interest_rate: number;
  min_payment: number;
}

export default function FinanceCoach() {
  const { theme } = useTheme();

  // --- Input state ---
  const [monthlyIncome, setMonthlyIncome] = useState(3000);
  const [dependants, setDependants] = useState(0);
  const [expenses, setExpenses] = useState<Record<string, number>>({});
  const [debts, setDebts] = useState<Debt[]>([]);
  const [inputMode, setInputMode] = useState<'manual' | 'csv'>('manual');
  const [csvData, setCsvData] = useState<any[] | null>(null);
  const [csvFileName, setCsvFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // --- Results state ---
  const [results, setResults] = useState<{
    budget_analysis: BudgetAnalysis;
    savings_strategy: SavingsStrategy;
    debt_reduction: DebtReduction;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'budget' | 'savings' | 'debt'>('budget');

  // --- UI state ---
  const [showDebts, setShowDebts] = useState(true);

  const totalExpenses = Object.values(expenses).reduce((a, b) => a + b, 0);

  // --- File handling (CSV + Excel) ---
  const parseRows = (rows: Record<string, any>[]) => {
    // Normalize header names: trim, lowercase compare
    const normalize = (s: string) => s.trim().toLowerCase().replace(/[^a-z]/g, '');
    
    // Find the category and amount column indices from the first row's keys
    const allKeys = rows.length > 0 ? Object.keys(rows[0]) : [];
    let catKey = allKeys.find((k) => normalize(k) === 'category');
    let amtKey = allKeys.find((k) => normalize(k) === 'amount');
    
    if (!catKey) catKey = allKeys[1] || allKeys[0]; // fallback: 2nd column
    if (!amtKey) amtKey = allKeys[2] || allKeys[1]; // fallback: 3rd column
    
    // Aggregate by category
    const aggregated: Record<string, number> = {};
    const cleanRows: { Category: string; Amount: number; Date?: string }[] = [];
    
    rows.forEach((row) => {
      const cat = (row[catKey!] || 'Other').toString().trim();
      const rawAmt = (row[amtKey!] || '0').toString().replace(/[$,£₹€]/g, '');
      const amt = parseFloat(rawAmt);
      if (isNaN(amt) || amt <= 0) return; // skip rows with no valid amount
      
      // Date: try to parse, skip if placeholder like xxxx, N/A, etc.
      const rawDate = (row.Date || row.date || row['Date '] || '').toString().trim();
      const isValidDate = rawDate && !/^[xXnNaA?\-]+$/.test(rawDate) && rawDate.length > 3;
      
      aggregated[cat] = (aggregated[cat] || 0) + amt;
      cleanRows.push({ Category: cat, Amount: amt, ...(isValidDate ? { Date: rawDate } : {}) });
    });
    
    return { aggregated, cleanRows };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    const reader = new FileReader();
    
    if (ext === 'csv') {
      // Parse CSV
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const lines = text.split('\n').filter((l) => l.trim());
        if (lines.length < 2) return;
        const headers = lines[0].split(',').map((h) => h.trim());
        const rows = lines.slice(1).map((line) => {
          const vals = line.split(',');
          const row: Record<string, string> = {};
          headers.forEach((h, i) => (row[h] = vals[i]?.trim() || ''));
          return row;
        });
        const { aggregated, cleanRows } = parseRows(rows);
        setExpenses(aggregated);
        setInputMode('manual');
        setCsvData(cleanRows);
      };
      reader.readAsText(file);
    } else if (ext === 'xlsx' || ext === 'xls') {
      // Parse Excel
      reader.onload = (ev) => {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet);
        if (rows.length === 0) return;
        const { aggregated, cleanRows } = parseRows(rows);
        setExpenses(aggregated);
        setInputMode('manual');
        setCsvData(cleanRows);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const downloadTemplate = (format: 'csv' | 'xlsx') => {
    const templateData = [
      { Date: '2024-01-01', Category: 'Housing', Amount: 1200 },
      { Date: '2024-01-02', Category: 'Food', Amount: 150.5 },
      { Date: '2024-01-03', Category: 'Transportation', Amount: 45 },
      { Date: 'xxxx-xx-xx', Category: 'Entertainment', Amount: 30 },
    ];
    
    if (format === 'csv') {
      const csv = 'Date,Category,Amount\n' + templateData.map((r) => `${r.Date},${r.Category},${r.Amount}`).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'expense_template.csv';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const ws = XLSX.utils.json_to_sheet(templateData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
      XLSX.writeFile(wb, 'expense_template.xlsx');
    }
  };

  // --- Debt management ---
  const addDebt = () => {
    setDebts([...debts, { name: `Debt ${debts.length + 1}`, amount: 1000, interest_rate: 5, min_payment: 50 }]);
  };

  const updateDebt = (i: number, field: keyof Debt, value: string | number) => {
    const next = [...debts];
    (next[i] as any)[field] = value;
    setDebts(next);
  };

  const removeDebt = (i: number) => {
    setDebts(debts.filter((_, idx) => idx !== i));
  };

  // --- Analyze ---
  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    setResults(null);

    const payload = {
      monthly_income: monthlyIncome,
      dependants,
      manual_expenses: totalExpenses > 0 ? expenses : null,
      debts,
    };

    try {
      const { data } = await axios.post(`${API}/analyze-finances`, payload, { timeout: 120000 });
      setResults(data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const is = (v: any) => v === 'dark' || theme === 'dark';

  // --- Chart data ---
  const pieData = results?.budget_analysis?.spending_categories
    ?.filter((c) => c.amount > 0)
    .map((c) => ({ name: c.category, value: c.amount })) || [];

  const incomeVsExpense = results?.budget_analysis
    ? [
        { name: 'Income', value: results.budget_analysis.monthly_income },
        { name: 'Expenses', value: results.budget_analysis.total_expenses },
      ]
    : [];

  return (
    <div className={cn('min-h-[calc(100vh-4rem)]', is('dark') ? 'text-white' : 'text-gray-900')}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-2.5">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">AI Financial Coach</h1>
            <p className={cn('text-sm', is('dark') ? 'text-gray-400' : 'text-gray-500')}>
              Multi-agent analysis: Budget · Savings · Debt Reduction
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* ====================== INPUT PANEL ====================== */}
        <div className="xl:col-span-2 space-y-6">
          {/* Income & Dependants */}
          <div className={cn('rounded-2xl border p-6', is('dark') ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200')}>
            <h3 className="flex items-center gap-2 font-semibold mb-4">
              <DollarSign className="h-5 w-5 text-emerald-500" /> Income & Household
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={cn('text-xs font-medium mb-1 block', is('dark') ? 'text-gray-400' : 'text-gray-500')}>Monthly Income ($)</label>
                <input
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                  className={cn('w-full px-3 py-2 rounded-xl border text-sm focus:ring-2 focus:ring-indigo-500 outline-none',
                    is('dark') ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                  )}
                />
              </div>
              <div>
                <label className={cn('text-xs font-medium mb-1 block', is('dark') ? 'text-gray-400' : 'text-gray-500')}>Dependants</label>
                <input
                  type="number"
                  min={0}
                  value={dependants}
                  onChange={(e) => setDependants(Number(e.target.value))}
                  className={cn('w-full px-3 py-2 rounded-xl border text-sm focus:ring-2 focus:ring-indigo-500 outline-none',
                    is('dark') ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                  )}
                />
              </div>
            </div>
          </div>

          {/* Expenses */}
          <div className={cn('rounded-2xl border p-6', is('dark') ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200')}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 font-semibold">
                <CreditCard className="h-5 w-5 text-blue-500" /> Expenses
              </h3>
              <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium',
                is('dark') ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
              )}>
                Total: ${totalExpenses.toLocaleString()}
              </span>
            </div>

            {/* Input mode toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setInputMode('manual')}
                className={cn('flex-1 py-2 rounded-xl text-sm font-medium transition-all',
                  inputMode === 'manual'
                    ? 'bg-indigo-500 text-white shadow-md'
                    : is('dark') ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                ✍️ Manual Entry
              </button>
              <button
                onClick={() => setInputMode('csv')}
                className={cn('flex-1 py-2 rounded-xl text-sm font-medium transition-all',
                  inputMode === 'csv'
                    ? 'bg-indigo-500 text-white shadow-md'
                    : is('dark') ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                <Upload className="h-4 w-4 inline mr-1" /> CSV Upload
              </button>
            </div>

            {inputMode === 'manual' ? (
              <div className="grid grid-cols-2 gap-3">
                {EXPENSE_CATEGORIES.map((cat) => (
                  <div key={cat.key}>
                    <label className={cn('text-xs mb-1 block', is('dark') ? 'text-gray-400' : 'text-gray-500')}>
                      {cat.icon} {cat.label}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={expenses[cat.key] || ''}
                      placeholder="0"
                      onChange={(e) => setExpenses({ ...expenses, [cat.key]: Number(e.target.value) })}
                      className={cn('w-full px-3 py-1.5 rounded-lg border text-sm focus:ring-2 focus:ring-indigo-500 outline-none',
                        is('dark') ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                      )}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div
                  onClick={() => fileRef.current?.click()}
                  className={cn('border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors',
                    is('dark') ? 'border-gray-600 hover:border-indigo-500' : 'border-gray-300 hover:border-indigo-400'
                  )}
                >
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-medium">Click to upload CSV or Excel</p>
                  <p className={cn('text-xs mt-1', is('dark') ? 'text-gray-500' : 'text-gray-400')}>
                    Requires Category and Amount columns (Date is optional)
                  </p>
                  {csvFileName && (
                    <p className="text-xs text-indigo-400 mt-2 flex items-center justify-center gap-1">
                      <FileText className="h-3 w-3" /> {csvFileName}
                    </p>
                  )}
                </div>
                <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileUpload} />
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadTemplate('csv')}
                    className={cn('flex-1 py-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors',
                      is('dark') ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-300 text-gray-500 hover:bg-gray-100'
                    )}
                  >
                    <Download className="h-3.5 w-3.5" /> CSV Template
                  </button>
                  <button
                    onClick={() => downloadTemplate('xlsx')}
                    className={cn('flex-1 py-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors',
                      is('dark') ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-300 text-gray-500 hover:bg-gray-100'
                    )}
                  >
                    <Download className="h-3.5 w-3.5" /> Excel Template
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Debts */}
          <div className={cn('rounded-2xl border p-6', is('dark') ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200')}>
            <button
              onClick={() => setShowDebts(!showDebts)}
              className="flex items-center justify-between w-full"
            >
              <h3 className="flex items-center gap-2 font-semibold">
                <TrendingDown className="h-5 w-5 text-red-500" /> Debts ({debts.length})
              </h3>
              {showDebts ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showDebts && (
              <div className="mt-4 space-y-3">
                {debts.map((debt, i) => (
                  <div key={i} className={cn('rounded-xl border p-4 space-y-2', is('dark') ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200')}>
                    <div className="flex items-center justify-between">
                      <input
                        value={debt.name}
                        onChange={(e) => updateDebt(i, 'name', e.target.value)}
                        className={cn('text-sm font-medium bg-transparent border-none outline-none flex-1',
                          is('dark') ? 'text-white' : 'text-gray-900'
                        )}
                      />
                      <button onClick={() => removeDebt(i)} className="p-1 text-red-400 hover:text-red-300 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className={cn('text-[10px] block', is('dark') ? 'text-gray-500' : 'text-gray-400')}>Amount</label>
                        <input
                          type="number"
                          value={debt.amount}
                          onChange={(e) => updateDebt(i, 'amount', Number(e.target.value))}
                          className={cn('w-full px-2 py-1 rounded-lg border text-xs',
                            is('dark') ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                          )}
                        />
                      </div>
                      <div>
                        <label className={cn('text-[10px] block', is('dark') ? 'text-gray-500' : 'text-gray-400')}>Rate %</label>
                        <input
                          type="number"
                          step={0.1}
                          value={debt.interest_rate}
                          onChange={(e) => updateDebt(i, 'interest_rate', Number(e.target.value))}
                          className={cn('w-full px-2 py-1 rounded-lg border text-xs',
                            is('dark') ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                          )}
                        />
                      </div>
                      <div>
                        <label className={cn('text-[10px] block', is('dark') ? 'text-gray-500' : 'text-gray-400')}>Min Pay</label>
                        <input
                          type="number"
                          value={debt.min_payment}
                          onChange={(e) => updateDebt(i, 'min_payment', Number(e.target.value))}
                          className={cn('w-full px-2 py-1 rounded-lg border text-xs',
                            is('dark') ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                          )}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addDebt}
                  className={cn('w-full py-2.5 rounded-xl border-2 border-dashed text-sm font-medium flex items-center justify-center gap-1.5 transition-colors',
                    is('dark') ? 'border-gray-600 text-gray-400 hover:border-indigo-500 hover:text-indigo-400' : 'border-gray-300 text-gray-500 hover:border-indigo-400 hover:text-indigo-500'
                  )}
                >
                  <Plus className="h-4 w-4" /> Add Debt
                </button>
              </div>
            )}
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={loading || monthlyIncome <= 0}
            className={cn(
              'w-full py-3.5 rounded-2xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all duration-300',
              loading
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:shadow-xl hover:shadow-indigo-500/25 hover:-translate-y-0.5'
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                AI Agents Analyzing Your Finances…
              </>
            ) : (
              <>
                <Brain className="h-5 w-5" />
                Analyze My Finances
              </>
            )}
          </button>

          {error && (
            <div className="flex items-start gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              {error}
            </div>
          )}
        </div>

        {/* ====================== RESULTS PANEL ====================== */}
        <div className="xl:col-span-3">
          {!results && !loading && (
            <div className={cn(
              'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed min-h-[500px] text-center p-8',
              is('dark') ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-400'
            )}>
              <Brain className="h-16 w-16 mb-4 opacity-30" />
              <h3 className="text-lg font-semibold mb-2">No Analysis Yet</h3>
              <p className="text-sm max-w-sm">
                Enter your financial information on the left and click "Analyze" to get AI-powered budget, savings, and debt recommendations.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center rounded-2xl border min-h-[500px] bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-indigo-200 dark:border-indigo-800 text-center p-8">
              <div className="relative mb-6">
                <Loader2 className="h-16 w-16 text-indigo-500 animate-spin" />
                <Brain className="h-8 w-8 text-indigo-400 absolute top-4 left-4" />
              </div>
              <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Running 3 AI Agents…</h3>
              <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                <p>🔍 Budget Analysis Agent</p>
                <p>💰 Savings Strategy Agent</p>
                <p>💳 Debt Reduction Agent</p>
              </div>
            </div>
          )}

          {results && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Monthly Income', value: `$${results.budget_analysis.monthly_income.toLocaleString()}`, color: 'emerald' },
                  { label: 'Total Expenses', value: `$${results.budget_analysis.total_expenses.toLocaleString()}`, color: 'red' },
                  { label: 'Surplus / Deficit', value: `$${(results.budget_analysis.monthly_income - results.budget_analysis.total_expenses).toLocaleString()}`, color: results.budget_analysis.monthly_income >= results.budget_analysis.total_expenses ? 'emerald' : 'red' },
                  { label: 'Total Debt', value: `$${results.debt_reduction.total_debt.toLocaleString()}`, color: 'orange' },
                ].map((stat) => (
                  <div key={stat.label} className={cn('rounded-xl border p-3 text-center', is('dark') ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200')}>
                    <p className={cn('text-[11px] font-medium', is('dark') ? 'text-gray-400' : 'text-gray-500')}>{stat.label}</p>
                    <p className={cn('text-lg font-bold', stat.color === 'emerald' ? 'text-emerald-500' : stat.color === 'red' ? 'text-red-500' : 'text-orange-500')}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div className={cn('flex rounded-xl p-1 gap-1', is('dark') ? 'bg-gray-800' : 'bg-gray-100')}>
                {[
                  { key: 'budget' as const, label: '💰 Budget Analysis', icon: DollarSign },
                  { key: 'savings' as const, label: '📈 Savings Strategy', icon: PiggyBank },
                  { key: 'debt' as const, label: '📉 Debt Reduction', icon: TrendingDown },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all',
                      activeTab === tab.key
                        ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400'
                        : is('dark') ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* ---- Budget Analysis Tab ---- */}
              {activeTab === 'budget' && (
                <div className="space-y-6">
                  {/* Charts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={cn('rounded-2xl border p-5', is('dark') ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200')}>
                      <h4 className="font-semibold text-sm mb-4">Spending Breakdown</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                            {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                          </Pie>
                          <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className={cn('rounded-2xl border p-5', is('dark') ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200')}>
                      <h4 className="font-semibold text-sm mb-4">Income vs Expenses</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={incomeVsExpense}>
                          <CartesianGrid strokeDasharray="3 3" stroke={is('dark') ? '#374151' : '#e5e7eb'} />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                            <Cell fill="#10b981" />
                            <Cell fill="#ef4444" />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Category table */}
                  {results.budget_analysis.spending_categories.length > 0 && (
                    <div className={cn('rounded-2xl border p-5', is('dark') ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200')}>
                      <h4 className="font-semibold text-sm mb-3">Category Breakdown</h4>
                      <div className="space-y-2">
                        {results.budget_analysis.spending_categories.map((cat) => (
                          <div key={cat.category} className="flex items-center gap-3">
                            <span className="text-sm w-28 shrink-0">{cat.category}</span>
                            <div className={cn('flex-1 h-2.5 rounded-full overflow-hidden', is('dark') ? 'bg-gray-700' : 'bg-gray-100')}>
                              <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" style={{ width: `${Math.min(cat.percentage, 100)}%` }} />
                            </div>
                            <span className="text-xs font-medium w-16 text-right">${cat.amount.toLocaleString()}</span>
                            <span className={cn('text-xs w-12 text-right', is('dark') ? 'text-gray-400' : 'text-gray-500')}>{cat.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {results.budget_analysis.recommendations.length > 0 && (
                    <div className={cn('rounded-2xl border p-5', is('dark') ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200')}>
                      <h4 className="font-semibold text-sm mb-3">💡 Recommendations</h4>
                      <div className="space-y-3">
                        {results.budget_analysis.recommendations.map((rec, i) => (
                          <div key={i} className={cn('rounded-xl p-4 border', is('dark') ? 'bg-gray-700/50 border-gray-600' : 'bg-indigo-50 border-indigo-100')}>
                            <div className="flex items-start justify-between">
                              <div>
                                <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', is('dark') ? 'bg-gray-600 text-gray-300' : 'bg-indigo-100 text-indigo-700')}>{rec.category}</span>
                                <p className="text-sm mt-2">{rec.recommendation}</p>
                              </div>
                              {rec.potential_savings > 0 && (
                                <span className="text-sm font-bold text-emerald-500 whitespace-nowrap ml-3">
                                  +${rec.potential_savings.toLocaleString()}/mo
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ---- Savings Strategy Tab ---- */}
              {activeTab === 'savings' && (
                <div className="space-y-6">
                  {/* Emergency Fund */}
                  {results.savings_strategy.emergency_fund && (
                    <div className={cn('rounded-2xl border p-5', is('dark') ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200')}>
                      <h4 className="font-semibold text-sm mb-3">🏦 Emergency Fund</h4>
                      <div className="flex items-end gap-4 mb-3">
                        <div>
                          <p className={cn('text-xs', is('dark') ? 'text-gray-400' : 'text-gray-500')}>Recommended</p>
                          <p className="text-2xl font-bold text-emerald-500">${results.savings_strategy.emergency_fund.recommended_amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className={cn('text-xs', is('dark') ? 'text-gray-400' : 'text-gray-500')}>Current</p>
                          <p className="text-lg font-semibold">${results.savings_strategy.emergency_fund.current_amount.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className={cn('w-full h-3 rounded-full overflow-hidden', is('dark') ? 'bg-gray-700' : 'bg-gray-100')}>
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all"
                          style={{ width: `${Math.min((results.savings_strategy.emergency_fund.current_amount / results.savings_strategy.emergency_fund.recommended_amount) * 100, 100)}%` }}
                        />
                      </div>
                      <p className={cn('text-xs mt-2', is('dark') ? 'text-gray-400' : 'text-gray-500')}>
                        {results.savings_strategy.emergency_fund.current_status}
                      </p>
                    </div>
                  )}

                  {/* Savings Allocations */}
                  {results.savings_strategy.recommendations.length > 0 && (
                    <div className={cn('rounded-2xl border p-5', is('dark') ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200')}>
                      <h4 className="font-semibold text-sm mb-3">📊 Recommended Savings Allocations</h4>
                      <div className="space-y-3">
                        {results.savings_strategy.recommendations.map((rec, i) => (
                          <div key={i} className={cn('flex items-center justify-between rounded-xl p-4 border', is('dark') ? 'bg-gray-700/50 border-gray-600' : 'bg-emerald-50 border-emerald-100')}>
                            <div>
                              <p className="font-medium text-sm">{rec.category}</p>
                              <p className={cn('text-xs mt-0.5', is('dark') ? 'text-gray-400' : 'text-gray-500')}>{rec.rationale}</p>
                            </div>
                            <span className="text-lg font-bold text-emerald-500">${rec.amount.toLocaleString()}<span className="text-xs font-normal">/mo</span></span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Automation */}
                  {results.savings_strategy.automation_techniques && results.savings_strategy.automation_techniques.length > 0 && (
                    <div className={cn('rounded-2xl border p-5', is('dark') ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200')}>
                      <h4 className="font-semibold text-sm mb-3">⚡ Automation Techniques</h4>
                      <div className="space-y-2">
                        {results.savings_strategy.automation_techniques.map((tech, i) => (
                          <div key={i} className={cn('rounded-xl p-3 border', is('dark') ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200')}>
                            <p className="text-sm font-medium">{tech.name}</p>
                            <p className={cn('text-xs mt-0.5', is('dark') ? 'text-gray-400' : 'text-gray-500')}>{tech.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ---- Debt Reduction Tab ---- */}
              {activeTab === 'debt' && (
                <div className="space-y-6">
                  {/* Payoff Plan Comparison */}
                  {results.debt_reduction.payoff_plans && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(['avalanche', 'snowball'] as const).map((method) => {
                        const plan = results.debt_reduction.payoff_plans[method];
                        return (
                          <div key={method} className={cn('rounded-2xl border p-5', is('dark') ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200')}>
                            <div className="flex items-center gap-2 mb-4">
                              <div className={cn('rounded-lg p-1.5', method === 'avalanche' ? 'bg-red-500/10' : 'bg-blue-500/10')}>
                                <TrendingDown className={cn('h-4 w-4', method === 'avalanche' ? 'text-red-500' : 'text-blue-500')} />
                              </div>
                              <h4 className="font-semibold text-sm capitalize">{method} Method</h4>
                            </div>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className={cn('text-xs', is('dark') ? 'text-gray-400' : 'text-gray-500')}>Total Interest</span>
                                <span className="text-sm font-bold text-red-500">${plan.total_interest.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className={cn('text-xs', is('dark') ? 'text-gray-400' : 'text-gray-500')}>Months to Payoff</span>
                                <span className="text-sm font-bold">{plan.months_to_payoff}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className={cn('text-xs', is('dark') ? 'text-gray-400' : 'text-gray-500')}>Monthly Payment</span>
                                <span className="text-sm font-bold">${plan.monthly_payment.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Debt List */}
                  {results.debt_reduction.debts && results.debt_reduction.debts.length > 0 && (
                    <div className={cn('rounded-2xl border p-5', is('dark') ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200')}>
                      <h4 className="font-semibold text-sm mb-3">📋 Debt Breakdown</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={results.debt_reduction.debts}>
                          <CartesianGrid strokeDasharray="3 3" stroke={is('dark') ? '#374151' : '#e5e7eb'} />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                          <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Recommendations */}
                  {results.debt_reduction.recommendations && results.debt_reduction.recommendations.length > 0 && (
                    <div className={cn('rounded-2xl border p-5', is('dark') ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200')}>
                      <h4 className="font-semibold text-sm mb-3">💡 Debt Reduction Tips</h4>
                      <div className="space-y-3">
                        {results.debt_reduction.recommendations.map((rec, i) => (
                          <div key={i} className={cn('rounded-xl p-4 border', is('dark') ? 'bg-gray-700/50 border-gray-600' : 'bg-orange-50 border-orange-100')}>
                            <p className="font-medium text-sm">{rec.title}</p>
                            <p className="text-sm mt-1">{rec.description}</p>
                            {rec.impact && (
                              <p className={cn('text-xs mt-2 font-medium', is('dark') ? 'text-emerald-400' : 'text-emerald-600')}>
                                Impact: {rec.impact}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
