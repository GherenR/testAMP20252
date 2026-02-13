import nodemailer from 'nodemailer';
import { supabase } from './supabase';

/**
 * Reusable function to send branded emails using Gmail SMTP
 * Fallback to Resend API if Gmail is not configured or fails.
 * Includes a daily limit of 100 emails.
 */
export async function sendBrandEmail(to: string | string[], subject: string, message: string) {
    const WEBSITE_NAME = process.env.VITE_WEBSITE_NAME || 'AMP IKAHATA';
    const GMAIL_USER = process.env.GMAIL_USER;
    const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD; // Put your 16-character Google App Password here
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    const recipientList = Array.isArray(to) ? to : [to];
    const today = new Date().toISOString().split('T')[0];

    try {
        // 1. Check daily limit (100 emails)
        const { count, error: countError } = await supabase
            .from('email_logs')
            .select('*', { count: 'exact', head: true })
            .gte('sent_at', `${today}T00:00:00Z`)
            .eq('status', 'success');

        if (countError) {
            console.error('Error checking email limit:', countError);
        } else if (count !== null && count >= 100) {
            throw new Error('Daily email limit reached (100/day). Please try again tomorrow.');
        }

        let provider = 'none';
        let sent = false;
        let lastError = '';

        // 2. Try Gmail SMTP first
        if (GMAIL_USER && GMAIL_APP_PASSWORD) {
            provider = 'gmail';
            try {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: GMAIL_USER,
                        pass: GMAIL_APP_PASSWORD,
                    },
                });

                await transporter.sendMail({
                    from: `"${WEBSITE_NAME}" <${GMAIL_USER}>`,
                    to: recipientList.join(', '),
                    subject: subject,
                    text: message,
                });

                sent = true;
            } catch (err: any) {
                console.error('Gmail SMTP failed:', err.message);
                lastError = `Gmail Error: ${err.message}`;
            }
        }

        // 3. Fallback to Resend if Gmail failed or not configured
        if (!sent && RESEND_API_KEY) {
            provider = 'resend';
            try {
                const response = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${RESEND_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from: `${WEBSITE_NAME} <onboarding@resend.dev>`,
                        to: recipientList,
                        subject: subject,
                        text: message
                    })
                });

                if (response.ok) {
                    sent = true;
                } else {
                    const data = await response.json();
                    lastError = `Resend Error: ${data.message || response.statusText}`;
                }
            } catch (err: any) {
                console.error('Resend fallback failed:', err.message);
                lastError = `Resend Error: ${err.message}`;
            }
        }

        // 4. Log the result
        await supabase.from('email_logs').insert({
            recipient: recipientList.join(', '),
            subject: subject,
            provider: provider,
            status: sent ? 'success' : 'error',
            error_message: sent ? null : (lastError || 'No provider configured')
        });

        if (!sent) {
            throw new Error(lastError || 'No email provider configured. Please check your .env settings.');
        }

        return { success: true, provider };

    } catch (error: any) {
        console.error('sendBrandEmail error:', error.message);
        throw error;
    }
}
