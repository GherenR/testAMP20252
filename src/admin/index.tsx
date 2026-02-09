import React from 'react';
import { Routes, Route } from 'react-router-dom';

import AdminDashboard from '../components/admin/AdminDashboard';
import RequireAdmin from '../components/admin/RequireAdmin';
import AnalyticsPage from './analytics';
import AlumniEditorPage from './alumni';
import ImportCSVPage from './import';
import SettingsPage from './settings';
import UserManagementPage from './users';

export default function AdminPage() {
    return (
        <Routes>
            <Route path="/" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/alumni" element={<AlumniEditorPage />} />
            <Route path="/import" element={<ImportCSVPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/users" element={<UserManagementPage />} />
        </Routes>
    );
}
