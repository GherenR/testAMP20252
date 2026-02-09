/**
 * Security Utilities
 * Protections against common web vulnerabilities:
 * - XSS (Cross-Site Scripting)
 * - CSRF (Cross-Site Request Forgery)
 * - Injection Attacks
 * - Data Exposure
 */

/**
 * Sanitize user input to prevent XSS attacks
 * Removes/escapes potentially malicious HTML/JavaScript
 */
export const sanitizeInput = (input: string): string => {
    if (!input || typeof input !== 'string') {
        return '';
    }

    // Create a temporary div to use browser's HTML parser
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
};

/**
 * Validate and sanitize email addresses
 * Prevents email injection attacks and invalid formatting
 */
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sanitized = sanitizeInput(email);
    return emailRegex.test(sanitized) && sanitized === email;
};

/**
 * Sanitize URL to prevent javascript: and data: protocols
 * Ensures safe external links
 */
export const sanitizeUrl = (url: string): string | null => {
    try {
        const urlObj = new URL(url);
        // Only allow http and https protocols
        if (!['http:', 'https:', 'mailto:', 'tel:'].includes(urlObj.protocol)) {
            return null;
        }
        return urlObj.toString();
    } catch {
        return null;
    }
};

/**
 * Remove sensitive data from logs before sending to analytics
 * Prevents accidental data exposure
 */
export const stripSensitiveData = (obj: Record<string, any>): Record<string, any> => {
    const sensitiveKeys = [
        'password',
        'token',
        'secret',
        'key',
        'apiKey',
        'Authorization',
        'auth',
        'ssn',
        'credit',
    ];

    const sanitized = { ...obj };
    sensitiveKeys.forEach((key) => {
        Object.keys(sanitized).forEach((k) => {
            if (k.toLowerCase().includes(key.toLowerCase())) {
                sanitized[k] = '[REDACTED]';
            }
        });
    });
    return sanitized;
};

/**
 * Validate input against expected type and length
 * Prevents buffer overflow and injection attacks
 */
export const validateInput = (
    input: string,
    maxLength: number = 1000,
    pattern?: RegExp
): boolean => {
    if (!input || typeof input !== 'string') {
        return false;
    }

    if (input.length > maxLength) {
        return false;
    }

    if (pattern && !pattern.test(input)) {
        return false;
    }

    return true;
};

/**
 * Secure localStorage operations
 * Prevents localStorage-based XSS and data exposure
 */
export const secureStorage = {
    set: (key: string, value: any): void => {
        try {
            // Sanitize key to prevent injection
            const sanitizedKey = sanitizeInput(key);
            const data = JSON.stringify(value);
            localStorage.setItem(sanitizedKey, data);
        } catch (error) {
            console.error('[Security] Failed to save to localStorage:', error);
        }
    },

    get: (key: string): any => {
        try {
            const sanitizedKey = sanitizeInput(key);
            const data = localStorage.getItem(sanitizedKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('[Security] Failed to read from localStorage:', error);
            return null;
        }
    },

    remove: (key: string): void => {
        try {
            const sanitizedKey = sanitizeInput(key);
            localStorage.removeItem(sanitizedKey);
        } catch (error) {
            console.error('[Security] Failed to remove from localStorage:', error);
        }
    },

    clear: (): void => {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('[Security] Failed to clear localStorage:', error);
        }
    },
};

/**
 * CORS-safe fetch with security headers
 */
export const secureFetch = async (
    url: string,
    options?: RequestInit
): Promise<Response> => {
    // Validate and sanitize URL
    const sanitizedUrl = sanitizeUrl(url);
    if (!sanitizedUrl) {
        throw new Error('[Security] Invalid URL');
    }

    const defaultOptions: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(options?.headers || {}),
        },
        credentials: 'same-origin',
        ...options,
    };

    try {
        const response = await fetch(sanitizedUrl, defaultOptions);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
    } catch (error) {
        console.error('[Security] Fetch error:', stripSensitiveData({ url, error }));
        throw error;
    }
};

/**
 * Log security events safely (without exposing sensitive data)
 */
export const logSecurityEvent = (
    event: string,
    details?: Record<string, any>
): void => {
    // Log safely without sensitive data
    console.warn(
        `[SECURITY] ${event}`,
        details ? stripSensitiveData(details) : ''
    );
};

/**
 * Rate limiting helper for client-side operations
 * Prevents brute force and spam attacks
 */
export class RateLimiter {
    private attempts: Map<string, number[]> = new Map();
    private readonly maxAttempts: number;
    private readonly timeWindow: number; // in milliseconds

    constructor(maxAttempts: number = 5, timeWindowMs: number = 60000) {
        this.maxAttempts = maxAttempts;
        this.timeWindow = timeWindowMs;
    }

    isAllowed(key: string): boolean {
        const now = Date.now();
        const attempts = this.attempts.get(key) || [];

        // Remove old attempts outside the time window
        const recentAttempts = attempts.filter((time) => now - time < this.timeWindow);

        if (recentAttempts.length >= this.maxAttempts) {
            logSecurityEvent('Rate limit exceeded', { key });
            return false;
        }

        recentAttempts.push(now);
        this.attempts.set(key, recentAttempts);
        return true;
    }

    reset(key: string): void {
        this.attempts.delete(key);
    }
}

export default {
    sanitizeInput,
    validateEmail,
    sanitizeUrl,
    stripSensitiveData,
    validateInput,
    secureStorage,
    secureFetch,
    logSecurityEvent,
    RateLimiter,
};
