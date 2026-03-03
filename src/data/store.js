import { v4 as uuidv4 } from 'uuid';
import { subDays, subMonths, startOfMonth, endOfMonth, format, parseISO } from 'date-fns';

const STORE_KEY = 'jm_finance_data';

const EXPENSE_CATEGORIES = [
    'Food & Grocery', 'Transportation', 'Entertainment', 'Healthcare',
    'Shopping', 'Bills & Utilities', 'Travel', 'Education', 'Subscriptions', 'Other'
];

const INCOME_CATEGORIES = [
    'Salary', 'Freelance', 'Investments', 'Rental Income', 'Gifts', 'Refunds', 'Other'
];

const RECIPIENT_NAMES = [
    'Amazon', 'Netflix', 'Spotify', 'Whole Foods', 'Uber', 'Shell Gas',
    'CVS Pharmacy', 'Zara', 'Airbnb', 'Apple Store', 'Google Play',
    'Electric Co.', 'AT&T', 'Planet Fitness', 'Coursera', 'Starbucks',
    'Target', 'McDonald\'s', 'Delta Airlines', 'Walgreens'
];

const INCOME_SOURCES = [
    'Employer Corp', 'Freelance Client A', 'Investment Returns',
    'Rental Property', 'Gift from family', 'Tax Refund', 'Consulting Fee'
];

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateTransactions() {
    const txns = [];
    const now = new Date(2026, 2, 3); // March 3, 2026

    // Generate 12 months of salary income
    for (let m = 11; m >= 0; m--) {
        const date = subMonths(now, m);
        txns.push({
            id: uuidv4(),
            type: 'income',
            amount: randomBetween(5800, 6500),
            category: 'Salary',
            recipientName: 'Employer Corp',
            status: 'completed',
            date: new Date(date.getFullYear(), date.getMonth(), 1).toISOString(),
            notes: 'Monthly salary',
            isFixed: true,
            createdAt: new Date().toISOString(),
        });
    }

    // Variable income (freelance, investments, etc.)
    const variableIncomeMonths = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    variableIncomeMonths.forEach(m => {
        if (Math.random() > 0.4) {
            const date = subMonths(now, m);
            txns.push({
                id: uuidv4(),
                type: 'income',
                amount: randomBetween(300, 2200),
                category: randomFrom(['Freelance', 'Investments', 'Rental Income', 'Refunds']),
                recipientName: randomFrom(INCOME_SOURCES.slice(1)),
                status: 'completed',
                date: new Date(date.getFullYear(), date.getMonth(), randomBetween(5, 28)).toISOString(),
                notes: '',
                isFixed: false,
                createdAt: new Date().toISOString(),
            });
        }
    });

    // Generate 120 expense transactions over last 12 months
    for (let i = 0; i < 120; i++) {
        const daysAgo = randomBetween(0, 365);
        const date = subDays(now, daysAgo);
        const category = randomFrom(EXPENSE_CATEGORIES);
        let amount;
        switch (category) {
            case 'Food & Grocery': amount = randomBetween(15, 200); break;
            case 'Transportation': amount = randomBetween(10, 120); break;
            case 'Entertainment': amount = randomBetween(8, 80); break;
            case 'Healthcare': amount = randomBetween(20, 300); break;
            case 'Shopping': amount = randomBetween(25, 350); break;
            case 'Bills & Utilities': amount = randomBetween(50, 250); break;
            case 'Travel': amount = randomBetween(100, 800); break;
            case 'Education': amount = randomBetween(30, 200); break;
            case 'Subscriptions': amount = randomBetween(8, 60); break;
            default: amount = randomBetween(10, 150); break;
        }
        const status = Math.random() > 0.1
            ? 'completed'
            : (Math.random() > 0.5 ? 'pending' : 'failed');

        txns.push({
            id: uuidv4(),
            type: 'expense',
            amount,
            category,
            recipientName: randomFrom(RECIPIENT_NAMES),
            status,
            date: date.toISOString(),
            notes: '',
            isFixed: ['Bills & Utilities', 'Subscriptions'].includes(category),
            createdAt: new Date().toISOString(),
        });
    }

    return txns.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function generateCards() {
    return [
        {
            id: uuidv4(),
            lastFour: '4242',
            cardholderName: 'Darshan Bothra',
            expiryDate: '06/28',
            cardType: 'visa',
            nickname: 'Main Card',
            createdAt: new Date().toISOString(),
        },
        {
            id: uuidv4(),
            lastFour: '5555',
            cardholderName: 'Darshan Bothra',
            expiryDate: '11/27',
            cardType: 'mastercard',
            nickname: 'Rewards Card',
            createdAt: new Date().toISOString(),
        },
        {
            id: uuidv4(),
            lastFour: '3782',
            cardholderName: 'Darshan Bothra',
            expiryDate: '03/29',
            cardType: 'amex',
            nickname: 'Travel Card',
            createdAt: new Date().toISOString(),
        },
    ];
}

function generateGoals() {
    return [
        {
            id: uuidv4(),
            name: 'Emergency Fund',
            targetAmount: 15000,
            currentAmount: 8750,
            targetDate: '2026-12-31',
            createdAt: new Date().toISOString(),
        },
        {
            id: uuidv4(),
            name: 'Summer Vacation',
            targetAmount: 5000,
            currentAmount: 2200,
            targetDate: '2026-07-01',
            createdAt: new Date().toISOString(),
        },
        {
            id: uuidv4(),
            name: 'New Laptop',
            targetAmount: 2500,
            currentAmount: 1800,
            targetDate: '2026-04-15',
            createdAt: new Date().toISOString(),
        },
        {
            id: uuidv4(),
            name: 'Down Payment',
            targetAmount: 50000,
            currentAmount: 12000,
            targetDate: '2028-01-01',
            createdAt: new Date().toISOString(),
        },
    ];
}

function generateUser() {
    return {
        id: uuidv4(),
        name: 'Darshan Bothra',
        email: 'darshan@jmsolutionss.com',
        currency: 'USD',
        monthlySpendingLimit: 4500,
        createdAt: new Date().toISOString(),
    };
}

function generateBudgets() {
    return [
        { id: uuidv4(), category: 'Investment', allocatedAmount: 1000, spentAmount: 820, month: '2026-03' },
        { id: uuidv4(), category: 'Travelling', allocatedAmount: 800, spentAmount: 340, month: '2026-03' },
        { id: uuidv4(), category: 'Food & Grocery', allocatedAmount: 600, spentAmount: 512, month: '2026-03' },
        { id: uuidv4(), category: 'Entertainment', allocatedAmount: 400, spentAmount: 290, month: '2026-03' },
        { id: uuidv4(), category: 'Healthcare', allocatedAmount: 300, spentAmount: 145, month: '2026-03' },
    ];
}

export function initStore() {
    const existing = localStorage.getItem(STORE_KEY);
    if (existing) return JSON.parse(existing);

    const data = {
        user: generateUser(),
        transactions: generateTransactions(),
        cards: generateCards(),
        goals: generateGoals(),
        budgets: generateBudgets(),
    };
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
    return data;
}

export function getStore() {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : initStore();
}

export function setStore(data) {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

export function updateStore(updater) {
    const current = getStore();
    const updated = updater(current);
    setStore(updated);
    return updated;
}

// ── Transaction helpers ──────────────────────────────────
export function addTransaction(tx) {
    return updateStore(s => ({
        ...s,
        transactions: [{ ...tx, id: uuidv4(), createdAt: new Date().toISOString() }, ...s.transactions],
    }));
}

export function editTransaction(id, updates) {
    return updateStore(s => ({
        ...s,
        transactions: s.transactions.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
}

export function deleteTransaction(id) {
    return updateStore(s => ({
        ...s,
        transactions: s.transactions.filter(t => t.id !== id),
    }));
}

// ── Card helpers ─────────────────────────────────────────
export function addCard(card) {
    return updateStore(s => ({
        ...s,
        cards: [...s.cards, { ...card, id: uuidv4(), createdAt: new Date().toISOString() }],
    }));
}

export function editCard(id, updates) {
    return updateStore(s => ({
        ...s,
        cards: s.cards.map(c => c.id === id ? { ...c, ...updates } : c),
    }));
}

export function deleteCard(id) {
    return updateStore(s => ({
        ...s,
        cards: s.cards.filter(c => c.id !== id),
    }));
}

// ── Goal helpers ─────────────────────────────────────────
export function addGoal(goal) {
    return updateStore(s => ({
        ...s,
        goals: [...s.goals, { ...goal, id: uuidv4(), createdAt: new Date().toISOString() }],
    }));
}

export function editGoal(id, updates) {
    return updateStore(s => ({
        ...s,
        goals: s.goals.map(g => g.id === id ? { ...g, ...updates } : g),
    }));
}

export function deleteGoal(id) {
    return updateStore(s => ({
        ...s,
        goals: s.goals.filter(g => g.id !== id),
    }));
}

export function contributeToGoal(id, amount) {
    return updateStore(s => ({
        ...s,
        goals: s.goals.map(g =>
            g.id === id ? { ...g, currentAmount: Math.min(g.currentAmount + amount, g.targetAmount) } : g
        ),
    }));
}

// ── User helpers ─────────────────────────────────────────
export function updateUser(updates) {
    return updateStore(s => ({ ...s, user: { ...s.user, ...updates } }));
}

// ── Finance calc helpers ─────────────────────────────────
export function calcMetrics(transactions, monthOffset = 0) {
    const now = new Date(2026, 2, 3);
    const target = subMonths(now, monthOffset);
    const prevTarget = subMonths(now, monthOffset + 1);

    const inMonth = (t, ref) => {
        const d = new Date(t.date);
        return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
    };

    const current = transactions.filter(t => inMonth(t, target) && t.status !== 'failed');
    const previous = transactions.filter(t => inMonth(t, prevTarget) && t.status !== 'failed');

    const sum = (arr, type) => arr.filter(t => t.type === type).reduce((a, t) => a + t.amount, 0);

    const curIncome = sum(current, 'income');
    const curExpense = sum(current, 'expense');
    const curSavings = curIncome - curExpense;
    const prevIncome = sum(previous, 'income');
    const prevExpense = sum(previous, 'expense');
    const prevSavings = prevIncome - prevExpense;

    const pct = (cur, prev) => prev === 0 ? 0 : (((cur - prev) / prev) * 100).toFixed(1);

    const allCompleted = transactions.filter(t => t.status !== 'failed');
    const totalBalance =
        allCompleted.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0) -
        allCompleted.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);

    const prevAllCompleted = transactions.filter(t => t.status !== 'failed' && !inMonth(t, target));
    const prevBalance =
        prevAllCompleted.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0) -
        prevAllCompleted.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);

    return {
        totalBalance,
        balanceChange: pct(totalBalance, prevBalance),
        income: curIncome,
        incomeChange: pct(curIncome, prevIncome),
        expense: curExpense,
        expenseChange: pct(curExpense, prevExpense),
        savings: curSavings,
        savingsChange: pct(curSavings, prevSavings),
    };
}

export function getIncomeChartData(transactions, period) {
    const now = new Date(2026, 2, 3);
    let months;
    if (period === 'this_month') months = 1;
    else if (period === 'last_3') months = 3;
    else if (period === 'last_6') months = 6;
    else months = 12;

    const result = [];
    for (let m = months - 1; m >= 0; m--) {
        const ref = subMonths(now, m);
        const label = format(ref, 'MMM');
        const inMonth = t => {
            const d = new Date(t.date);
            return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && t.type === 'income' && t.status !== 'failed';
        };
        const monthTxns = transactions.filter(inMonth);
        result.push({
            month: label,
            fixed: monthTxns.filter(t => t.isFixed).reduce((a, t) => a + t.amount, 0),
            variable: monthTxns.filter(t => !t.isFixed).reduce((a, t) => a + t.amount, 0),
        });
    }
    return result;
}

export const BUDGET_COLORS = {
    'Investment': '#2E3A8C',
    'Travelling': '#4A5FD9',
    'Food & Grocery': '#22c55e',
    'Entertainment': '#f59e0b',
    'Healthcare': '#ef4444',
};

export { EXPENSE_CATEGORIES, INCOME_CATEGORIES };
