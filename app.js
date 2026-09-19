/**
 * Scientific Calculator - Application Entry Point
 * Boots the UI Controller and initializes PWA service worker.
 */

import { UIController } from './modules/ui.js';

document.addEventListener('DOMContentLoaded', () => {
    window.calcApp = new UIController();
    console.log('✅ Antigravity Scientific Computing Studio initialized.');
});
