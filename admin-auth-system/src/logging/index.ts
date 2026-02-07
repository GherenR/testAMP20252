// Simple logging utility for admin actions and security events
export function logEvent(event: string, details?: any) {
    const timestamp = new Date().toISOString();
    // In production, send to external logging provider or database
    console.log(`[${timestamp}] ${event}`, details || '');
}

// Example usage: logEvent('User login', { userId: '123', ip: '...' })
