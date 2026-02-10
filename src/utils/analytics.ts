/**
 * Analytics Utilities
 * Helper functions for analytics tracking
 */

import { secureStorage } from './security';
// Session management
export function getOrCreateSessionId(): string {
    const key = 'analytics_session_id';
    let sessionId = secureStorage.get(key);

    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        secureStorage.set(key, sessionId);
    }

    return sessionId;
}

// Get device type
export function getDeviceType(): 'mobile' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop';
    return window.innerWidth < 768 ? 'mobile' : 'desktop';
}

// Get time spent on page (optional)
export function getViewDuration(startTime: number): number {
    return Math.round((Date.now() - startTime) / 1000); // in seconds
}

// Slide name mapping
export const SLIDE_NAMES: Record<number, string> = {
    0: 'Home',
    1: 'Smart Match',
    2: 'Direktori',
    3: 'Etika',
    4: 'About',
    5: 'SNBT Area'
};

// Feature name mapping (constants for consistency)
export const FEATURE_NAMES = {
    MULAI_SIMULASI: 'Mulai Simulasi',
    CARI_MANUAL: 'Cari Manual',
    FILTER_KATEGORI: 'Filter Kategori',
    FILTER_PATH: 'Filter Path',
    SEARCH_MENTOR: 'Search Mentor',
    CONTACT_CHAT: 'Contact Chat',
    VIEW_DETAIL: 'View Detail',
    ADD_COMPARE: 'Add Comparison',
    VISIT_INSTAGRAM: 'Visit Instagram',
    SHARE_WHATSAPP: 'Share WhatsApp'
};

// Feature types
export const FEATURE_TYPES = {
    BUTTON: 'button',
    FILTER: 'filter',
    SEARCH: 'search',
    ACTION: 'action'
};
