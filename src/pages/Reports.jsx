import React, { useState, useMemo, useCallback } from 'react';
import { FileText, Download, Calendar } from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { useStore } from '../context/StoreContext';

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

function monthlyReport(transactions, year, month) {
    const txns = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === year && d.getMonth() === month && t.status !== 'failed';
    });

    const income = txns.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
    const expense = txns.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
    const savings = income - expense;

    // Category breakdown
    const cats = {};
    txns.filter(t => t.type === 'expense').forEach(t => {
        cats[t.category] = (cats[t.category] || 0) + t.amount;
    });
    const topCats = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return { income, expense, savings, count: txns.length, topCats };
}

function yearlyReport(transactions, year) {
    const rows = Array.from({ length: 12 }, (_, i) => {
        const txns = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getFullYear() === year && d.getMonth() === i && t.status !== 'failed';
        });
        const income = txns.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
        const expense = txns.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
        return { month: format(new Date(year, i, 1), 'MMMM'), income, expense, savings: income - expense };
    });
    const totals = rows.reduce((acc, r) => ({
        income: acc.income + r.income,
        expense: acc.expense + r.expense,
        savings: acc.savings + r.savings,
    }), { income: 0, expense: 0, savings: 0 });
    return { rows, totals };
}

function downloadCSV(data, filename) {
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
}

