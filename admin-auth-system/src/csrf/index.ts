import { NextRequest, NextResponse } from 'next/server';

// Example CSRF protection middleware
export function csrfProtection(req: NextRequest) {
    const csrfToken = req.headers.get('x-csrf-token');
    if (!csrfToken || csrfToken !== process.env.CSRF_SECRET) {
        return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }
    return NextResponse.next();
}
