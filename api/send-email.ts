import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple email sender using Resend API
// To use: Add RESEND_API_KEY to Vercel Environment Variables
// Get your API key at https://resend.com

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
        return res.status(500).json({
            error: 'Email not configured',
            message: 'RESEND_API_KEY belum diset di environment variables. Daftar gratis di resend.com'
        });
    }

    const { to, subject, body, from } = req.body;

    if (!to || !subject || !body) {
        return res.status(400).json({ error: 'Missing required fields: to, subject, body' });
    }

    try {
        // Send via Resend API
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: from || 'AMP IKAHATA <onboarding@resend.dev>', // Use verified domain or resend.dev for testing
                to: Array.isArray(to) ? to : [to],
                subject,
                text: body
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Resend error:', data);
            return res.status(response.status).json({
                error: data.message || 'Failed to send email',
                details: data
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Email sent successfully',
            id: data.id
        });
    } catch (error: any) {
        console.error('Email send error:', error);
        return res.status(500).json({
            error: 'Failed to send email',
            message: error.message
        });
    }
}
