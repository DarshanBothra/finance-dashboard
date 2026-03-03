import React, { useState, useCallback } from 'react';
import { Plus, Target, Pencil, Trash2, X, Check, DollarSign, CalendarDays } from 'lucide-react';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { useStore } from '../context/StoreContext';
import { v4 as uuidv4 } from 'uuid';

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const GOAL_ICONS = ['🎯', '🏖️', '💻', '🏠', '🚗', '✈️', '🎓', '💎', '🌟', '🏋️'];

function GoalModal({ goal, onClose, onSave }) {
    const isEdit = Boolean(goal?.id);
    const [form, setForm] = useState({
        name: goal?.name || '',
        targetAmount: goal?.targetAmount?.toString() || '',
        currentAmount: goal?.currentAmount?.toString() || '0',
        targetDate: goal?.targetDate || '',
    });
    const [errors, setErrors] = useState({});
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Goal name is required';
        if (!form.targetAmount || parseFloat(form.targetAmount) <= 0) errs.targetAmount = 'Enter a valid target amount';
        if (!form.targetDate) errs.targetDate = 'Target date is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;
        onSave({
            ...goal,
            name: form.name.trim(),
            targetAmount: parseFloat(form.targetAmount),
            currentAmount: isEdit ? goal.currentAmount : parseFloat(form.currentAmount || 0),
            targetDate: form.targetDate,
        });
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" id="goal-modal">
                <div className="modal-header">
                    <div className="modal-title">{isEdit ? 'Edit Goal' : 'Add New Goal'}</div>
                    <button className="modal-close" onClick={onClose}><X size={14} /></button>
                </div>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="form-group">
                        <label className="form-label">Goal Name</label>
                        <input id="goal-name" className={`form-input${errors.name ? ' error' : ''}`} type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Emergency Fund, New Car..." />
                        {errors.name && <div className="form-error">{errors.name}</div>}
                    </div>

                    <div className="form-grid-2">
                        <div className="form-group">
                            <label className="form-label">Target Amount ($)</label>
                            <input id="goal-target" className={`form-input${errors.targetAmount ? ' error' : ''}`} type="number" min="0" step="100" value={form.targetAmount} onChange={e => set('targetAmount', e.target.value)} placeholder="0" />
                            {errors.targetAmount && <div className="form-error">{errors.targetAmount}</div>}
                        </div>
                        {!isEdit && (
                            <div className="form-group">
                                <label className="form-label">Initial Deposit ($)</label>
                                <input id="goal-initial" className="form-input" type="number" min="0" step="1" value={form.currentAmount} onChange={e => set('currentAmount', e.target.value)} placeholder="0" />
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Target Date</label>
                        <input id="goal-date" className={`form-input${errors.targetDate ? ' error' : ''}`} type="date" value={form.targetDate} onChange={e => set('targetDate', e.target.value)} />
                        {errors.targetDate && <div className="form-error">{errors.targetDate}</div>}
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                    <button id="goal-save-btn" className="btn btn-primary" onClick={handleSave}>
                        <Check size={14} /> {isEdit ? 'Save Changes' : 'Create Goal'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ContributeModal({ goal, onClose, onContribute }) {
    const [amount, setAmount] = useState('');
    const [err, setErr] = useState('');
    const remaining = goal.targetAmount - goal.currentAmount;

    const handle = () => {
        const n = parseFloat(amount);
        if (!n || n <= 0) { setErr('Enter a valid amount'); return; }
        if (n > remaining) { setErr(`Max contribution is ${fmt(remaining)}`); return; }
        onContribute(n);
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal modal-sm" id="contribute-modal">
                <div className="modal-header">
                    <div className="modal-title">Add Money to Goal</div>
                    <button className="modal-close" onClick={onClose}><X size={14} /></button>
                </div>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ background: 'var(--primary-50)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        <strong>{goal.name}</strong> — {fmt(goal.currentAmount)} / {fmt(goal.targetAmount)}
                    </div>
                    <div className="form-group">
                        <label className="form-label">Amount to Add ($)</label>
                        <input id="contribute-amount" className={`form-input${err ? ' error' : ''}`} type="number" min="1" value={amount} onChange={e => { setAmount(e.target.value); setErr(''); }} placeholder="0" autoFocus />
                        {err && <div className="form-error">{err}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {[50, 100, 250, 500].filter(n => n <= remaining).map(n => (
                            <button key={n} className="btn btn-outline btn-sm" onClick={() => setAmount(n.toString())}>${n}</button>
                        ))}
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                    <button id="contribute-save-btn" className="btn btn-primary" onClick={handle}><DollarSign size={14} /> Add Money</button>
                </div>
            </div>
        </div>
    );
}

function ConfirmModal({ onConfirm, onCancel }) {
    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
            <div className="modal modal-sm">
                <div className="modal-header">
                    <div className="modal-title">Delete Goal</div>
                    <button className="modal-close" onClick={onCancel}><X size={14} /></button>
                </div>
                <div className="confirm-body">
                    <div className="confirm-message">Are you sure you want to delete this goal? This action cannot be undone.</div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
                        <button id="confirm-delete-goal-btn" className="btn btn-danger" onClick={onConfirm}>Delete</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Goals() {
    const { data, update } = useStore();
    const goals = data?.goals || [];
    const [modal, setModal] = useState(null);
    const [contributeGoal, setCG] = useState(null);
    const [delId, setDelId] = useState(null);

    const handleSave = useCallback((goal) => {
        if (goal.id) {
            update(s => ({ ...s, goals: s.goals.map(g => g.id === goal.id ? { ...g, ...goal } : g) }));
        } else {
            update(s => ({ ...s, goals: [...s.goals, { ...goal, id: uuidv4(), createdAt: new Date().toISOString() }] }));
        }
        setModal(null);
    }, [update]);

    const handleContribute = useCallback((id, amount) => {
        update(s => ({
            ...s,
            goals: s.goals.map(g => g.id === id ? { ...g, currentAmount: Math.min(g.currentAmount + amount, g.targetAmount) } : g)
        }));
        setCG(null);
    }, [update]);

    const handleDelete = useCallback((id) => {
        update(s => ({ ...s, goals: s.goals.filter(g => g.id !== id) }));
        setDelId(null);
    }, [update]);

    return (
        <>
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div className="page-title">Savings Goals</div>
                        <div className="page-desc">{goals.length} active goal{goals.length !== 1 ? 's' : ''}</div>
                    </div>
                    <button id="add-goal-btn" className="btn btn-primary" onClick={() => setModal({})}>
                        <Plus size={15} /> Add Goal
                    </button>
                </div>
            </div>

            {goals.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon"><Target size={24} /></div>
                        <div className="empty-title">No goals yet</div>
                        <div className="empty-desc">Create your first savings goal to get started</div>
                        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setModal({})}>
                            <Plus size={15} /> Add Goal
                        </button>
                    </div>
                </div>
            ) : (
                <div className="goals-grid">
                    {goals.map((goal, ix) => {
                        const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                        const done = pct >= 100;
                        const days = goal.targetDate ? formatDistanceToNow(parseISO(goal.targetDate), { addSuffix: true }) : null;
                        const remaining = goal.targetAmount - goal.currentAmount;

                        return (
                            <div key={goal.id} className="goal-card" id={`goal-${goal.id}`}>
                                <div className="goal-header">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div className="goal-icon">
                                            <span style={{ fontSize: '1.1rem' }}>{GOAL_ICONS[ix % GOAL_ICONS.length]}</span>
                                        </div>
                                        <div>
                                            <div className="goal-name">{goal.name}</div>
                                            <div className="goal-target">Target: {fmt(goal.targetAmount)}</div>
                                        </div>
                                    </div>
                                    {done && (
                                        <span className="badge badge-completed">✓ Complete</span>
                                    )}
                                </div>

                                <div className="goal-amounts">
                                    <div className="goal-current">{fmt(goal.currentAmount)}</div>
                                    <div className="goal-of">of {fmt(goal.targetAmount)}</div>
                                    <div className="goal-pct">{pct.toFixed(0)}%</div>
                                </div>

                                <div className="progress-track">
                                    <div
                                        className={`progress-fill${done ? '' : pct > 80 ? '' : ''}`}
                                        style={{
                                            width: `${pct}%`,
                                            background: done
                                                ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                                                : 'linear-gradient(90deg, var(--primary), var(--primary-light))'
                                        }}
                                    />
                                </div>

                                <div className="goal-meta">
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <CalendarDays size={12} /> {days || 'No deadline'}
                                    </span>
                                    {!done && <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{fmt(remaining)} to go</span>}
                                </div>

                                <div className="goal-actions">
                                    {!done && (
                                        <button id={`contribute-btn-${goal.id}`} className="btn btn-primary btn-sm" onClick={() => setCG(goal)}>
                                            <DollarSign size={13} /> Add Money
                                        </button>
                                    )}
                                    <button className="btn btn-ghost btn-sm" onClick={() => setModal(goal)}>
                                        <Pencil size={13} /> Edit
                                    </button>
                                    <button className="btn btn-ghost btn-sm" onClick={() => setDelId(goal.id)} style={{ color: 'var(--danger)', marginLeft: 'auto' }}>
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {modal !== null && (
                <GoalModal goal={modal?.id ? modal : null} onClose={() => setModal(null)} onSave={handleSave} />
            )}
            {contributeGoal && (
                <ContributeModal goal={contributeGoal} onClose={() => setCG(null)} onContribute={(amt) => handleContribute(contributeGoal.id, amt)} />
            )}
            {delId && (
                <ConfirmModal onConfirm={() => handleDelete(delId)} onCancel={() => setDelId(null)} />
            )}
        </>
    );
}
