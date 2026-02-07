import React from 'react';

export default function UserTable({ users }: { users: any[] }) {
    return (
        <table className="min-w-full bg-white rounded-lg shadow">
            <thead>
                <tr>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Role</th>
                    <th className="px-4 py-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                {users.map((user) => (
                    <tr key={user.id}>
                        <td className="px-4 py-2">{user.name}</td>
                        <td className="px-4 py-2">{user.email}</td>
                        <td className="px-4 py-2">{user.role}</td>
                        <td className="px-4 py-2">
                            <button className="bg-blue-500 text-white px-2 py-1 rounded mr-2">Reset Password</button>
                            <button className="bg-green-500 text-white px-2 py-1 rounded">Change Role</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
