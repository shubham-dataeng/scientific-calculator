/**
 * Scientific Calculator - Interactive 2D Graphing Studio
 * Multi-function plotting on HTML5 Canvas with pan, zoom, grid, and coordinate readout.
 */

import { Evaluator } from '../engine/evaluator.js';

export class Grapher {
    constructor(canvas, container) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.container = container;
        this.evaluator = new Evaluator({ angleMode: 'rad' });

        this.functions = [
            { id: 1, expr: 'sin(x)', color: '#38bdf8', active: true },
            { id: 2, expr: 'x^2 - 4', color: '#f59e0b', active: false }
        ];

        // Coordinate space
        this.xMin = -10;
        this.xMax = 10;
        this.yMin = -10;
        this.yMax = 10;

        // Interaction state
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.mousePos = null;

        this.initCanvasSize();
        this.attachListeners();
        this.render();
    }

    initCanvasSize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const width = Math.max(300, rect.width || 600);
        const height = Math.max(250, rect.height || 400);

        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';

        this.ctx.scale(dpr, dpr);
        this.width = width;
        this.height = height;
    }

    attachListeners() {
        window.addEventListener('resize', () => {
            this.initCanvasSize();
            this.render();
        });

        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.dragStart = { x: e.clientX, y: e.clientY };
        });

        window.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePos = {
                cx: e.clientX - rect.left,
                cy: e.clientY - rect.top,
                mx: this.toMathX(e.clientX - rect.left),
                my: this.toMathY(e.clientY - rect.top)
            };

            if (this.isDragging) {
                const dx = e.clientX - this.dragStart.x;
                const dy = e.clientY - this.dragStart.y;
                this.dragStart = { x: e.clientX, y: e.clientY };

                const mathDx = (dx / this.width) * (this.xMax - this.xMin);
                const mathDy = (dy / this.height) * (this.yMax - this.yMin);

                this.xMin -= mathDx;
                this.xMax -= mathDx;
                this.yMin += mathDy;
                this.yMax += mathDy;

                this.render();
            } else {
                this.render(); // Redraw trace crosshair
            }
        });

        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const factor = e.deltaY < 0 ? 0.85 : 1.18;
            this.zoom(factor, this.mousePos ? this.mousePos.mx : 0, this.mousePos ? this.mousePos.my : 0);
        }, { passive: false });

        // Touch support
        let lastTouch = null;
        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                this.isDragging = true;
                lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
        });
        this.canvas.addEventListener('touchmove', (e) => {
            if (this.isDragging && e.touches.length === 1 && lastTouch) {
                const dx = e.touches[0].clientX - lastTouch.x;
                const dy = e.touches[0].clientY - lastTouch.y;
                lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };

                const mathDx = (dx / this.width) * (this.xMax - this.xMin);
                const mathDy = (dy / this.height) * (this.yMax - this.yMin);

                this.xMin -= mathDx;
                this.xMax -= mathDx;
                this.yMin += mathDy;
                this.yMax += mathDy;

                this.render();
            }
        });
        window.addEventListener('touchend', () => {
            this.isDragging = false;
            lastTouch = null;
        });
    }

    zoom(factor, centerX = 0, centerY = 0) {
        const xSpan = (this.xMax - this.xMin) * factor;
        const ySpan = (this.yMax - this.yMin) * factor;

        const xRatio = (centerX - this.xMin) / (this.xMax - this.xMin);
        const yRatio = (centerY - this.yMin) / (this.yMax - this.yMin);

        this.xMin = centerX - xSpan * xRatio;
        this.xMax = centerX + xSpan * (1 - xRatio);
        this.yMin = centerY - ySpan * yRatio;
        this.yMax = centerY + ySpan * (1 - yRatio);

        this.render();
    }

    resetView() {
        this.xMin = -10;
        this.xMax = 10;
        this.yMin = -10;
        this.yMax = 10;
        this.render();
    }

    toScreenX(mx) {
        return ((mx - this.xMin) / (this.xMax - this.xMin)) * this.width;
    }

    toScreenY(my) {
        return ((this.yMax - my) / (this.yMax - this.yMin)) * this.height;
    }

    toMathX(cx) {
        return this.xMin + (cx / this.width) * (this.xMax - this.xMin);
    }

    toMathY(cy) {
        return this.yMax - (cy / this.height) * (this.yMax - this.yMin);
    }

    render() {
        const ctx = this.ctx;
        const width = this.width;
        const height = this.height;

        const isDark = document.body.classList.contains('dark-mode');

        // Background
        ctx.fillStyle = isDark ? '#0f172a' : '#f8fafc';
        ctx.fillRect(0, 0, width, height);

        // Grid & Axes
        this.drawGrid(ctx, width, height, isDark);
        this.drawAxes(ctx, width, height, isDark);

        // Plot curves
        this.functions.forEach(fn => {
            if (fn.active && fn.expr.trim()) {
                this.plotFunction(fn.expr, fn.color, ctx);
            }
        });

        // Trace crosshair
        if (this.mousePos && !this.isDragging) {
            this.drawTrace(ctx, isDark);
        }
    }

    drawGrid(ctx, width, height, isDark) {
        const xSpan = this.xMax - this.xMin;
        const rawStep = xSpan / 10;
        const power = Math.pow(10, Math.floor(Math.log10(rawStep)));
        const mult = rawStep / power;
        let step = power;
        if (mult > 5) step = power * 5;
        else if (mult > 2) step = power * 2;

        ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
        ctx.lineWidth = 1;

        // Vertical lines
        const firstX = Math.floor(this.xMin / step) * step;
        for (let x = firstX; x <= this.xMax; x += step) {
            const sx = this.toScreenX(x);
            ctx.beginPath();
            ctx.moveTo(sx, 0);
            ctx.lineTo(sx, height);
            ctx.stroke();
        }

        // Horizontal lines
        const firstY = Math.floor(this.yMin / step) * step;
        for (let y = firstY; y <= this.yMax; y += step) {
            const sy = this.toScreenY(y);
            ctx.beginPath();
            ctx.moveTo(0, sy);
            ctx.lineTo(width, sy);
            ctx.stroke();
        }
    }

    drawAxes(ctx, width, height, isDark) {
        const originX = this.toScreenX(0);
        const originY = this.toScreenY(0);

        ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)';
        ctx.lineWidth = 1.5;

        // X Axis
        if (originY >= 0 && originY <= height) {
            ctx.beginPath();
            ctx.moveTo(0, originY);
            ctx.lineTo(width, originY);
            ctx.stroke();
        }

        // Y Axis
        if (originX >= 0 && originX <= width) {
            ctx.beginPath();
            ctx.moveTo(originX, 0);
            ctx.lineTo(originX, height);
            ctx.stroke();
        }

        // Numbers along axes
        ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const xSpan = this.xMax - this.xMin;
        const rawStep = xSpan / 8;
        const power = Math.pow(10, Math.floor(Math.log10(rawStep)));
        const mult = rawStep / power;
        let step = power;
        if (mult > 5) step = power * 5;
        else if (mult > 2) step = power * 2;

        const firstX = Math.floor(this.xMin / step) * step;
        for (let x = firstX; x <= this.xMax; x += step) {
            if (Math.abs(x) < 1e-6) continue;
            const sx = this.toScreenX(x);
            const labelY = Math.min(Math.max(originY + 4, 4), height - 16);
            ctx.fillText(parseFloat(x.toFixed(2)), sx, labelY);
        }

        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        const firstY = Math.floor(this.yMin / step) * step;
        for (let y = firstY; y <= this.yMax; y += step) {
            if (Math.abs(y) < 1e-6) continue;
            const sy = this.toScreenY(y);
            const labelX = Math.min(Math.max(originX - 6, 30), width - 6);
            ctx.fillText(parseFloat(y.toFixed(2)), labelX, sy);
        }
    }

    plotFunction(expression, color, ctx) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.beginPath();

        let isDrawing = false;
        const stepPx = 1.5; // Sampling every 1.5 pixels across width

        for (let px = 0; px <= this.width; px += stepPx) {
            const mx = this.toMathX(px);
            this.evaluator.setVariable('x', mx);
            this.evaluator.setVariable('X', mx);

            try {
                const res = this.evaluator.evaluate(expression);
                const my = res.value;

                if (isFinite(my) && !isNaN(my) && Math.abs(my) < 1e6) {
                    const py = this.toScreenY(my);
                    if (!isDrawing) {
                        ctx.moveTo(px, py);
                        isDrawing = true;
                    } else {
                        // Check for vertical asymptotes
                        if (Math.abs(py - this.lastPy) > this.height * 1.5) {
                            ctx.moveTo(px, py);
                        } else {
                            ctx.lineTo(px, py);
                        }
                    }
                    this.lastPy = py;
                } else {
                    isDrawing = false;
                }
            } catch {
                isDrawing = false;
            }
        }

        ctx.stroke();
    }

    drawTrace(ctx, isDark) {
        const { cx, cy, mx } = this.mousePos;
        if (cx < 0 || cx > this.width || cy < 0 || cy > this.height) return;

        // Trace on first active function
        const activeFn = this.functions.find(f => f.active);
        if (!activeFn) return;

        this.evaluator.setVariable('x', mx);
        this.evaluator.setVariable('X', mx);

        try {
            const res = this.evaluator.evaluate(activeFn.expr);
            const my = res.value;
            if (!isFinite(my) || isNaN(my)) return;

            const py = this.toScreenY(my);

            // Crosshair dot
            ctx.fillStyle = activeFn.color;
            ctx.beginPath();
            ctx.arc(cx, py, 5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = isDark ? '#ffffff' : '#000000';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Coordinate label badge
            const label = `(${mx.toFixed(2)}, ${my.toFixed(2)})`;
            ctx.font = 'bold 11px monospace';
            const metrics = ctx.measureText(label);
            const badgeW = metrics.width + 12;
            const badgeH = 22;
            const badgeX = Math.min(cx + 10, this.width - badgeW - 5);
            const badgeY = Math.max(py - 28, 5);

            ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.92)';
            ctx.strokeStyle = activeFn.color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, badgeX + 6, badgeY + badgeH / 2);
        } catch {}
    }
}
