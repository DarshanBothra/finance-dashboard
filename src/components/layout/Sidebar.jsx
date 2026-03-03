import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, ArrowLeftRight, Wallet, Target,
    BarChart2, FileText, Settings, TrendingUp
} from 'lucide-react';

const NAV_ITEMS = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { to: '/wallet', label: 'Wallet', icon: Wallet },
    { to: '/goals', label: 'Goals', icon: Target },
    { to: '/analytics', label: 'Analytics', icon: BarChart2 },
    { to: '/reports', label: 'Reports', icon: FileText },
];

export default function Sidebar() {
    return (
        <aside className="sidebar" aria-label="Main navigation">
            {/* Brand */}
            <div className="sidebar-brand">
                <div className="sidebar-brand-icon">
                    <TrendingUp size={18} />
                </div>
                <div>
                    <div className="sidebar-brand-name">JM Solutionss</div>
                    <div className="sidebar-brand-sub">Finance Dashboard</div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                <div className="sidebar-section-label">Menu</div>
                {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
                        id={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                        <Icon size={18} className="nav-icon" />
                        {label}
                    </NavLink>
                ))}

                <div className="sidebar-section-label" style={{ marginTop: 16 }}>Preferences</div>
                <div className="sidebar-nav-item" style={{ cursor: 'default', opacity: 0.6 }}>
                    <Settings size={18} className="nav-icon" />
                    Settings
                </div>
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    © 2026 JM Solutionss
                </div>
            </div>
        </aside>
    );
}
