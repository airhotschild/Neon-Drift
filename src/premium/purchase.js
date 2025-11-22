// Premium purchase module
// This wraps the Remix.gg SDK (currently stubbed)
import { openPurchaseModal as remixOpenPurchaseModal } from '../remix_sdk.js';

export async function openPurchaseModal(options) {
    try {
        console.log('Opening purchase modal with options:', options);
        const result = await remixOpenPurchaseModal(options);
        return result;
    } catch (error) {
        console.error('Error in purchase flow:', error);
        throw error;
    }
}
