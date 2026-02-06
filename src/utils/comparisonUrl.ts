import { Mentor } from '../types';
import { MOCK_MENTORS } from '../constants';

/**
 * Comparison URL Utility
 * Menghandle encoding/decoding mentor comparison state ke URL params
 * Contoh: ?compare=siti-nurassifa,zhalisha-athaya,gheren-ramandra,chiesa-abby
 */

/**
 * Generate mentor identifier dari nama untuk URL
 * Contoh: "Siti Kirani Nurassifa Aminah" -> "siti-kirani-nurassifa-aminah"
 */
function getMentorSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');
}

/**
 * Encode comparison mentors ke URL query param
 * @param mentors Array of mentors yang dibandingkan
 * @returns URL query string (tanpa ?)
 */
export function encodeComparisonUrl(mentors: Mentor[]): string {
    if (mentors.length === 0) return '';

    const slugs = mentors.map(m => getMentorSlug(m.name)).join(',');
    return `?compare=${slugs}`;
}

/**
 * Decode comparison mentors dari URL query param
 * @param params URLSearchParams dari current URL
 * @returns Array of mentor objects yang valid
 */
export function decodeComparisonUrl(params: URLSearchParams): Mentor[] {
    const compareParam = params.get('compare');
    if (!compareParam) return [];

    const slugs = compareParam.split(',').filter(s => s.length > 0);
    const mentors: Mentor[] = [];

    for (const slug of slugs.slice(0, 4)) { // Max 4 alumni
        const mentor = MOCK_MENTORS.find(m => getMentorSlug(m.name) === slug);
        if (mentor && !mentors.some(m => m.name === mentor.name)) {
            mentors.push(mentor);
        }
    }

    return mentors;
}

/**
 * Get full comparison URL untuk di-share
 * @param mentors Array of mentors yang dibandingkan
 * @returns Full URL dengan query params
 */
export function getComparisonShareUrl(mentors: Mentor[]): string {
    const baseUrl = window.location.origin + window.location.pathname;
    const queryString = encodeComparisonUrl(mentors);
    return baseUrl + queryString;
}

/**
 * Generate WhatsApp message dengan mention nama mentors yang dibandingkan
 * @param mentors Array of mentors yang dibandingkan
 * @returns WhatsApp message text
 */
export function generateComparisonWhatsAppMessage(mentors: Mentor[]): string {
    if (mentors.length === 0) return '';

    const mentorNames = mentors.map((m, i) => `${i + 1}. ${m.name}`).join('\n');
    const shareUrl = getComparisonShareUrl(mentors);

    return `📊 *Perbandingan Mentor Alumni* 🎓\n\nAku lagi membandingkan ${mentors.length} alumni Hang Tuah:\n\n${mentorNames}\n\n✨ Lihat perbandingan lengkap di link ini:\n${shareUrl}`;
}

/**
 * Generate WhatsApp share link
 * @param mentors Array of mentors yang dibandingkan
 * @returns WhatsApp share URL
 */
export function getComparisonWhatsAppLink(mentors: Mentor[]): string {
    const message = generateComparisonWhatsAppMessage(mentors);
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/?text=${encodedMessage}`;
}
