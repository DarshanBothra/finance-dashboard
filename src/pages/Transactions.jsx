import React, { useState, useMemo, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, X, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '../context/StoreContext';
import { addTransaction, editTransaction, deleteTransaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../data/store';
import { v4 as uuidv4 } from 'uuid';

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function TransactionModal({ tx, onClose, onSave }) {
    const isEdit = Boolean(tx?.id);
    const [form, setForm] = useState({
        type: tx?.type || 'expense',
        amount: tx?.amount?.toString() || '',
        category: tx?.category || EXPENSE_CATEGORIES[0],
        recipientName: tx?.recipientName || '',
        date: tx?.date ? format(new Date(tx.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        notes: tx?.notes || '',
        status: tx?.status || 'completed',
    });
    const [errors, setErrors] = useState({});

    const cats = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const validate = () => {
        const errs = {};
        if (!form.amount || isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0) errs.amount = 'Enter a valid amount';
        if (!form.recipientName.trim()) errs.recipientName = 'Name is required';
        if (!form.date) errs.date = 'Date is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;
        onSave({
            ...tx,
            type: form.type,
            amount: parseFloat(form.amount),
            category: form.category,
            recipientName: form.recipientName.trim(),
            date: new Date(form.date).toISOString(),
            notes: form.notes,
            status: form.status,
            isFixed: ['Bills & Utilities', 'Subscriptions', 'Salary'].includes(form.category),
        });
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" id="transaction-modal">
                <div className="modal-header">
                    <div className="modal-title">{isEdit ? 'Edit Transaction' : 'Add Transaction'}</div>
                    <button className="modal-close" onClick={onClose}><X size={14} /></button>
                </div>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* Type */}
                    <div className="form-group">
                        <label className="form-label">Type</label>
                        <div className="tab-group" style={{ width: 'fit-content' }}>
                            <button className={`tab-btn${form.type === 'expense' ? ' active' : ''}`} onClick={() => { set('type', 'expense'); set('category', EXPENSE_CATEGORIES[0]); }}>Expense</button>
                            <button className={`tab-btn${form.type === 'income' ? ' active' : ''}`} onClick={() => { set('type', 'income'); set('category', INCOME_CATEGORIES[0]); }}>Income</button>
                        </div>
                    </div>

                    <div className="form-grid-2">
                        <div className="form-group">
                            <label className="form-label">Amount ($)</label>
                            <input id="tx-amount" className={`form-input${errors.amount ? ' error' : ''}`} type="number" min="0" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" />
                            {errors.amount && <div className="form-error">{errors.amount}</div>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Date</label>
                            <input id="tx-date" className={`form-input${errors.date ? ' error' : ''}`} type="date" value={form.date} onChange={e => set('date', e.target.value)} />
                            {errors.date && <div className="form-error">{errors.date}</div>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Recipient / Source</label>
                        <input id="tx-name" className={`form-input${errors.recipientName ? ' error' : ''}`} type="text" value={form.recipientName} onChange={e => set('recipientName', e.target.value)} placeholder="e.g. Amazon, Employer Corp" />
                        {errors.recipientName && <div className="form-error">{errors.recipientName}</div>}
                    </div>

                    <div className="form-grid-2">
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select id="tx-category" className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                                {cats.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select id="tx-status" className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Notes (optional)</label>
                        <textarea id="tx-notes" className="form-textarea" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Add a note..." style={{ resize: 'vertical' }} />
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                    <button id="tx-save-btn" className="btn btn-primary" onClick={handleSave}>
                        <Check size={14} /> {isEdit ? 'Save Changes' : 'Add Transaction'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ConfirmModal({ message, onConfirm, onCancel }) {
    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
            <div className="modal modal-sm" id="confirm-modal">
                <div className="modal-header">
                    <div className="modal-title">Confirm Delete</div>
                    <button className="modal-close" onClick={onCancel}><X size={14} /></button>
                </div>
                <div className="confirm-body">
                    <div className="confirm-message">{message}</div>
                    <div className="modal-footer" style={{ padding: 0, justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
                        <button id="confirm-delete-btn" className="btn btn-danger" onClick={onConfirm}>Delete</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const PAGE_SIZE = 20;

export default function Transactions() {
    const { data, update } = useStore();
    const transactions = data?.transactions || [];

    const [search, setSearch] = useState('');
    const [typeF, setTypeF] = useState('all');
    const [statusF, setStatusF] = useState('all');
    const [catF, setCatF] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    const [page, setPage] = useState(1);
    const [modal, setModal] = useState(null);  // null | 'add' | {tx} = edit
    const [delId, setDelId] = useState(null);

    const allCats = useMemo(() => {
        const s = new Set(transactions.map(t => t.category));
        return Array.from(s).sort();
    }, [transactions]);

    const filtered = useMemo(() => {
        let arr = [...transactions];
        if (search) {
            const s = search.toLowerCase();
            arr = arr.filter(t => t.recipientName.toLowerCase().includes(s) || t.id.includes(s) || (t.notes || '').toLowerCase().includes(s));
        }
        if (typeF !== 'all') arr = arr.filter(t => t.type === typeF);
        if (statusF !== 'all') arr = arr.filter(t => t.status === statusF);
        if (catF !== 'all') arr = arr.filter(t => t.category === catF);

        arr.sort((a, b) => {
            if (sortBy === 'date') return new Date(b.date) - new Date(a.date);
            if (sortBy === 'amount') return b.amount - a.amount;
            if (sortBy === 'name') return a.recipientName.localeCompare(b.recipientName);
            return 0;
        });
        return arr;
    }, [transactions, search, typeF, statusF, catF, sortBy]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleSave = useCallback((tx) => {
        if (tx.id) {
            update(s => ({ ...s, transactions: s.transactions.map(t => t.id === tx.id ? { ...t, ...tx } : t) }));
        } else {
            update(s => ({ ...s, transactions: [{ ...tx, id: uuidv4(), createdAt: new Date().toISOString() }, ...s.transactions] }));
        }
        setModal(null);
    }, [update]);

    const handleDelete = useCallback((id) => {
        update(s => ({ ...s, transactions: s.transactions.filter(t => t.id !== id) }));
        setDelId(null);
    }, [update]);

    return (
        <>
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div className="page-title">Transactions</div>
                        <div className="page-desc">{filtered.length} transactions found</div>
                    </div>
                    <button id="add-transaction-btn" className="btn btn-primary" onClick={() => setModal({})}>
                        <Plus size={15} /> Add Transaction
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-body" style={{ paddingTop: 16, paddingBottom: 16 }}>
                    <div className="filters-bar">
                        <div className="header-search" style={{ flex: 1, minWidth: 200 }}>
                            <Search size={14} />
                            <input
                                id="tx-search-input"
                                type="text"
                                placeholder="Search by name, ID or notes..."
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1); }}
                            />
                        </div>
                        <select id="tx-type-filter" className="form-select" value={typeF} onChange={e => { setTypeF(e.target.value); setPage(1); }} style={{ minWidth: 120 }}>
                            <option value="all">All Types</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                        <select id="tx-status-filter" className="form-select" value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1); }} style={{ minWidth: 130 }}>
                            <option value="all">All Statuses</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                        </select>
                        <select id="tx-cat-filter" className="form-select" value={catF} onChange={e => { setCatF(e.target.value); setPage(1); }} style={{ minWidth: 150 }}>
                            <option value="all">All Categories</option>
                            {allCats.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select id="tx-sort" className="form-select" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ minWidth: 130 }}>
                            <option value="date">Sort: Date</option>
                            <option value="amount">Sort: Amount</option>
                            <option value="name">Sort: Name</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Transaction ID</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th style={{ textAlign: 'right' }}>Amount</th>
                                <th style={{ textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paged.length === 0 ? (
                                <tr><td colSpan={7}>
                                    <div className="empty-state">
                                        <div className="empty-state-icon"><Search size={22} /></div>
                                        <div className="empty-title">No transactions found</div>
                                        <div className="empty-desc">Try adjusting your filters or add a new transaction</div>
                                    </div>
                                </td></tr>
                            ) : paged.map(t => (
                                <tr key={t.id}>
                                    <td>
                                        <div className="tx-name-cell">
                                            <div className="tx-avatar">{getInitials(t.recipientName)}</div>
                                            <div>
                                                <div className="tx-name">{t.recipientName}</div>
                                                <div className="tx-sub">{t.notes || '—'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{t.id.substring(0, 8)}</td>
                                    <td style={{ fontSize: '0.82rem' }}>{t.category}</td>
                                    <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
                                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{format(new Date(t.date), 'MMM d, yyyy · HH:mm')}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <span className={t.type === 'income' ? 'amount-positive' : 'amount-negative'}>
                                            {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-row" style={{ justifyContent: 'center' }}>
                                            <button className="btn btn-ghost btn-icon" title="Edit" onClick={() => setModal(t)}><Pencil size={14} /></button>
                                            <button className="btn btn-ghost btn-icon" title="Delete" onClick={() => setDelId(t.id)} style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="pagination">
                    <div className="pagination-info">
                        Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                    </div>
                    <div className="pagination-btns">
                        <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></button>
                        <span style={{ padding: '4px 12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{page} / {totalPages}</span>
                        <button className="btn btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {modal !== null && (
                <TransactionModal
                    tx={modal?.id ? modal : null}
                    onClose={() => setModal(null)}
                    onSave={handleSave}
                />
            )}
            {delId && (
                <ConfirmModal
                    message="Are you sure you want to delete this transaction? This action cannot be undone."
                    onConfirm={() => handleDelete(delId)}
                    onCancel={() => setDelId(null)}
                />
            )}
        </>
    );
}
