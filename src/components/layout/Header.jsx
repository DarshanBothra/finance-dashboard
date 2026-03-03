import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Sun, Moon, Settings } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useStore } from '../../context/StoreContext';

const PAGE_TITLES = {
    '/dashboard': { title: 'Dashboard', sub: 'Your financial overview' },
    '/transactions': { title: 'Transactions', sub: 'Manage your transactions' },
    '/wallet': { title: 'Wallet', sub: 'Manage your payment cards' },
    '/goals': { title: 'Goals', sub: 'Track your savings goals' },
    '/analytics': { title: 'Analytics', sub: 'Spending insights & trends' },
    '/reports': { title: 'Reports', sub: 'Monthly & yearly summaries' },
};

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

export default function Header() {
    const { theme, toggle } = useTheme();
    const { data } = useStore();
    const { pathname } = useLocation();
    const [search, setSearch] = useState('');

    const page = PAGE_TITLES[pathname] || { title: 'Dashboard', sub: '' };
    const user = data?.user || { name: 'User' };
    const initials = getInitials(user.name);

    return (
        <header className="header">
            <div className="header-left">
                <div className="header-title">{page.title}</div>
                <div className="header-subtitle">{page.sub}</div>
            </div>

            <div className="header-right">
                {/* Search */}
                <div className="header-search">
                    <Search size={14} />
                    <input
                        id="header-search-input"
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                {/* Notifications */}
                <button id="header-notifications-btn" className="header-icon-btn" title="Notifications">
                    <Bell size={16} />
                    <span className="badge">3</span>
                </button>

                {/* Theme toggle */}
                <button
                    id="header-theme-toggle"
                    className="header-icon-btn"
                    onClick={toggle}
                    title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                    {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                </button>

                {/* Divider */}
                <div style={{ width: 1, height: 28, background: 'var(--border)', margin: '0 4px' }} />

                {/* User */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'default' }}>
                    <div className="user-avatar" id="header-user-avatar" title={user.name}>
                        {initials}
                    </div>
                    <div className="user-info">
                        <div className="user-name">{user.name}</div>
                        <div className="user-role">Personal Account</div>
                    </div>
                </div>
            </div>
        </header>
    );
}
