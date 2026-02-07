import React from 'react';

export default function PageViewsTable({ views }: { views: any[] }) {
    return (
        <table className="min-w-full bg-white rounded-lg shadow">
            <thead>
                <tr>
                    <th className="px-4 py-2">Session</th>
                    <th className="px-4 py-2">Slide</th>
                    <th className="px-4 py-2">Timestamp</th>
                </tr>
            </thead>
            <tbody>
                {views.map((view) => (
                    <tr key={view.id}>
                        <td className="px-4 py-2">{view.session_id}</td>
                        <td className="px-4 py-2">{view.slide_number}</td>
                        <td className="px-4 py-2">{new Date(view.timestamp).toLocaleString()}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
