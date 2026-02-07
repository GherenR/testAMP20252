import React from 'react';

export default function StatsWidget({ title, value }: { title: string; value: string | number }) {
    return (
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            <span className="text-sm text-gray-500 mb-2">{title}</span>
            <span className="text-2xl font-bold text-blue-600">{value}</span>
        </div>
    );
}
