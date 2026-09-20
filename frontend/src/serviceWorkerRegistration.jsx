import React from 'react';
import toast from 'react-hot-toast';

export function registerServiceWorker() {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
        window.addEventListener('load', () => {
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    console.log('[PWA] ServiceWorker registered with scope:', registration.scope);

                    registration.onupdatefound = () => {
                        const installingWorker = registration.installing;
                        if (installingWorker == null) return;

                        installingWorker.onstatechange = () => {
                            if (installingWorker.state === 'installed') {
                                if (navigator.serviceWorker.controller) {
                                    console.log('[PWA] New content is available; please refresh.');
                                    toast((t) => (
                                        <div>
                                            <strong>App Update Available</strong>
                                            <div style={{ fontSize: '0.8rem', marginTop: 4 }}>
                                                A new version of Kwara L-PRES is ready.
                                            </div>
                                            <button
                                                onClick={() => {
                                                    window.location.reload();
                                                }}
                                                style={{
                                                    marginTop: 8,
                                                    background: '#059669',
                                                    color: '#fff',
                                                    border: 'none',
                                                    padding: '4px 10px',
                                                    borderRadius: '4px',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Refresh Now
                                            </button>
                                        </div>
                                    ), { duration: 8000 });
                                } else {
                                    console.log('[PWA] Content is cached for offline use.');
                                }
                            }
                        };
                    };
                })
                .catch((error) => {
                    console.error('[PWA] Service Worker registration failed:', error);
                });
        });
    } else if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker
                .register('/sw.js')
                .then((reg) => console.log('[PWA Dev] SW registered:', reg.scope))
                .catch((err) => console.log('[PWA Dev] SW registration error:', err));
        });
    }
}
