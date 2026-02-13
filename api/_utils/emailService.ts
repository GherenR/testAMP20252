import nodemailer from 'nodemailer';
import { supabase } from './supabase.js';

/**
 * Reusable function to send branded emails using Gmail SMTP
 * Fallback to Resend API if Gmail is not configured or fails.
 * Includes a daily limit of 100 emails.
 */
export async function sendBrandEmail(to: string | string[], subject: string, message: string) {
    const WEBSITE_NAME = process.env.VITE_WEBSITE_NAME || 'AMP IKAHATA';
    const GMAIL_USER = process.env.GMAIL_USER;
    const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD; // 16-character Google App Password
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const APP_URL = process.env.VITE_APP_URL || 'https://alumnihangtuah2025.vercel.app';

    const recipientList = Array.isArray(to) ? to : [to];
    const today = new Date().toISOString().split('T')[0];

    // Format message for HTML: replace newlines with paragraphs/breaks
    const formattedMessage = message
        .split('\n')
        .map(line => line.trim() === '' ? '<br>' : `<p style="margin-bottom: 16px; margin-top: 0;">${line}</p>`)
        .join('');

    const htmlTemplate = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!--[if mso]>
    <noscript>
    <xml>
    <o:OfficeDocumentSettings>
    <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
    </xml>
    </noscript>
    <![endif]-->
    <style>
        body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
        img { border: 0; line-height: 100%; outline: none; text-decoration: none; }
        table { border-collapse: collapse !important; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f1f5f9; padding: 40px 0; }
        .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
        .header { padding: 40px 0 32px; text-align: center; background-color: #ffffff; }
        .logo { width: 70px; height: auto; display: block; margin: 0 auto; }
        .content { padding: 40px; color: #334155; line-height: 1.7; font-size: 16px; }
        .footer { padding: 32px 40px; text-align: center; color: #94a3b8; font-size: 13px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; }
        .footer p { margin: 4px 0; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 16px; }
    </style>
</head>
<body>
    <div class="wrapper">
        <center>
            <div class="main">
                <div class="header">
                    <img src="${APP_URL}/LogoIKAHATANewRBG.svg" alt="${WEBSITE_NAME}" class="logo">
                </div>
                <div class="content">
                    ${formattedMessage}
                </div>
                <div class="footer">
                    <p style="color: #64748b; font-weight: 600; margin-bottom: 8px;">${WEBSITE_NAME}</p>
                    <p>Alumni Mentorship Project SMA Hang Tuah 1 Jakarta</p>
                    <p style="margin-top: 16px; font-size: 11px;">&copy; ${new Date().getFullYear()} All rights reserved.</p>
                </div>
            </div>
        </center>
    </div>
</body>
</html>
    `;

    console.log(`[EmailService] Attempting to send email to ${recipientList.length} recipients. Provider order: Gmail -> Resend`);

    try {
        // 1. Check daily limit (100 emails)
        let dailyCount = 0;
        try {
            const { count, error: countError } = await supabase
                .from('email_logs')
                .select('*', { count: 'exact', head: true })
                .gte('sent_at', `${today}T00:00:00Z`)
                .eq('status', 'success');

            if (countError) {
                console.error('[EmailService] Database error checking limit (likely table missing):', countError.message);
                // We proceed if table is missing, but log it
            } else {
                dailyCount = count || 0;
            }
        } catch (dbErr: any) {
            console.error('[EmailService] Unexpected DB error during limit check:', dbErr.message);
        }

        if (dailyCount >= 100) {
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
                    html: htmlTemplate
                });

                sent = true;
                console.log('[EmailService] Gmail SMTP success');
            } catch (err: any) {
                console.error('[EmailService] Gmail SMTP failed:', err.message);
                lastError = `Gmail Error: ${err.message}`;
            }
        } else {
            console.warn('[EmailService] Gmail credentials missing, skipping...');
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
                        text: message,
                        html: htmlTemplate
                    })
                });

                if (response.ok) {
                    sent = true;
                    console.log('[EmailService] Resend fallback success');
                } else {
                    const data = await response.json();
                    lastError = `Resend Error: ${data.message || response.statusText}`;
                    console.error('[EmailService] Resend API error:', lastError);
                }
            } catch (err: any) {
                console.error('[EmailService] Resend fallback failed:', err.message);
                lastError = `Resend Error: ${err.message}`;
            }
        } else if (!sent && !RESEND_API_KEY) {
            console.warn('[EmailService] Resend API Key missing, no more fallback options.');
        }

        // 4. Log the result (don't let logging failure block the success return)
        try {
            await supabase.from('email_logs').insert({
                recipient: recipientList.join(', ').substring(0, 255), // Truncate if too long
                subject: subject.substring(0, 255),
                provider: provider,
                status: sent ? 'success' : 'error',
                error_message: sent ? null : (lastError || 'No provider configured').substring(0, 500)
            });
        } catch (logErr: any) {
            console.error('[EmailService] Failed to log email to database:', logErr.message);
        }

        if (!sent) {
            throw new Error(lastError || 'No email provider configured or all providers failed. Check your environment variables.');
        }

        return { success: true, provider };

    } catch (error: any) {
        console.error('[EmailService] Final error:', error.message);
        throw error;
    }
}
