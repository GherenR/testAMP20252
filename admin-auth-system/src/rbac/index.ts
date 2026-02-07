// RBAC utility for checking user roles
export function hasRole(user: any, role: string): boolean {
    return user && user.role === role;
}

// Example usage: hasRole(session.user, 'admin')
