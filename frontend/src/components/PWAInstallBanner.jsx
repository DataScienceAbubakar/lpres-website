import React, { useState, useEffect } from 'react';
import { Download, WifiOff, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import './PWAInstallBanner.css';

export default function PWAInstallBanner() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallBanner, setShowInstallBanner] = useState(false);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // 1. Detect Offline / Online events
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // 2. Detect beforeinstallprompt
        const handleBeforeInstall = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Check if user already dismissed install banner in this session
            const dismissed = sessionStorage.getItem('pwa_banner_dismissed');
            if (!dismissed) {
                setShowInstallBanner(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);

        // 3. Detect appinstalled
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setShowInstallBanner(false);
            setDeferredPrompt(null);
        });

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('[PWA] User choice outcome:', outcome);
        setDeferredPrompt(null);
        setShowInstallBanner(false);
    };

    const handleDismiss = () => {
        setShowInstallBanner(false);
        sessionStorage.setItem('pwa_banner_dismissed', 'true');
    };

    return (
        <>
            {/* Top Floating Offline Status Strip */}
            {isOffline && (
                <div className="pwa-offline-strip">
                    <div className="pwa-offline-content">
                        <WifiOff size={16} className="pwa-offline-icon" />
                        <span>
                            <strong>You are currently offline.</strong> You can still browse cached marketplace listings! Trade requests & bids will auto-sync when network returns.
                        </span>
                    </div>
                </div>
            )}

            {/* Bottom Floating PWA Installation Card */}
            {showInstallBanner && !isInstalled && (
                <div className="pwa-install-banner">
                    <div className="pwa-install-header">
                        <div className="pwa-install-icon-wrap">
                            <img src="/lpres-logo.png" alt="L-PRES Logo" className="pwa-app-logo" />
                        </div>
                        <div className="pwa-install-text">
                            <h4>Install Kwara L-PRES App</h4>
                            <p>Get faster access, offline trade requests, and instant network sync on your mobile home screen.</p>
                        </div>
                        <button onClick={handleDismiss} className="pwa-dismiss-btn" title="Dismiss">
                            <X size={16} />
                        </button>
                    </div>
                    <div className="pwa-install-actions">
                        <button onClick={handleInstallClick} className="pwa-btn-primary">
                            <Download size={15} /> Install App
                        </button>
                        <button onClick={handleDismiss} className="pwa-btn-secondary">
                            Not Now
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
