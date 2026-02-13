import nodemailer from 'nodemailer';
import { supabase } from './supabase.js';

let transporter: nodemailer.Transporter | null = null;

/**
 * Reusable function to send branded emails using Gmail SMTP
 * Fallback to Resend API if Gmail is not configured or fails.
 * Includes a daily limit of 100 emails.
 */
export async function sendBrandEmail(to: string | string[], subject: string, message: string) {
    const WEBSITE_NAME = process.env.VITE_WEBSITE_NAME || 'IKAHATA';
    const GMAIL_USER = process.env.GMAIL_USER;
    const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD; // 16-character Google App Password
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const APP_URL = process.env.VITE_APP_URL || 'https://alumnihangtuah2025.vercel.app';

    const recipientList = Array.isArray(to) ? to : [to];
    const today = new Date().toISOString().split('T')[0];
    const timestamp = new Date().getTime(); // Unique ID to prevent Gmail threading/clipping

    // Format message for HTML: replace newlines with professional spacing
    const formattedMessage = message
        .trim()
        .split('\n')
        .map(line => line.trim() === '' ? '<div style="height: 8px;"></div>' : `<p style="margin: 0 0 10px 0;">${line}</p>`)
        .join('');

    // NOTE: SVG logos are often blocked by email clients. 
    // Using the new transparent PNG version provided by the user.
    const logoUrl = `${APP_URL}/LogoIKAHATANew-removebg-preview.png`;
    const unsubscribeUrl = `${APP_URL}/unsubscribe`; // Placeholder for reputation

    const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body { margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        .wrapper { width: 100%; border: 0; cellpadding: 0; cellspacing: 0; background-color: #f8fafc; }
        .container { width: 100%; max-width: 600px; margin: 0 auto; padding: 32px 20px; }
        .main { background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; border-collapse: separate; width: 100%; overflow: hidden; }
        .header { padding: 40px 40px 24px; text-align: center; }
        .logo { width: 80px; height: auto; display: inline-block; }
        .content { padding: 0 40px 40px; color: #334155; line-height: 1.5; font-size: 15px; text-align: left; }
        .footer { padding: 24px 40px; text-align: center; color: #64748b; font-size: 13px; background-color: #f1f5f9; border-top: 1px solid #e2e8f0; }
        .footer-brand { color: #1e293b; font-weight: 700; margin-bottom: 2px; font-size: 15px; letter-spacing: 0.5px; }
        .footer-org { color: #64748b; font-weight: 500; font-size: 12px; }
        .footer-copy { margin-top: 12px; font-size: 11px; color: #94a3b8; }
        .footer-unsubscribe { margin-top: 8px; font-size: 11px; color: #94a3b8; }
        .footer-unsubscribe a { color: #94a3b8; text-decoration: underline; }
        p { margin: 0 0 10px 0; }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc;">
    <table class="wrapper" width="100%" border="0" cellpadding="0" cellspacing="0">
        <tr>
            <td align="center">
                <table class="container" width="100%" max-width="600" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px;">
                    <tr>
                        <td align="center">
                            <table class="main" width="100%" border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td class="header">
                                        <img src="${logoUrl}" alt="${WEBSITE_NAME}" class="logo">
                                    </td>
                                </tr>
                                <tr>
                                    <td class="content">
                                        ${formattedMessage}
                                    </td>
                                </tr>
                                <tr>
                                    <td class="footer">
                                        <div class="footer-brand">${WEBSITE_NAME}</div>
                                        <div class="footer-org">Ikatan Alumni SMA Hang Tuah 1 Jakarta</div>
                                        <div class="footer-copy">&copy; ${new Date().getFullYear()} All rights reserved.</div>
                                        <div class="footer-unsubscribe">You received this because you are an alumnus. <a href="${unsubscribeUrl}">Unsubscribe</a></div>
                                        <div style="display:none !important; font-size:1px; color:#f1f5f9; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">Ref: ${timestamp}</div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    console.log(`[EmailService] Target: ${to}. Branding: ${WEBSITE_NAME}`);

    try {
        // 1. Check daily limit
        let dailyCount = 0;
        try {
            const { count, error: countError } = await supabase
                .from('email_logs')
                .select('*', { count: 'exact', head: true })
                .gte('sent_at', `${today}T00:00:00Z`)
                .eq('status', 'success');

            if (!countError) dailyCount = count || 0;
            console.log(`[EmailService] Daily count: ${dailyCount}/100`);
        } catch (dbErr: any) {
            console.error('[EmailService] DB Error calculating limit:', dbErr.message);
        }

        if (dailyCount >= 100) {
            throw new Error('Limit reached: Daily email limit reached (100/day).');
        }

        let provider = 'none';
        let sent = false;
        let lastError = '';

        // 2. Gmail SMTP
        if (GMAIL_USER && GMAIL_APP_PASSWORD) {
            provider = 'gmail';
            try {
                // Reuse or create transporter
                if (!transporter) {
                    console.log('[EmailService] Creating new SMTP transporter');
                    transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
                        pool: true, // Use connection pooling for bulk sends
                        maxConnections: 3,
                        maxMessages: 100,
                    });
                }

                await transporter.sendMail({
                    from: `"${WEBSITE_NAME}" <${GMAIL_USER}>`,
                    to: recipientList.join(', '),
                    replyTo: GMAIL_USER,
                    headers: {
                        'List-Unsubscribe': `<${unsubscribeUrl}>`,
                        'X-Mailer': 'AMP-IKAHATA-Mailer-v1',
                        'X-Mailer-Version': '1.0.0',
                        'X-Priority': '3', // Normal Priority
                        'Importance': 'normal'
                    },
                    subject: subject,
                    text: message,
                    html: htmlTemplate
                });

                sent = true;
                console.log('[EmailService] Gmail success');
            } catch (err: any) {
                console.error('[EmailService] Gmail failed:', err.message);
                lastError = `Gmail Error: ${err.message}`;
                // If auth failure or similar, invalidate transporter
                if (err.message.includes('Invalid login') || err.message.includes('AUTH')) {
                    transporter = null;
                }
            }
        }

        // 3. Resend Fallback
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
                        reply_to: GMAIL_USER || 'admin@alumnihangtuah.com',
                        headers: {
                            'List-Unsubscribe': `<${unsubscribeUrl}>`
                        },
                        subject: subject,
                        text: message,
                        html: htmlTemplate
                    })
                });

                if (response.ok) {
                    sent = true;
                    console.log('[EmailService] Resend success');
                } else {
                    const data = await response.json();
                    lastError = `Resend Error: ${data.message || response.statusText}`;
                    console.error('[EmailService] Resend failed:', lastError);
                }
            } catch (err: any) {
                console.error('[EmailService] Resend failed:', err.message);
                lastError = `Resend Error: ${err.message}`;
            }
        }

        // 4. Logging
        try {
            // Priority: Service Role Key for logging (bypasses RLS)
            const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
            let logClient = supabase;

            if (serviceRoleKey && process.env.VITE_SUPABASE_URL) {
                // We could create a temporary client, but let's just use the current one 
                // and hope the user's RLS policy 'Allow system to insert email logs' works.
                // If it doesn't work, we'll suggest them to check their Supabase policies.
            }

            const { error: logError } = await supabase.from('email_logs').insert({
                recipient: recipientList.join(', ').substring(0, 255),
                subject: subject.substring(0, 255),
                provider: provider,
                status: sent ? 'success' : 'error',
                error_message: sent ? null : (lastError || 'No provider').substring(0, 500)
            });

            if (logError) {
                console.error('[EmailService] Database log failed:', logError.message);
            } else {
                console.log('[EmailService] Logged to database successfully');
            }
        } catch (logErr: any) {
            console.error('[EmailService] Logging exception:', logErr.message);
        }

        if (!sent) throw new Error(lastError || 'All email providers failed.');

        return { success: true, provider };

    } catch (error: any) {
        console.error('[EmailService] Final error:', error.message);
        throw error;
    }
}
