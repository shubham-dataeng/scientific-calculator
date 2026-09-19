/**
 * Scientific Calculator - Dynamic Reactive Calculation Workspace
 * Multi-line notebook with line references (L1, L2...), variable propagation, and live updates.
 */

import { Evaluator } from '../engine/evaluator.js';

export class WorkspaceManager {
    constructor() {
        this.evaluator = new Evaluator();
        this.lines = this.loadWorkspace() || [
            { id: 1, expr: 'radius = 7', result: '7', error: null },
            { id: 2, expr: 'area = pi * radius^2', result: '153.938', error: null },
            { id: 3, expr: 'circumference = 2 * pi * radius', result: '43.9823', error: null },
            { id: 4, expr: 'L2 / L3', result: '3.5', error: null }
        ];
        this.recalculateAll();
    }

    loadWorkspace() {
        try {
            const data = localStorage.getItem('calc_workspace');
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    }

    saveWorkspace() {
        try {
            localStorage.setItem('calc_workspace', JSON.stringify(this.lines));
        } catch {}
    }

    addLine(afterId = null) {
        const newId = this.lines.length > 0 ? Math.max(...this.lines.map(l => l.id)) + 1 : 1;
        const newLine = { id: newId, expr: '', result: '', error: null };

        if (afterId !== null) {
            const idx = this.lines.findIndex(l => l.id === afterId);
            if (idx !== -1) {
                this.lines.splice(idx + 1, 0, newLine);
            } else {
                this.lines.push(newLine);
            }
        } else {
            this.lines.push(newLine);
        }

        this.saveWorkspace();
        return newLine;
    }

    deleteLine(id) {
        if (this.lines.length <= 1) {
            this.lines[0].expr = '';
            this.lines[0].result = '';
            this.lines[0].error = null;
        } else {
            this.lines = this.lines.filter(l => l.id !== id);
        }
        this.recalculateAll();
        this.saveWorkspace();
    }

    updateLine(id, newExpr) {
        const line = this.lines.find(l => l.id === id);
        if (line) {
            line.expr = newExpr;
            this.recalculateAll();
            this.saveWorkspace();
        }
    }

    clearWorkspace() {
        this.lines = [
            { id: 1, expr: '', result: '', error: null }
        ];
        this.recalculateAll();
        this.saveWorkspace();
    }

    /**
     * Sequentially recalculate all lines, propagating variables and L1..Ln references
     */
    recalculateAll() {
        this.evaluator = new Evaluator(); // fresh scope with standard constants
        const lineResults = {};

        this.lines.forEach((line, index) => {
            const lineRef = `L${index + 1}`;
            if (!line.expr || !line.expr.trim()) {
                line.result = '';
                line.error = null;
                return;
            }

            try {
                // Pre-process references like L1, L2 into their numeric values
                let resolvedExpr = line.expr.replace(/\bL(\d+)\b/gi, (match, p1) => {
                    const refIdx = parseInt(p1, 10);
                    if (refIdx >= index + 1) {
                        throw new Error(`Forward reference: cannot reference ${match} on line ${index + 1}`);
                    }
                    const refVal = lineResults[`L${refIdx}`];
                    if (refVal === undefined) {
                        throw new Error(`Referenced line ${match} has no numeric result`);
                    }
                    return `(${refVal})`;
                });

                const res = this.evaluator.evaluate(resolvedExpr);
                line.result = res.decimal;
                line.error = null;
                lineResults[lineRef] = res.value;
                this.evaluator.setVariable(lineRef, res.value);
            } catch (err) {
                line.result = '';
                line.error = err.message;
            }
        });
    }

    exportMarkdown() {
        let md = '# Mathematical Workspace\n\n| Line | Expression | Result |\n| :--- | :--- | :--- |\n';
        this.lines.forEach((l, i) => {
            md += `| L${i + 1} | \`${l.expr}\` | **${l.result || (l.error ? 'Error: ' + l.error : '')}** |\n`;
        });
        return md;
    }
}
