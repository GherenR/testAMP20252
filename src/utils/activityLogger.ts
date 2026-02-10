import { supabase } from '../supabaseClient';

export type ActivityAction =
    | 'login'
    | 'logout'
    | 'create'
    | 'update'
    | 'delete'
    | 'import'
    | 'export'
    | 'bulk_update'
    | 'bulk_delete'
    | 'view';

export type EntityType =
    | 'mentor'
    | 'user'
    | 'admin'
    | 'session'
    | 'data';

interface LogActivityParams {
    action: ActivityAction;
    entityType?: EntityType;
    entityId?: string;
    details?: string;
}

/**
 * Log admin activity to the database
 */
export async function logActivity({ action, entityType, entityId, details }: LogActivityParams): Promise<void> {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user?.email) {
            console.warn('Cannot log activity: no authenticated user');
            return;
        }

        await supabase.from('admin_activity_log').insert({
            user_email: user.email,
            action,
            entity_type: entityType || null,
            entity_id: entityId || null,
            details: details || null
        });
    } catch (error) {
        // Don't throw - logging should be silent
        console.error('Failed to log activity:', error);
    }
}

/**
 * Log mentor creation
 */
export const logMentorCreate = (mentorName: string, mentorId?: string) =>
    logActivity({
        action: 'create',
        entityType: 'mentor',
        entityId: mentorId,
        details: `Created mentor: ${mentorName}`
    });

/**
 * Log mentor update
 */
export const logMentorUpdate = (mentorName: string, mentorId?: string, fields?: string[]) =>
    logActivity({
        action: 'update',
        entityType: 'mentor',
        entityId: mentorId,
        details: fields?.length
            ? `Updated mentor ${mentorName}: ${fields.join(', ')}`
            : `Updated mentor: ${mentorName}`
    });

/**
 * Log mentor deletion
 */
export const logMentorDelete = (mentorName: string, mentorId?: string) =>
    logActivity({
        action: 'delete',
        entityType: 'mentor',
        entityId: mentorId,
        details: `Deleted mentor: ${mentorName}`
    });

/**
 * Log bulk mentor operations
 */
export const logMentorBulkUpdate = (count: number, fields: string[]) =>
    logActivity({
        action: 'bulk_update',
        entityType: 'mentor',
        details: `Bulk updated ${count} mentors: ${fields.join(', ')}`
    });

export const logMentorBulkDelete = (count: number, names?: string[]) =>
    logActivity({
        action: 'bulk_delete',
        entityType: 'mentor',
        details: names?.length
            ? `Bulk deleted ${count} mentors: ${names.slice(0, 5).join(', ')}${names.length > 5 ? '...' : ''}`
            : `Bulk deleted ${count} mentors`
    });

/**
 * Log data import
 */
export const logDataImport = (count: number, source?: string) =>
    logActivity({
        action: 'import',
        entityType: 'data',
        details: source
            ? `Imported ${count} records from ${source}`
            : `Imported ${count} records`
    });

/**
 * Log data export
 */
export const logDataExport = (count: number, format: string) =>
    logActivity({
        action: 'export',
        entityType: 'data',
        details: `Exported ${count} records as ${format}`
    });

/**
 * Log user/admin management
 */
export const logUserCreate = (email: string, role: string) =>
    logActivity({
        action: 'create',
        entityType: role === 'admin' ? 'admin' : 'user',
        entityId: email,
        details: `Created ${role}: ${email}`
    });

export const logUserUpdate = (email: string, changes: string) =>
    logActivity({
        action: 'update',
        entityType: 'user',
        entityId: email,
        details: `Updated user ${email}: ${changes}`
    });

export const logUserDelete = (email: string) =>
    logActivity({
        action: 'delete',
        entityType: 'user',
        entityId: email,
        details: `Deleted user: ${email}`
    });

/**
 * Log admin login
 */
export const logAdminLogin = () =>
    logActivity({
        action: 'login',
        entityType: 'session',
        details: 'Admin logged in'
    });

export const logAdminLogout = () =>
    logActivity({
        action: 'logout',
        entityType: 'session',
        details: 'Admin logged out'
    });
