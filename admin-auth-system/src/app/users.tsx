import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import UserTable from '../components/UserTable';

export default function UsersPage() {
    // Example users, replace with real data from backend
    const users = [
        { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
        { id: '2', name: 'Mentor User', email: 'mentor@example.com', role: 'mentor' },
        { id: '3', name: 'Regular User', email: 'user@example.com', role: 'user' },
    ];

    return (
        <DashboardLayout>
            <h2 className="text-2xl font-bold mb-4">User Management</h2>
            <UserTable users={users} />
        </DashboardLayout>
    );
}
