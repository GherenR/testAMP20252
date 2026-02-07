import React from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-white shadow p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
                <nav>
                    <a href="/dashboard" className="mr-4 text-gray-600 hover:text-blue-600">Dashboard</a>
                    <a href="/users" className="mr-4 text-gray-600 hover:text-blue-600">Users</a>
                    <a href="/stats" className="text-gray-600 hover:text-blue-600">Statistics</a>
                </nav>
            </header>
            <main className="flex-1 p-6">{children}</main>
        </div>
    );
}
