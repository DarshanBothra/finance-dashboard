import React, { useState, useMemo } from 'react';
import { subMonths, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachMonthOfInterval, eachWeekOfInterval } from 'date-fns';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend, Cell
} from 'recharts';
import { useStore } from '../context/StoreContext';
import { BUDGET_COLORS } from '../data/store';

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const fmtShort = (n) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`;

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="tooltip-box">
            <div className="tooltip-label">{label}</div>
            {payload.map(p => (
                <div key={p.name} className="tooltip-row">
                    <span style={{ color: p.color }}>{p.name}</span>
                    <span className="tooltip-val">{fmt(p.value)}</span>
                </div>
            ))}
        </div>
    );
}

function SpendingTrends({ transactions }) {
    const [period, setPeriod] = useState('monthly');
    const now = new Date(2026, 2, 3);

    const data = useMemo(() => {
        if (period === 'monthly') {
            return Array.from({ length: 12 }, (_, i) => {
                const ref = subMonths(now, 11 - i);
                const label = format(ref, 'MMM');
                const monthTxns = transactions.filter(t => {
                    const d = new Date(t.date);
                    return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && t.status !== 'failed';
                });
                const curSpend = monthTxns.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
                const prevRef = subMonths(ref, 1);
                const prevTxns = transactions.filter(t => {
                    const d = new Date(t.date);
                    return d.getFullYear() === prevRef.getFullYear() && d.getMonth() === prevRef.getMonth() && t.status !== 'failed';
                });
                const prevSpend = prevTxns.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
                return { period: label, current: curSpend, previous: prevSpend };
            });
        }
        if (period === 'yearly') {
            return Array.from({ length: 3 }, (_, i) => {
                const year = now.getFullYear() - 2 + i;
                const yearTxns = transactions.filter(t => new Date(t.date).getFullYear() === year && t.status !== 'failed');
                return {
                    period: year.toString(),
                    current: yearTxns.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0),
                    previous: 0,
                };
            });
        }
        // weekly — last 12 weeks
        return Array.from({ length: 12 }, (_, i) => {
            const weekStart = startOfWeek(subMonths(now, 0));
            // approximate - just use last 12 chunks of 7 days
            const start = new Date(now.getTime() - (11 - i) * 7 * 86400000);
            const end = new Date(now.getTime() - (10 - i) * 7 * 86400000);
            const wkTxns = transactions.filter(t => {
                const d = new Date(t.date);
                return d >= start && d < end && t.status !== 'failed';
            });
            return {
                period: `W${i + 1}`,
                current: wkTxns.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0),
                previous: 0,
            };
        });
    }, [transactions, period]);

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title">Spending Trends</div>
                <div className="tab-group">
                    {['weekly', 'monthly', 'yearly'].map(p => (
                        <button key={p} className={`tab-btn${period === p ? ' active' : ''}`} onClick={() => setPeriod(p)}>
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
            <div className="card-body" style={{ paddingTop: 12 }}>
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid vertical={false} stroke="var(--border)" />
                        <XAxis dataKey="period" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={fmtShort} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="current" name="Current" stroke="var(--primary)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                        <Line type="monotone" dataKey="previous" name="Previous" stroke="var(--primary-light)" strokeWidth={2} strokeDasharray="4 3" dot={false} />
                    </LineChart>
                </ResponsiveContainer>
                <div className="legend">
                    <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--primary)' }} />Current Period</div>
                    <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--primary-light)', opacity: 0.6 }} />Previous Period</div>
                </div>
            </div>
        </div>
    );
}

function CategoryBreakdown({ transactions }) {
    const now = new Date(2026, 2, 3);
    const data = useMemo(() => {
        const expenses = transactions.filter(t => {
            const d = new Date(t.date);
            return t.type === 'expense' && t.status !== 'failed' &&
                d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
        });
        const cats = {};
        expenses.forEach(t => { cats[t.category] = (cats[t.category] || 0) + t.amount; });
        const total = Object.values(cats).reduce((a, v) => a + v, 0);
        return Object.entries(cats)
            .map(([name, amount]) => ({ name, amount, pct: total > 0 ? ((amount / total) * 100).toFixed(1) : 0 }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 8);
    }, [transactions]);

    const COLORS = ['#2E3A8C', '#4A5FD9', '#22c55e', '#f59e0b', '#ef4444', '#6366f1', '#ec4899', '#14b8a6'];

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title">Category Breakdown</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>This month</span>
            </div>
            <div className="card-body" style={{ paddingTop: 12 }}>
                <ResponsiveContainer width="100%" height={230}>
                    <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, left: 80, bottom: 0 }}>
                        <XAxis type="number" tickFormatter={fmtShort} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} width={78} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="amount" name="Spent" radius={[0, 4, 4, 0]}>
                            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function IncomeVsExpense({ transactions }) {
    const now = new Date(2026, 2, 3);
    const data = useMemo(() => {
        return Array.from({ length: 6 }, (_, i) => {
            const ref = subMonths(now, 5 - i);
            const label = format(ref, 'MMM');
            const m = transactions.filter(t => {
                const d = new Date(t.date);
                return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && t.status !== 'failed';
            });
            const income = m.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
            const expense = m.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
            return { month: label, income, expense, savings: Math.max(0, income - expense) };
        });
    }, [transactions]);

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title">Income vs Expenses</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last 6 months</span>
            </div>
            <div className="card-body" style={{ paddingTop: 12 }}>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={3}>
                        <CartesianGrid vertical={false} stroke="var(--border)" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={fmtShort} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="savings" name="Savings" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
                <div className="legend">
                    <div className="legend-item"><div className="legend-dot" style={{ background: '#22c55e' }} />Income</div>
                    <div className="legend-item"><div className="legend-dot" style={{ background: '#ef4444' }} />Expense</div>
                    <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--primary)' }} />Savings</div>
                </div>
            </div>
        </div>
    );
}

function TopExpenses({ transactions }) {
    const [period, setPeriod] = useState('month');
    const now = new Date(2026, 2, 3);

    const top = useMemo(() => {
        let txns = transactions.filter(t => t.type === 'expense' && t.status !== 'failed');
        if (period === 'month') {
            txns = txns.filter(t => {
                const d = new Date(t.date);
                return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
            });
        } else if (period === 'week') {
            const ago = new Date(now.getTime() - 7 * 86400000);
            txns = txns.filter(t => new Date(t.date) >= ago);
        }
        return txns.sort((a, b) => b.amount - a.amount).slice(0, 8);
    }, [transactions, period]);

    const fmt2 = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title">Top Expenses</div>
                <div className="tab-group">
                    <button className={`tab-btn${period === 'week' ? ' active' : ''}`} onClick={() => setPeriod('week')}>Week</button>
                    <button className={`tab-btn${period === 'month' ? ' active' : ''}`} onClick={() => setPeriod('month')}>Month</button>
                    <button className={`tab-btn${period === 'all' ? ' active' : ''}`} onClick={() => setPeriod('all')}>All</button>
                </div>
            </div>
            <div className="card-body" style={{ paddingTop: 8 }}>
                {top.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '24px 0' }}>No expenses in this period</div>
                ) : top.map((t, i) => (
                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: i < top.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', width: 18, textAlign: 'right' }}>#{i + 1}</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{t.recipientName}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.category} · {format(new Date(t.date), 'MMM d')}</div>
                        </div>
                        <span className="amount-negative">{fmt2(t.amount)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Analytics() {
    const { data } = useStore();
    const transactions = data?.transactions || [];

    return (
        <>
            <div className="page-header">
                <div className="page-title">Analytics</div>
                <div className="page-desc">Visualize your spending patterns and trends</div>
            </div>

            <div className="analytics-grid-2">
                <SpendingTrends transactions={transactions} />
                <CategoryBreakdown transactions={transactions} />
            </div>

            <div className="analytics-grid-main">
                <IncomeVsExpense transactions={transactions} />
                <TopExpenses transactions={transactions} />
            </div>
        </>
    );
}
