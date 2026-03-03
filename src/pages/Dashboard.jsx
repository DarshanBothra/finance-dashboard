import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Wallet, TrendingUp, TrendingDown, PiggyBank, CreditCard,
    ArrowUpRight, ArrowDownRight, Wifi, ChevronRight
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { useStore } from '../context/StoreContext';
import { calcMetrics, getIncomeChartData, BUDGET_COLORS } from '../data/store';
import { format, subDays, startOfWeek, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const fmtShort = (n) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`;

function MetricCard({ type, label, value, change, icon: Icon }) {
    const positive = parseFloat(change) >= 0;
    return (
        <div className={`metric-card ${type}`} id={`metric-${type}`}>
            <div className="metric-card-top">
                <div className={`metric-icon ${type}`}><Icon size={18} /></div>
                <div>
                    <span className={`metric-change ${positive ? 'positive' : 'negative'}`}>
                        {positive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                        {Math.abs(change)}%
                    </span>
                </div>
            </div>
            <div>
                <div className="metric-label">{label}</div>
                <div className="metric-value">{fmt(value)}</div>
                <div className="metric-compare">vs last month</div>
            </div>
        </div>
    );
}

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

function IncomeChart({ transactions }) {
    const [period, setPeriod] = useState('last_6');
    const data = useMemo(() => getIncomeChartData(transactions, period), [transactions, period]);

    return (
        <div className="card" id="income-chart-card">
            <div className="card-header">
                <div className="card-title">Total Income</div>
                <select
                    id="income-period-select"
                    className="period-select"
                    value={period}
                    onChange={e => setPeriod(e.target.value)}
                >
                    <option value="this_month">This Month</option>
                    <option value="last_3">Last 3 Months</option>
                    <option value="last_6">Last 6 Months</option>
                    <option value="this_year">This Year</option>
                </select>
            </div>
            <div className="card-body" style={{ paddingTop: 12 }}>
                <div className="legend">
                    <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--primary)' }} />Fixed Income</div>
                    <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--primary-light)' }} />Variable Income</div>
                </div>
                <ResponsiveContainer width="100%" height={230}>
                    <BarChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }} barGap={3}>
                        <CartesianGrid vertical={false} stroke="var(--border)" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={fmtShort} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="fixed" name="Fixed Income" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="variable" name="Variable Income" fill="var(--primary-light)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function BudgetChart({ budgets }) {
    const [period, setPeriod] = useState('this_month');

    const data = useMemo(() => budgets.map(b => ({
        name: b.category,
        value: b.spentAmount,
        allocated: b.allocatedAmount,
        over: b.spentAmount > b.allocatedAmount,
    })), [budgets]);

    const totalBudget = budgets.reduce((a, b) => a + b.allocatedAmount, 0);
    const totalSpent = budgets.reduce((a, b) => a + b.spentAmount, 0);

    const REMAP_COLORS = data.map(d =>
        d.over ? '#ef4444' : BUDGET_COLORS[d.name] || '#2E3A8C'
    );

    return (
        <div className="card" id="budget-chart-card">
            <div className="card-header">
                <div className="card-title">Budget Allocation</div>
                <select
                    id="budget-period-select"
                    className="period-select"
                    value={period}
                    onChange={e => setPeriod(e.target.value)}
                >
                    <option value="this_month">This Month</option>
                    <option value="last_month">Last Month</option>
                    <option value="this_year">This Year</option>
                </select>
            </div>
            <div className="card-body" style={{ paddingTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="donut-wrapper">
                    <ResponsiveContainer width={220} height={220}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={65}
                                outerRadius={95}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {data.map((entry, i) => (
                                    <Cell key={i} fill={REMAP_COLORS[i]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(v, n) => [fmt(v), n]}
                                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="donut-center" style={{ pointerEvents: 'none' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Spent</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{fmt(totalSpent)}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>of {fmt(totalBudget)}</div>
                    </div>
                </div>
                <div className="legend" style={{ justifyContent: 'center', marginTop: 4 }}>
                    {data.map((d, i) => (
                        <div key={d.name} className="legend-item">
                            <div className="legend-dot" style={{ background: REMAP_COLORS[i] }} />
                            <span style={{ color: d.over ? 'var(--danger)' : undefined, fontWeight: d.over ? 600 : undefined }}>
                                {d.name}{d.over ? ' ⚠' : ''}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function RecentTransactions({ transactions }) {
    const [filter, setFilter] = useState('week');
    const now = new Date(2026, 2, 3);

    const filtered = useMemo(() => {
        const txns = transactions.filter(t => t.status !== 'failed');
        if (filter === 'week') {
            const weekAgo = subDays(now, 7);
            return txns.filter(t => new Date(t.date) >= weekAgo).slice(0, 8);
        }
        if (filter === 'month') {
            return txns.filter(t => {
                const d = new Date(t.date);
                return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
            }).slice(0, 8);
        }
        return txns.slice(0, 8);
    }, [transactions, filter]);

    return (
        <div className="card" id="recent-transactions-card">
            <div className="card-header">
                <div className="card-title">Recent Transactions</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <select
                        id="recent-tx-filter"
                        className="period-select"
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                    >
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="all">All</option>
                    </select>
                    <Link to="/transactions" className="link" id="see-all-transactions-link">See all →</Link>
                </div>
            </div>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Transaction ID</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th style={{ textAlign: 'right' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>No transactions found</td></tr>
                        ) : filtered.map(t => (
                            <tr key={t.id}>
                                <td>
                                    <div className="tx-name-cell">
                                        <div className="tx-avatar">{getInitials(t.recipientName)}</div>
                                        <div>
                                            <div className="tx-name">{t.recipientName}</div>
                                            <div className="tx-sub">{t.category}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                    #{t.id.substring(0, 8)}
                                </td>
                                <td>
                                    <span className={`badge badge-${t.status}`}>{t.status}</span>
                                </td>
                                <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                    {format(new Date(t.date), 'MMM d, yyyy')}
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <span className={t.type === 'income' ? 'amount-positive' : 'amount-negative'}>
                                        {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function SpendingLimitWidget({ user, transactions }) {
    const now = new Date(2026, 2, 3);
    const monthExpenses = transactions.filter(t => {
        const d = new Date(t.date);
        return t.type === 'expense' && t.status !== 'failed' &&
            d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).reduce((a, t) => a + t.amount, 0);

    const limit = user?.monthlySpendingLimit || 4500;
    const pct = Math.min((monthExpenses / limit) * 100, 100);
    const over = monthExpenses > limit;

    return (
        <div className="card" id="spending-limit-widget">
            <div className="card-header">
                <div className="card-title">Monthly Spending Limit</div>
            </div>
            <div className="spending-widget">
                <div className="spending-amounts">
                    <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2 }}>Spent this month</div>
                        <div className="spending-spent" style={{ color: over ? 'var(--danger)' : undefined }}>{fmt(monthExpenses)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2 }}>Limit</div>
                        <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{fmt(limit)}</div>
                    </div>
                </div>
                <div className="progress-track">
                    <div
                        className={`progress-fill ${over ? 'danger' : pct > 80 ? 'warning' : ''}`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
                <div className="spending-pct">
                    {over
                        ? <span style={{ color: 'var(--danger)', fontWeight: 600 }}>⚠ Over limit by {fmt(monthExpenses - limit)}</span>
                        : <span>{fmt(limit - monthExpenses)} remaining ({(100 - pct).toFixed(0)}%)</span>
                    }
                </div>
            </div>
        </div>
    );
}

function MyCardsWidget({ cards }) {
    return (
        <div className="card" id="my-cards-widget">
            <div className="card-header">
                <div className="card-title">My Cards</div>
                <Link to="/wallet" className="link">Manage →</Link>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {cards.slice(0, 2).map(card => (
                    <div key={card.id} className={`payment-card card-${card.cardType}`}>
                        <div className="payment-card-top">
                            <div>
                                <div className="payment-card-label">Balance</div>
                                <div className="payment-card-value">••••</div>
                            </div>
                            <div className="payment-card-network">
                                {card.cardType === 'visa' ? 'VISA' : card.cardType === 'mastercard' ? 'MC' : card.cardType === 'amex' ? 'AMEX' : card.cardType.toUpperCase()}
                            </div>
                        </div>
                        <div className="payment-card-number">•••• •••• •••• {card.lastFour}</div>
                        <div className="payment-card-bottom">
                            <div>
                                <div className="payment-card-label">Card Holder</div>
                                <div className="payment-card-value">{card.cardholderName}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div className="payment-card-label">Expires</div>
                                <div className="payment-card-value">{card.expiryDate}</div>
                            </div>
                        </div>
                    </div>
                ))}
                {cards.length === 0 && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center', padding: '16px 0' }}>
                        No cards added yet
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Dashboard() {
    const { data } = useStore();
    const { transactions = [], cards = [], budgets = [], user } = data || {};

    const metrics = useMemo(() => calcMetrics(transactions), [transactions]);

    return (
        <>
            {/* Key Metrics */}
            <div className="metric-cards-grid">
                <MetricCard type="balance" label="Total Balance" value={metrics.totalBalance} change={metrics.balanceChange} icon={Wallet} />
                <MetricCard type="income" label="Income" value={metrics.income} change={metrics.incomeChange} icon={TrendingUp} />
                <MetricCard type="expense" label="Expenses" value={metrics.expense} change={metrics.expenseChange} icon={TrendingDown} />
                <MetricCard type="savings" label="Total Savings" value={metrics.savings} change={metrics.savingsChange} icon={PiggyBank} />
            </div>

            {/* Charts */}
            <div className="charts-grid">
                <IncomeChart transactions={transactions} />
                <BudgetChart budgets={budgets} />
            </div>

            {/* Bottom section */}
            <div className="dashboard-bottom">
                <RecentTransactions transactions={transactions} />
                <div className="dashboard-right-col">
                    <SpendingLimitWidget user={user} transactions={transactions} />
                    <MyCardsWidget cards={cards} />
                </div>
            </div>
        </>
    );
}
