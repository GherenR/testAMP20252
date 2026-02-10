import React from 'react';
import { Routes, Route } from 'react-router-dom';

import AdminDashboard from '../components/admin/AdminDashboard';
import RequireAdmin from '../components/admin/RequireAdmin';
import AnalyticsPage from './analytics';
import AlumniEditorPage from './alumni';
import ImportCSVPage from './import';
import SettingsPage from './settings';
import UserManagementPage from './users';
import ExportPage from './export';
import ActivityLogPage from './activity';
import DuplicatesPage from './duplicates';
import EmailPage from './email';
import BulkOperationsPage from './bulk';

export default function AdminPage() {
    return (
        <Routes>
            <Route path="/" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/alumni" element={<AlumniEditorPage />} />
            <Route path="/import" element={<ImportCSVPage />} />
            <Route path="/export" element={<ExportPage />} />
            <Route path="/duplicates" element={<DuplicatesPage />} />
            <Route path="/bulk" element={<BulkOperationsPage />} />
            <Route path="/email" element={<EmailPage />} />
            <Route path="/activity" element={<ActivityLogPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/users" element={<UserManagementPage />} />
        </Routes>
    );
}
