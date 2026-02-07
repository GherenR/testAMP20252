import React from 'react';

export default function FeatureClicksTable({ clicks }: { clicks: any[] }) {
    return (
        <table className="min-w-full bg-white rounded-lg shadow">
            <thead>
                <tr>
                    <th className="px-4 py-2">Feature</th>
                    <th className="px-4 py-2">Session</th>
                    <th className="px-4 py-2">Timestamp</th>
                </tr>
            </thead>
            <tbody>
                {clicks.map((click) => (
                    <tr key={click.id}>
                        <td className="px-4 py-2">{click.feature_name}</td>
                        <td className="px-4 py-2">{click.session_id}</td>
                        <td className="px-4 py-2">{new Date(click.timestamp).toLocaleString()}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
