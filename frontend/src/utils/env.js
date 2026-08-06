/**
 * Detects whether the current frontend app is running as the standalone Marketplace service.
 * Returns true if VITE_APP_MODE === 'marketplace', VITE_IS_MARKETPLACE === 'true',
 * or if running on a marketplace hostname.
 */
export const isMarketplaceMode = () => {
    if (import.meta.env.VITE_APP_MODE === 'marketplace' || import.meta.env.VITE_IS_MARKETPLACE === 'true') {
        return true;
    }
    if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        if (host.includes('marketplace') || host.includes('market.') || host.startsWith('market.')) {
            return true;
        }
    }
    return false;
};

export const MAIN_WEBSITE_URL = import.meta.env.VITE_MAIN_WEBSITE_URL || 'https://lpres.kw.gov.ng';
export const MARKETPLACE_URL = import.meta.env.VITE_MARKETPLACE_URL || 'https://market.lpres.kw.gov.ng';
export const GDSS_PORTAL_URL = 'https://gdss.lpres.kw.gov.ng/login';

export const DEFAULT_API_URL = (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim())
    ? import.meta.env.VITE_API_URL.trim().replace(/\/+$/, '')
    : (typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:8000'
        : 'https://lpress-website.onrender.com');

