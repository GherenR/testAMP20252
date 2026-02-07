import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import FeatureClicksTable from '../components/FeatureClicksTable';
import MentorInteractionsTable from '../components/MentorInteractionsTable';
import PageViewsTable from '../components/PageViewsTable';

export default function StatsPage() {
    // Example analytics, replace with real data from backend
    const featureClicks = [
        { id: '1', feature_name: 'Login', session_id: 'abc123', timestamp: Date.now() },
        { id: '2', feature_name: 'Signup', session_id: 'def456', timestamp: Date.now() },
    ];
    const mentorInteractions = [
        { id: '1', mentor_name: 'John Doe', session_id: 'abc123', timestamp: Date.now() },
    ];
    const pageViews = [
        { id: '1', session_id: 'abc123', slide_number: 1, timestamp: Date.now() },
    ];

    return (
        <DashboardLayout>
            <h2 className="text-2xl font-bold mb-4">Statistics & Analytics</h2>
            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Feature Clicks</h3>
                <FeatureClicksTable clicks={featureClicks} />
            </div>
            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Mentor Interactions</h3>
                <MentorInteractionsTable interactions={mentorInteractions} />
            </div>
            <div>
                <h3 className="text-lg font-semibold mb-2">Page Views</h3>
                <PageViewsTable views={pageViews} />
            </div>
        </DashboardLayout>
    );
}
