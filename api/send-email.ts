import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendBrandEmail } from './_utils/emailService';

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

    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
        return res.status(400).json({ error: 'Missing required fields: to, subject, body' });
    }

    try {
        const result = await sendBrandEmail(to, subject, body);

        return res.status(200).json({
            success: true,
            message: 'Email sent successfully',
            provider: result.provider
        });
    } catch (error: any) {
        console.error('[send-email] Error:', error.message);

        // Return 429 if daily limit reached
        if (error.message.includes('Daily email limit reached')) {
            return res.status(429).json({
                error: 'Limit reached',
                message: error.message
            });
        }

        return res.status(500).json({
            error: 'Failed to send email',
            message: error.message
        });
    }
}
