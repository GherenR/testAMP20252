import React from 'react';

export default function MentorInteractionsTable({ interactions }: { interactions: any[] }) {
    return (
        <table className="min-w-full bg-white rounded-lg shadow">
            <thead>
                <tr>
                    <th className="px-4 py-2">Mentor</th>
                    <th className="px-4 py-2">Session</th>
                    <th className="px-4 py-2">Timestamp</th>
                </tr>
            </thead>
            <tbody>
                {interactions.map((interaction) => (
                    <tr key={interaction.id}>
                        <td className="px-4 py-2">{interaction.mentor_name}</td>
                        <td className="px-4 py-2">{interaction.session_id}</td>
                        <td className="px-4 py-2">{new Date(interaction.timestamp).toLocaleString()}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
