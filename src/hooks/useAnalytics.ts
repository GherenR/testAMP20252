import { useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { getOrCreateSessionId, getDeviceType } from '../utils/analytics';

// Ganti baris 5 & 6 menjadi:
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

let sessionId = '';

/**
 * useAnalytics Hook
 * Tracks user behavior and sends to Supabase
 * 
 * Usage:
 * const { trackPageView, trackFeatureClick, trackMentorInteraction } = useAnalytics();
 */
export const useAnalytics = () => {
    const sessionIdRef = useRef<string>('');

    useEffect(() => {
        if (!sessionIdRef.current) {
            sessionIdRef.current = getOrCreateSessionId();
            sessionId = sessionIdRef.current;
        }
    }, []);

    /**
     * Track page/slide view
     * Call when user navigates to a new slide
     */
    const trackPageView = async (
        slideNumber: number,
        slideName: string,
        viewDurationSeconds: number = 0
    ) => {
        try {
            await supabase.from('page_views').insert({
                session_id: sessionIdRef.current,
                slide_number: slideNumber,
                slide_name: slideName,
                device_type: getDeviceType(),
                view_duration_seconds: viewDurationSeconds,
                user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
            });
        } catch (err) {
            console.error('[Analytics] Page view error:', err);
        }
    };

    /**
     * Track feature/button clicks
     * Call when user clicks buttons (Mulai Simulasi, Cari Manual, etc)
     */
    const trackFeatureClick = async (
        featureName: string,
        featureType: string,
        slideNumber?: number
    ) => {
        try {
            await supabase.from('feature_clicks').insert({
                session_id: sessionIdRef.current,
                feature_name: featureName,
                feature_type: featureType,
                slide_number: slideNumber,
                device_type: getDeviceType(),
            });
        } catch (err) {
            console.error('[Analytics] Feature click error:', err);
        }
    };

    /**
     * Track mentor interactions
     * Call when user clicks on mentor (detail, chat, compare, instagram)
     */
    const trackMentorInteraction = async (
        mentorName: string,
        actionType: string,
        sourceFeature: string,
        sourceSlide?: number
    ) => {
        try {
            await supabase.from('mentor_interactions').insert({
                session_id: sessionIdRef.current,
                mentor_name: mentorName,
                action_type: actionType,
                source_feature: sourceFeature,
                source_slide: sourceSlide,
                device_type: getDeviceType(),
            });
        } catch (err) {
            console.error('[Analytics] Mentor interaction error:', err);
        }
    };

    return {
        trackPageView,
        trackFeatureClick,
        trackMentorInteraction,
        sessionId: sessionIdRef.current,
    };
};
