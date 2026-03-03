import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { StoreProvider } from './context/StoreContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Wallet from './pages/Wallet';
import Goals from './pages/Goals';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';

export default function App() {
    return (
        <ThemeProvider>
            <StoreProvider>
                <BrowserRouter>
                    <div className="app-layout">
                        <Sidebar />
                        <div className="app-main">
                            <Header />
                            <main className="page-content">
                                <Routes>
                                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/transactions" element={<Transactions />} />
                                    <Route path="/wallet" element={<Wallet />} />
                                    <Route path="/goals" element={<Goals />} />
                                    <Route path="/analytics" element={<Analytics />} />
                                    <Route path="/reports" element={<Reports />} />
                                </Routes>
                            </main>
                        </div>
                    </div>
                </BrowserRouter>
            </StoreProvider>
        </ThemeProvider>
    );
}