export default function Reports() {
    const { data } = useStore();
    const transactions = data?.transactions || [];

    const now = new Date(2026, 2, 3);
    const [rptMonth, setRptMonth] = useState(now.getMonth());
    const [rptYear, setRptYear] = useState(now.getFullYear());
    const [yrYear, setYrYear] = useState(now.getFullYear());

    const monthly = useMemo(() => monthlyReport(transactions, rptYear, rptMonth), [transactions, rptYear, rptMonth]);
    const yearly = useMemo(() => yearlyReport(transactions, yrYear), [transactions, yrYear]);

    const exportMonthlyCSV = useCallback(() => {
        const header = 'ID,Date,Name,Category,Type,Status,Amount\n';
        const rows = transactions
            .filter(t => { const d = new Date(t.date); return d.getFullYear() === rptYear && d.getMonth() === rptMonth; })
            .map(t => `${t.id},"${format(new Date(t.date), 'yyyy-MM-dd')}","${t.recipientName}","${t.category}","${t.type}","${t.status}",${t.amount}`)
            .join('\n');
        downloadCSV(header + rows, `report-${rptYear}-${String(rptMonth + 1).padStart(2, '0')}.csv`);
    }, [transactions, rptYear, rptMonth]);

    const exportYearlyCSV = useCallback(() => {
        const header = 'Month,Income,Expense,Savings\n';
        const rows = yearly.rows.map(r => `${r.month},${r.income},${r.expense},${r.savings}`).join('\n');
        const footer = `\nTotal,${yearly.totals.income},${yearly.totals.expense},${yearly.totals.savings}`;
        downloadCSV(header + rows + footer, `annual-report-${yrYear}.csv`);
    }, [yearly, yrYear]);

    const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const YEARS = [2024, 2025, 2026];

    return (
        <>
            <div className="page-header">
                <div className="page-title">Reports</div>
                <div className="page-desc">Generate monthly and yearly financial summaries</div>
            </div>

            <div className="report-grid">
                {/* Monthly Report */}
                <div className="card">
                    <div className="card-header">
                        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FileText size={16} style={{ color: 'var(--primary)' }} /> Monthly Report</div>
                        <button id="export-monthly-csv" className="btn btn-outline btn-sm" onClick={exportMonthlyCSV}>
                            <Download size={13} /> Export CSV
                        </button>
                    </div>
                    <div className="card-body">
                        {/* Selectors */}
                        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                            <select id="monthly-month-select" className="form-select" value={rptMonth} onChange={e => setRptMonth(Number(e.target.value))}>
                                {MONTH_NAMES.map((m, i) => <option key={i} value={i}>{m}</option>)}
                            </select>
                            <select id="monthly-year-select" className="form-select" value={rptYear} onChange={e => setRptYear(Number(e.target.value))}>
                                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>

                        {/* Stats grid */}
                        <div className="report-stats-grid">
                            <div className="report-stat">
                                <div className="report-stat-label">Income</div>
                                <div className="report-stat-value" style={{ color: '#16a34a' }}>{fmt(monthly.income)}</div>
                            </div>
                            <div className="report-stat">
                                <div className="report-stat-label">Expenses</div>
                                <div className="report-stat-value" style={{ color: 'var(--danger)' }}>{fmt(monthly.expense)}</div>
                            </div>
                            <div className="report-stat">
                                <div className="report-stat-label">Net Savings</div>
                                <div className="report-stat-value" style={{ color: monthly.savings >= 0 ? '#16a34a' : 'var(--danger)' }}>{fmt(monthly.savings)}</div>
                            </div>
                            <div className="report-stat">
                                <div className="report-stat-label">Transactions</div>
                                <div className="report-stat-value">{monthly.count}</div>
                            </div>
                        </div>

                        {/* Top categories */}
                        <div style={{ marginTop: 16 }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Top Spending Categories</div>
                            {monthly.topCats.length === 0 ? (
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No expenses recorded</div>
                            ) : monthly.topCats.map(([cat, amt]) => (
                                <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                                    <span style={{ fontSize: '0.875rem' }}>{cat}</span>
                                    <span className="amount-negative">{fmt(amt)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Yearly Report */}
                <div className="card">
                    <div className="card-header">
                        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Calendar size={16} style={{ color: 'var(--primary)' }} /> Yearly Report</div>
                        <button id="export-yearly-csv" className="btn btn-outline btn-sm" onClick={exportYearlyCSV}>
                            <Download size={13} /> Export CSV
                        </button>
                    </div>
                    <div className="card-body">
                        {/* Year selector */}
                        <div style={{ marginBottom: 20 }}>
                            <select id="yearly-year-select" className="form-select" value={yrYear} onChange={e => setYrYear(Number(e.target.value))} style={{ maxWidth: 160 }}>
                                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>

                        {/* Annual totals */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
                            <div className="report-stat">
                                <div className="report-stat-label">Total Income</div>
                                <div className="report-stat-value" style={{ fontSize: '1.1rem', color: '#16a34a' }}>{fmt(yearly.totals.income)}</div>
                            </div>
                            <div className="report-stat">
                                <div className="report-stat-label">Total Expenses</div>
                                <div className="report-stat-value" style={{ fontSize: '1.1rem', color: 'var(--danger)' }}>{fmt(yearly.totals.expense)}</div>
                            </div>
                            <div className="report-stat">
                                <div className="report-stat-label">Net Savings</div>
                                <div className="report-stat-value" style={{ fontSize: '1.1rem', color: yearly.totals.savings >= 0 ? '#16a34a' : 'var(--danger)' }}>{fmt(yearly.totals.savings)}</div>
                            </div>
                        </div>

                        {/* Month-by-month table */}
                        <div className="table-container" style={{ borderRadius: 'var(--radius-md)' }}>
                            <table style={{ fontSize: '0.82rem' }}>
                                <thead>
                                    <tr>
                                        <th>Month</th>
                                        <th style={{ textAlign: 'right' }}>Income</th>
                                        <th style={{ textAlign: 'right' }}>Expense</th>
                                        <th style={{ textAlign: 'right' }}>Savings</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {yearly.rows.map(r => (
                                        <tr key={r.month}>
                                            <td style={{ fontWeight: 500 }}>{r.month}</td>
                                            <td style={{ textAlign: 'right', color: '#16a34a', fontWeight: 600 }}>{r.income > 0 ? fmt(r.income) : '—'}</td>
                                            <td style={{ textAlign: 'right', color: 'var(--danger)', fontWeight: 600 }}>{r.expense > 0 ? fmt(r.expense) : '—'}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 600, color: r.savings >= 0 ? '#16a34a' : 'var(--danger)' }}>
                                                {r.income > 0 || r.expense > 0 ? fmt(r.savings) : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
