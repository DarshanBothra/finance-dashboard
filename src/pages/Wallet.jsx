import React, { useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Check, Wifi, CreditCard } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { v4 as uuidv4 } from 'uuid';

function detectCardType(num) {
    const n = num.replace(/\D/g, '');
    if (n.startsWith('4')) return 'visa';
    if (n.startsWith('5') || n.startsWith('2')) return 'mastercard';
    if (n.startsWith('3')) return 'amex';
    return 'other';
}

function CardModal({ card, onClose, onSave }) {
    const isEdit = Boolean(card?.id);
    const [form, setForm] = useState({
        cardNumber: '',
        cardholderName: card?.cardholderName || '',
        expiryDate: card?.expiryDate || '',
        nickname: card?.nickname || '',
    });
    const [errors, setErrors] = useState({});

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const validate = () => {
        const errs = {};
        if (!isEdit && (!form.cardNumber || form.cardNumber.replace(/\D/g, '').length < 4)) errs.cardNumber = 'Enter at least 4 digits';
        if (!form.cardholderName.trim()) errs.cardholderName = 'Name is required';
        if (!form.expiryDate.match(/^\d{2}\/\d{2}$/)) errs.expiryDate = 'Format: MM/YY';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;
        const digits = form.cardNumber.replace(/\D/g, '');
        onSave({
            ...card,
            lastFour: isEdit ? card.lastFour : digits.slice(-4),
            cardholderName: form.cardholderName.trim(),
            expiryDate: form.expiryDate,
            nickname: form.nickname.trim() || null,
            cardType: isEdit ? card.cardType : detectCardType(form.cardNumber),
        });
    };

    const networkLabel = { visa: 'VISA', mastercard: 'MASTERCARD', amex: 'AMEX', other: 'CARD' };
    const previewType = isEdit ? card.cardType : detectCardType(form.cardNumber);

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" id="card-modal">
                <div className="modal-header">
                    <div className="modal-title">{isEdit ? 'Edit Card' : 'Add New Card'}</div>
                    <button className="modal-close" onClick={onClose}><X size={14} /></button>
                </div>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* Preview */}
                    <div className={`payment-card card-${previewType}`} style={{ marginBottom: 4 }}>
                        <div className="payment-card-top">
                            <div className="payment-card-contactless"><Wifi size={16} /></div>
                            <div className="payment-card-network">{networkLabel[previewType]}</div>
                        </div>
                        <div className="payment-card-number">
                            {isEdit ? `•••• •••• •••• ${card.lastFour}` : (form.cardNumber ? `•••• •••• •••• ${(form.cardNumber.replace(/\D/g, '').slice(-4) || '____')}` : '•••• •••• •••• ••••')}
                        </div>
                        <div className="payment-card-bottom">
                            <div>
                                <div className="payment-card-label">Card Holder</div>
                                <div className="payment-card-value">{form.cardholderName || 'Your Name'}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div className="payment-card-label">Expires</div>
                                <div className="payment-card-value">{form.expiryDate || 'MM/YY'}</div>
                            </div>
                        </div>
                    </div>

                    {!isEdit && (
                        <div className="form-group">
                            <label className="form-label">Card Number</label>
                            <input id="card-number" className={`form-input${errors.cardNumber ? ' error' : ''}`} type="text" maxLength={19} value={form.cardNumber} onChange={e => set('cardNumber', e.target.value)} placeholder="•••• •••• •••• ••••" />
                            {errors.cardNumber && <div className="form-error">{errors.cardNumber}</div>}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Cardholder Name</label>
                        <input id="card-holder" className={`form-input${errors.cardholderName ? ' error' : ''}`} type="text" value={form.cardholderName} onChange={e => set('cardholderName', e.target.value)} placeholder="Full name" />
                        {errors.cardholderName && <div className="form-error">{errors.cardholderName}</div>}
                    </div>

                    <div className="form-grid-2">
                        <div className="form-group">
                            <label className="form-label">Expiry Date</label>
                            <input id="card-expiry" className={`form-input${errors.expiryDate ? ' error' : ''}`} type="text" maxLength={5} value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)} placeholder="MM/YY" />
                            {errors.expiryDate && <div className="form-error">{errors.expiryDate}</div>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Nickname (optional)</label>
                            <input id="card-nickname" className="form-input" type="text" value={form.nickname} onChange={e => set('nickname', e.target.value)} placeholder="e.g. Main Card" />
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                    <button id="card-save-btn" className="btn btn-primary" onClick={handleSave}>
                        <Check size={14} /> {isEdit ? 'Save Changes' : 'Add Card'}
                    </button>
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
                    <div className="modal-title">Remove Card</div>
                    <button className="modal-close" onClick={onCancel}><X size={14} /></button>
                </div>
                <div className="confirm-body">
                    <div className="confirm-message">Are you sure you want to remove this card?</div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
                        <button id="confirm-remove-card-btn" className="btn btn-danger" onClick={onConfirm}>Remove</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const NETWORK_LABELS = { visa: 'VISA', mastercard: 'MASTERCARD', amex: 'AMEX', other: 'OTHER' };

export default function Wallet() {
    const { data, update } = useStore();
    const cards = data?.cards || [];
    const [modal, setModal] = useState(null);
    const [delId, setDelId] = useState(null);

    const handleSave = useCallback((card) => {
        if (card.id) {
            update(s => ({ ...s, cards: s.cards.map(c => c.id === card.id ? { ...c, ...card } : c) }));
        } else {
            update(s => ({ ...s, cards: [...s.cards, { ...card, id: uuidv4(), createdAt: new Date().toISOString() }] }));
        }
        setModal(null);
    }, [update]);

    const handleDelete = useCallback((id) => {
        update(s => ({ ...s, cards: s.cards.filter(c => c.id !== id) }));
        setDelId(null);
    }, [update]);

    return (
        <>
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div className="page-title">Wallet</div>
                        <div className="page-desc">{cards.length} card{cards.length !== 1 ? 's' : ''} saved</div>
                    </div>
                    <button id="add-card-btn" className="btn btn-primary" onClick={() => setModal({})}>
                        <Plus size={15} /> Add Card
                    </button>
                </div>
            </div>

            {cards.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon"><CreditCard size={24} /></div>
                        <div className="empty-title">No cards added</div>
                        <div className="empty-desc">Add your first payment card to get started</div>
                        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setModal({})}>
                            <Plus size={15} /> Add Card
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                    {cards.map(card => (
                        <div key={card.id} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                            <div className={`payment-card card-${card.cardType}`} style={{ borderRadius: '14px 14px 0 0' }}>
                                <div className="payment-card-top">
                                    <div>
                                        {card.nickname && <div style={{ fontSize: '0.72rem', opacity: 0.7, marginBottom: 2 }}>{card.nickname}</div>}
                                        <div className="payment-card-contactless"><Wifi size={16} /></div>
                                    </div>
                                    <div className="payment-card-network">{NETWORK_LABELS[card.cardType]}</div>
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
                            {/* Card actions bar */}
                            <div style={{
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderTop: 'none', borderRadius: '0 0 14px 14px',
                                display: 'flex', gap: 8, padding: '10px 14px', justifyContent: 'flex-end'
                            }}>
                                <button className="btn btn-ghost btn-sm" onClick={() => setModal(card)}>
                                    <Pencil size={13} /> Edit
                                </button>
                                <button className="btn btn-ghost btn-sm" onClick={() => setDelId(card.id)} style={{ color: 'var(--danger)' }}>
                                    <Trash2 size={13} /> Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modal !== null && (
                <CardModal card={modal?.id ? modal : null} onClose={() => setModal(null)} onSave={handleSave} />
            )}
            {delId && (
                <ConfirmModal onConfirm={() => handleDelete(delId)} onCancel={() => setDelId(null)} />
            )}
        </>
    );
}
