/**
 * Scientific Calculator - History 2.0 & Variable/Memory Bank
 * Features: search, pinning, categorization, export, and visual variable bank.
 */

export class HistoryManager {
    constructor(storageKey = 'calc_history_v2') {
        this.storageKey = storageKey;
        this.items = this.loadHistory();
        this.pinnedIds = new Set(JSON.parse(localStorage.getItem('calc_pinned') || '[]'));
        this.filterCategory = 'all';
        this.searchQuery = '';
    }

    loadHistory() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        } catch {
            return [];
        }
    }

    saveHistory() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.items.slice(0, 100)));
            localStorage.setItem('calc_pinned', JSON.stringify([...this.pinnedIds]));
        } catch (e) {
            console.warn('Failed to persist history:', e);
        }
    }

    add(record) {
        const item = {
            id: 'h_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            formula: record.formula,
            result: record.result,
            decimal: record.decimal || record.result,
            category: record.category || 'scientific',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            date: new Date().toLocaleDateString(),
            pinned: false
        };

        this.items.unshift(item);
        if (this.items.length > 100) {
            this.items = this.items.slice(0, 100);
        }
        this.saveHistory();
        return item;
    }

    togglePin(id) {
        if (this.pinnedIds.has(id)) {
            this.pinnedIds.delete(id);
        } else {
            this.pinnedIds.add(id);
        }
        this.saveHistory();
    }

    delete(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.pinnedIds.delete(id);
        this.saveHistory();
    }

    clear() {
        this.items = [];
        this.pinnedIds.clear();
        this.saveHistory();
    }

    getFilteredItems() {
        return this.items.filter(item => {
            const matchesCategory = this.filterCategory === 'all' || item.category === this.filterCategory;
            const matchesSearch = !this.searchQuery ||
                item.formula.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                String(item.result).toLowerCase().includes(this.searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        }).sort((a, b) => {
            const aPinned = this.pinnedIds.has(a.id) ? 1 : 0;
            const bPinned = this.pinnedIds.has(b.id) ? 1 : 0;
            return bPinned - aPinned; // Pinned items float to top
        });
    }

    exportAsText() {
        const lines = this.items.map(i => `[${i.date} ${i.timestamp}] ${i.formula} = ${i.result}`);
        return lines.join('\n');
    }

    exportAsJSON() {
        return JSON.stringify(this.items, null, 2);
    }
}
