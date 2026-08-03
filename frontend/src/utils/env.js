/**
 * Detects whether the current frontend app is running as the standalone Marketplace service.
 * Returns true if VITE_APP_MODE === 'marketplace', VITE_IS_MARKETPLACE === 'true',
 * or if running on a marketplace hostname.
 */
export const isMarketplaceMode = () => {
    if (import.meta.env.VITE_APP_MODE === 'marketplace' || import.meta.env.VITE_IS_MARKETPLACE === 'true') {
        return true;
    }
    if (typeof window !== 'undefined' && window.location.hostname.includes('marketplace')) {
        return true;
    }
    return false;
};

export const MAIN_WEBSITE_URL = import.meta.env.VITE_MAIN_WEBSITE_URL || 'https://lpres-website.onrender.com';
export const MARKETPLACE_URL = import.meta.env.VITE_MARKETPLACE_URL || 'https://lpres-marketplace.onrender.com';
export const GDSS_PORTAL_URL = 'https://main.dgnvy1x73yeps.amplifyapp.com/';
