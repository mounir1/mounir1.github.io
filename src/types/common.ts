/**
 * Common shared types and interfaces
 * Used to eliminate duplication across the codebase
 */

// User types
export interface UserPreferences {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    notifications: {
        email: boolean;
        push: boolean;
        desktop: boolean;
    };
    dashboard: {
        layout: 'grid' | 'list';
        density: 'compact' | 'comfortable' | 'spacious';
    };
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'admin' | 'user';
    permissions: string[];
    preferences: UserPreferences;
}

// API types
export interface ApiError {
    message: string;
    status: number;
    code?: string;
    details?: Record<string, any>;
}

export interface ApiResponse<T = any> {
    data?: T;
    error?: string;
    message?: string;
    status: number;
    meta?: {
        total?: number;
        page?: number;
        pageSize?: number;
        hasNext?: boolean;
        hasPrev?: boolean;
    };
}
