import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    const cookie = req.cookies.get('next-auth.session-token');
    if (!cookie) {
        return NextResponse.redirect('/login');
    }
    // Add role check logic here if needed
    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard', '/users', '/stats'],
};
