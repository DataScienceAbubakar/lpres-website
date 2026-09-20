import React from 'react';
import toast from 'react-hot-toast';

const QUEUE_KEY = 'lpres_offline_sync_queue';

/**
 * Retrieve the current pending offline queue
 */
export function getOfflineQueue() {
    try {
        const raw = localStorage.getItem(QUEUE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (err) {
        console.error('Error reading offline sync queue:', err);
        return [];
    }
}

/**
 * Save the updated queue
 */
function saveOfflineQueue(queue) {
    try {
        localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (err) {
        console.error('Error saving offline sync queue:', err);
    }
}

/**
 * Add a failed / offline transaction to the queue
 */
export function enqueueOfflineRequest(requestObj) {
    const queue = getOfflineQueue();
    const newItem = {
        id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        timestamp: new Date().toISOString(),
        ...requestObj
    };

    queue.push(newItem);
    saveOfflineQueue(queue);

    // Inform user visually
    toast((t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.2rem' }}>🌐</span>
            <div>
                <strong style={{ display: 'block', fontSize: '0.85rem' }}>Saved Offline</strong>
                <span style={{ fontSize: '0.78rem', color: '#475569' }}>
                    Your {requestObj.label || 'request'} is queued and will sync automatically when network returns.
                </span>
            </div>
        </div>
    ), { duration: 5000 });

    // Register SW background sync if supported
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then((reg) => {
            reg.sync.register('lpres-offline-sync').catch((err) => console.log('Sync reg error:', err));
        });
    }

    return newItem;
}

/**
 * Process all items in the offline queue upon reconnection
 */
export async function processOfflineQueue(apiClient) {
    const queue = getOfflineQueue();
    if (!queue || queue.length === 0) return;

    console.log(`[Offline Sync] Processing ${queue.length} queued requests...`);
    const toastId = toast.loading(`Synchronizing ${queue.length} offline trade requests...`);

    const remainingQueue = [];
    let successCount = 0;

    for (const item of queue) {
        try {
            if (item.method?.toLowerCase() === 'post') {
                await apiClient.post(item.endpoint, item.data);
            } else if (item.method?.toLowerCase() === 'put') {
                await apiClient.put(item.endpoint, item.data);
            } else if (item.method?.toLowerCase() === 'delete') {
                await apiClient.delete(item.endpoint);
            }
            successCount++;
        } catch (err) {
            console.error(`[Offline Sync] Failed to sync item ${item.id}:`, err);
            if (!navigator.onLine || err.code === 'ERR_NETWORK') {
                remainingQueue.push(item);
            }
        }
    }

    saveOfflineQueue(remainingQueue);

    if (successCount > 0) {
        toast.success(`⚡ Network Restored! Successfully synchronized ${successCount} offline request(s).`, {
            id: toastId,
            duration: 5000
        });
    } else {
        toast.dismiss(toastId);
    }
}

/**
 * Initialize automated online/offline listeners
 */
export function initOfflineSync(apiClient) {
    window.addEventListener('online', () => {
        console.log('[Offline Sync] Device online detected. Synchronizing queue...');
        processOfflineQueue(apiClient);
    });

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data?.type === 'TRIGGER_OFFLINE_SYNC') {
                processOfflineQueue(apiClient);
            }
        });
    }

    if (navigator.onLine) {
        processOfflineQueue(apiClient);
    }
}
