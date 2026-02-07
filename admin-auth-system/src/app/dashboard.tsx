import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import StatsWidget from '../components/StatsWidget';

export default function DashboardPage() {
    // Example stats, replace with real data from backend
    const stats = [
        { title: 'Total Users', value: 120 },
        { title: 'Active Sessions', value: 15 },
        { title: 'Signups Today', value: 5 },
        { title: 'Logins Today', value: 30 },
        { title: 'Password Resets', value: 2 },
    ];

    return (
        <DashboardLayout>
            <h2 className="text-2xl font-bold mb-4">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {stats.map((stat) => (
                    <StatsWidget key={stat.title} title={stat.title} value={stat.value} />
                ))}
            </div>
            {/* Add more widgets and tables here */}
        </DashboardLayout>
    );
}
