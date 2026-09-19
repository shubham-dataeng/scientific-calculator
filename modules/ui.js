/**
 * Scientific Calculator - Master UI Controller
 * Orchestrates modes, displays, keypad, keyboard events, live intelligence, and drawer panels.
 */

import { Evaluator } from '../engine/evaluator.js';
import { Parser } from '../engine/parser.js';
import { Explainer } from '../engine/explainer.js';
import { EquationSolver } from '../engine/solver.js';
import { MatrixEngine } from '../engine/matrix.js';
import { StatisticsEngine } from '../engine/stats.js';
import { UnitEngine } from '../engine/units.js';
import { HistoryManager } from './history.js';
import { Grapher } from './grapher.js';
import { ProgrammerEngine } from './programmer.js';
import { WorkspaceManager } from './workspace.js';

export class UIController {
    constructor() {
        // State
        this.formula = '';
        this.activeMode = 'calculator'; // 'calculator', 'workspace', 'graphing', 'solver', 'programmer', 'matrix', 'stats', 'converter'
        this.angleMode = localStorage.getItem('calc_angle_mode') || 'deg';
        this.precision = Number(localStorage.getItem('calc_precision')) || 4;
        this.theme = localStorage.getItem('calc_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        this.isShifted = false; // '2nd' shift key for trig/inverse
        this.memory = Number(localStorage.getItem('calc_memory')) || 0;
        this.activeResultPackage = null;

        // Subsystems
        this.evaluator = new Evaluator({ angleMode: this.angleMode, precision: this.precision });
        this.explainer = new Explainer(this.evaluator);
        this.solver = new EquationSolver();
        this.stats = new StatisticsEngine();
        this.history = new HistoryManager();
        this.programmer = new ProgrammerEngine();
        this.workspace = new WorkspaceManager();

        this.initDOM();
        this.applyTheme(this.theme);
        this.bindEvents();
        this.updateDisplay();
        this.renderHistory();
        this.renderMemoryBank();
    }

    initDOM() {
        // Main Display Elements
        this.formulaInput = document.getElementById('formulaInput');
        this.livePreview = document.getElementById('livePreview');
        this.syntaxBadge = document.getElementById('syntaxBadge');
        this.resultDisplay = document.getElementById('resultDisplay');
        this.resultDrawer = document.getElementById('resultDrawer');
        this.explainerDrawer = document.getElementById('explainerDrawer');
        this.explainerSteps = document.getElementById('explainerSteps');

        // Angle & Settings
        this.angleBtns = document.querySelectorAll('.angle-pill');
        this.precisionSelect = document.getElementById('precisionSelect');
        this.themeToggleBtn = document.getElementById('themeToggleBtn');

        // Mode Nav
        this.modeTabs = document.querySelectorAll('.nav-tab');
        this.modePanes = document.querySelectorAll('.mode-pane');

        // Side Panel Tabs
        this.sideTabs = document.querySelectorAll('.side-tab');
        this.sidePanes = document.querySelectorAll('.side-pane');

        // Set initial state
        if (this.precisionSelect) this.precisionSelect.value = this.precision;
        this.updateAngleModeUI();
    }

    applyTheme(theme) {
        this.theme = theme;
        localStorage.setItem('calc_theme', theme);
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            if (this.themeToggleBtn) this.themeToggleBtn.innerHTML = '☀️ <span class="nav-text">Light</span>';
        } else {
            document.body.classList.remove('dark-mode');
            if (this.themeToggleBtn) this.themeToggleBtn.innerHTML = '🌙 <span class="nav-text">Dark</span>';
        }
        if (this.grapher) this.grapher.render();
    }

    toggleTheme() {
        this.applyTheme(this.theme === 'dark' ? 'light' : 'dark');
    }

    bindEvents() {
        // Theme toggle
        this.themeToggleBtn?.addEventListener('click', () => this.toggleTheme());

        // Angle mode buttons
        this.angleBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setAngleMode(e.currentTarget.dataset.mode);
            });
        });

        // Precision selector
        this.precisionSelect?.addEventListener('change', (e) => {
            this.precision = Number(e.target.value);
            localStorage.setItem('calc_precision', this.precision);
            this.evaluator.setPrecision(this.precision);
            if (this.activeResultPackage) {
                this.activeResultPackage = this.evaluator.formatResult(this.activeResultPackage.value);
                this.renderResultPackage(this.activeResultPackage);
            }
        });

        // Mode tabs
        this.modeTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchMode(e.currentTarget.dataset.mode);
            });
        });

        // Side panel tabs (History vs Variables)
        this.sideTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.sideTabs.forEach(t => t.classList.remove('active'));
                this.sidePanes.forEach(p => p.classList.remove('active'));
                e.currentTarget.classList.add('active');
                const targetPane = document.getElementById(e.currentTarget.dataset.pane);
                if (targetPane) targetPane.classList.add('active');
            });
        });

        // Formula input typing
        this.formulaInput?.addEventListener('input', (e) => {
            this.formula = e.target.value;
            this.updateLiveIntelligence();
        });

        // Calculator Keypad Clicks
        document.querySelectorAll('[data-insert]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.insertFormula(e.currentTarget.dataset.insert);
            });
        });

        document.getElementById('btnEquals')?.addEventListener('click', () => this.calculate());
        document.getElementById('btnClear')?.addEventListener('click', () => this.clear());
        document.getElementById('btnDelete')?.addEventListener('click', () => this.deleteChar());
        document.getElementById('btnShift')?.addEventListener('click', () => this.toggleShift());

        // Memory Buttons
        document.getElementById('btnMemAdd')?.addEventListener('click', () => this.memoryOp('add'));
        document.getElementById('btnMemSub')?.addEventListener('click', () => this.memoryOp('sub'));
        document.getElementById('btnMemRecall')?.addEventListener('click', () => this.memoryOp('recall'));
        document.getElementById('btnMemClear')?.addEventListener('click', () => this.memoryOp('clear'));

        // Copy Result click
        this.resultDisplay?.addEventListener('click', () => {
            if (this.resultDisplay.textContent && !this.resultDisplay.textContent.includes('Error')) {
                navigator.clipboard.writeText(this.resultDisplay.textContent.replace(/^=\s*/, ''));
                this.showToast('Copied result to clipboard');
            }
        });

        // Toggle Explainer Drawer
        document.getElementById('toggleExplainerBtn')?.addEventListener('click', () => {
            this.explainerDrawer?.classList.toggle('open');
        });

        // History Actions
        document.getElementById('clearHistoryBtn')?.addEventListener('click', () => {
            if (confirm('Clear all calculation history?')) {
                this.history.clear();
                this.renderHistory();
            }
        });

        document.getElementById('historySearchInput')?.addEventListener('input', (e) => {
            this.history.searchQuery = e.target.value;
            this.renderHistory();
        });

        document.getElementById('exportHistoryBtn')?.addEventListener('click', () => {
            const blob = new Blob([this.history.exportAsText()], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `calc_history_${Date.now()}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        });

        // Global Keyboard Handler
        window.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Help Modal
        document.getElementById('helpBtn')?.addEventListener('click', () => {
            document.getElementById('helpModal').classList.add('open');
        });
        document.getElementById('closeHelpModal')?.addEventListener('click', () => {
            document.getElementById('helpModal').classList.remove('open');
        });
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('helpModal');
            if (e.target === modal) modal.classList.remove('open');
        });

        // Init feature modules
        this.initGraphingUI();
        this.initEquationSolverUI();
        this.initProgrammerUI();
        this.initMatrixUI();
        this.initStatsUI();
        this.initConverterUI();
        this.initWorkspaceUI();
    }

    setAngleMode(mode) {
        this.angleMode = mode;
        localStorage.setItem('calc_angle_mode', mode);
        this.evaluator.setAngleMode(mode);
        this.updateAngleModeUI();
        this.updateLiveIntelligence();
    }

    updateAngleModeUI() {
        this.angleBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === this.angleMode);
        });
    }

    toggleShift() {
        this.isShifted = !this.isShifted;
        document.getElementById('btnShift')?.classList.toggle('active', this.isShifted);

        // Update secondary function labels
        const shiftMap = {
            'sin': 'asin',
            'cos': 'acos',
            'tan': 'atan',
            'ln': 'exp',
            'log': '10^',
            'sqrt': 'cbrt'
        };

        document.querySelectorAll('[data-shift-func]').forEach(btn => {
            const base = btn.dataset.shiftFunc;
            const shifted = shiftMap[base] || base;
            if (this.isShifted) {
                btn.textContent = btn.dataset.shiftLabel || shifted;
                btn.dataset.insert = `${shifted}(`;
            } else {
                btn.textContent = btn.dataset.baseLabel || base;
                btn.dataset.insert = `${base}(`;
            }
        });
    }

    insertFormula(text) {
        if (!this.formulaInput) return;
        const input = this.formulaInput;
        const start = input.selectionStart || this.formula.length;
        const end = input.selectionEnd || this.formula.length;

        this.formula = this.formula.substring(0, start) + text + this.formula.substring(end);
        input.value = this.formula;
        input.focus();
        const nextPos = start + text.length;
        input.setSelectionRange(nextPos, nextPos);

        this.updateLiveIntelligence();
    }

    deleteChar() {
        if (!this.formulaInput) return;
        const input = this.formulaInput;
        const start = input.selectionStart;
        const end = input.selectionEnd;

        if (start !== end) {
            this.formula = this.formula.substring(0, start) + this.formula.substring(end);
            input.value = this.formula;
            input.setSelectionRange(start, start);
        } else if (start > 0) {
            this.formula = this.formula.substring(0, start - 1) + this.formula.substring(start);
            input.value = this.formula;
            input.setSelectionRange(start - 1, start - 1);
        }
        this.updateLiveIntelligence();
    }

    clear() {
        this.formula = '';
        if (this.formulaInput) this.formulaInput.value = '';
        if (this.resultDisplay) this.resultDisplay.textContent = '0';
        if (this.livePreview) this.livePreview.textContent = '';
        if (this.syntaxBadge) {
            this.syntaxBadge.className = 'syntax-badge';
            this.syntaxBadge.textContent = 'Ready';
        }
        if (this.resultDrawer) this.resultDrawer.innerHTML = '';
        if (this.explainerDrawer) this.explainerDrawer.classList.remove('open');
        this.activeResultPackage = null;
    }

    updateLiveIntelligence() {
        if (!this.formula || !this.formula.trim()) {
            if (this.livePreview) this.livePreview.textContent = '';
            if (this.syntaxBadge) {
                this.syntaxBadge.className = 'syntax-badge';
                this.syntaxBadge.textContent = 'Ready';
            }
            return;
        }

        // Check for natural language unit conversion first (e.g. "10 km to miles")
        const nlp = UnitEngine.parseNaturalLanguage(this.formula);
        if (nlp) {
            if (this.syntaxBadge) {
                this.syntaxBadge.className = 'syntax-badge valid';
                this.syntaxBadge.textContent = 'Unit Conversion';
            }
            if (this.livePreview) this.livePreview.textContent = `= ${nlp.display}`;
            return;
        }

        const validation = Parser.validate(this.formula);
        if (validation.isValid) {
            if (this.syntaxBadge) {
                this.syntaxBadge.className = 'syntax-badge valid';
                this.syntaxBadge.textContent = 'Valid';
            }
            try {
                const res = this.evaluator.evaluate(this.formula);
                if (this.livePreview) this.livePreview.textContent = `= ${res.decimal}`;
            } catch (err) {
                if (this.syntaxBadge) {
                    this.syntaxBadge.className = 'syntax-badge error';
                    this.syntaxBadge.textContent = 'Math Error';
                }
                if (this.livePreview) this.livePreview.textContent = err.message;
            }
        } else if (validation.isIncomplete) {
            if (this.syntaxBadge) {
                this.syntaxBadge.className = 'syntax-badge incomplete';
                this.syntaxBadge.textContent = 'Incomplete...';
            }
            if (this.livePreview) this.livePreview.textContent = validation.error || '';
        } else {
            if (this.syntaxBadge) {
                this.syntaxBadge.className = 'syntax-badge error';
                this.syntaxBadge.textContent = 'Invalid Syntax';
            }
            if (this.livePreview) this.livePreview.textContent = validation.error;
        }
    }

    calculate() {
        if (!this.formula || !this.formula.trim()) return;

        // Handle Natural Language conversion
        const nlp = UnitEngine.parseNaturalLanguage(this.formula);
        if (nlp) {
            this.resultDisplay.textContent = `= ${nlp.display}`;
            this.history.add({
                formula: this.formula,
                result: nlp.display,
                category: 'conversion'
            });
            this.renderHistory();
            return;
        }

        try {
            const res = this.evaluator.evaluate(this.formula);
            this.activeResultPackage = res;

            this.resultDisplay.textContent = `= ${res.decimal}`;
            this.renderResultPackage(res);

            // Generate Step-by-Step Explanation
            const explanation = this.explainer.explain(this.formula);
            this.renderExplainer(explanation);

            // Add to History
            this.history.add({
                formula: this.formula,
                result: res.decimal,
                category: 'scientific'
            });
            this.renderHistory();
            this.renderMemoryBank();

            // Set answer into input for chaining
            this.formula = res.decimal;
            if (this.formulaInput) this.formulaInput.value = this.formula;
            this.updateLiveIntelligence();
        } catch (err) {
            this.resultDisplay.textContent = `Error: ${err.message}`;
            this.resultDrawer.innerHTML = '';
        }
    }

    renderResultPackage(res) {
        if (!this.resultDrawer) return;

        const chips = [];
        chips.push(`<div class="result-chip active" data-val="${res.decimal}"><strong>Decimal:</strong> ${res.decimal}</div>`);

        if (res.fraction && res.fraction !== res.decimal) {
            chips.push(`<div class="result-chip" data-val="${res.fraction}"><strong>Fraction:</strong> ${res.fraction}</div>`);
        }
        if (res.exact) {
            chips.push(`<div class="result-chip" data-val="${res.exact}"><strong>Exact:</strong> ${res.exact}</div>`);
        }
        if (res.scientific && res.scientific !== res.decimal) {
            chips.push(`<div class="result-chip" data-val="${res.scientific}"><strong>Sci:</strong> ${res.scientific}</div>`);
        }
        if (res.engineering && res.engineering !== res.decimal) {
            chips.push(`<div class="result-chip" data-val="${res.engineering}"><strong>Eng:</strong> ${res.engineering}</div>`);
        }
        if (res.percentage) {
            chips.push(`<div class="result-chip" data-val="${res.percentage}"><strong>%:</strong> ${res.percentage}</div>`);
        }

        this.resultDrawer.innerHTML = chips.join('');

        // Clicking a representation copies or sets it
        this.resultDrawer.querySelectorAll('.result-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                this.resultDrawer.querySelectorAll('.result-chip').forEach(c => c.classList.remove('active'));
                e.currentTarget.classList.add('active');
                const val = e.currentTarget.dataset.val;
                this.resultDisplay.textContent = `= ${val}`;
                navigator.clipboard.writeText(val);
                this.showToast(`Selected format: ${val}`);
            });
        });
    }

    renderExplainer(explanation) {
        if (!this.explainerSteps) return;
        if (!explanation.steps || explanation.steps.length === 0) {
            this.explainerSteps.innerHTML = '<div class="empty-state">No intermediate steps required for this expression.</div>';
            return;
        }

        const html = explanation.steps.map((step, idx) => `
            <div class="step-card">
                <div class="step-badge">Step ${idx + 1}: ${step.rule || 'Operation'}</div>
                <div class="step-desc">${step.description}</div>
                <div class="step-math"><code>${step.stepExpression}</code></div>
            </div>
        `).join('');

        this.explainerSteps.innerHTML = html;
    }

    renderHistory() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;

        const items = this.history.getFilteredItems();
        if (items.length === 0) {
            historyList.innerHTML = '<div class="empty-state">No calculations in history.</div>';
            return;
        }

        const html = items.map(item => `
            <div class="history-item ${this.history.pinnedIds.has(item.id) ? 'pinned' : ''}" data-id="${item.id}">
                <div class="history-main" data-formula="${this.escapeHtml(item.formula)}">
                    <div class="history-formula">${this.escapeHtml(item.formula)}</div>
                    <div class="history-result">= ${this.escapeHtml(item.result)}</div>
                    <div class="history-time">${item.timestamp}</div>
                </div>
                <div class="history-actions">
                    <button class="history-icon-btn pin-btn" title="Pin / Favorite" data-id="${item.id}">
                        ${this.history.pinnedIds.has(item.id) ? '★' : '☆'}
                    </button>
                    <button class="history-icon-btn copy-btn" title="Copy Result" data-val="${this.escapeHtml(item.result)}">
                        ⧉
                    </button>
                    <button class="history-icon-btn del-btn" title="Delete" data-id="${item.id}">
                        ✕
                    </button>
                </div>
            </div>
        `).join('');

        historyList.innerHTML = html;

        // Attach listeners
        historyList.querySelectorAll('.history-main').forEach(el => {
            el.addEventListener('click', () => {
                this.formula = el.dataset.formula;
                if (this.formulaInput) this.formulaInput.value = this.formula;
                this.updateLiveIntelligence();
                this.switchMode('calculator');
            });
        });

        historyList.querySelectorAll('.pin-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.history.togglePin(btn.dataset.id);
                this.renderHistory();
            });
        });

        historyList.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(btn.dataset.val);
                this.showToast('Copied history result');
            });
        });

        historyList.querySelectorAll('.del-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.history.delete(btn.dataset.id);
                this.renderHistory();
            });
        });
    }

    renderMemoryBank() {
        const memContainer = document.getElementById('memoryBankContainer');
        if (!memContainer) return;

        const vars = this.evaluator.variables;
        const keys = ['ans', 'pi', 'e', 'phi', 'tau'];

        let html = `
            <div class="var-card">
                <span class="var-name">M (Memory)</span>
                <span class="var-val">${this.memory}</span>
            </div>
        `;

        keys.forEach(k => {
            html += `
                <div class="var-card" data-insert="${k}">
                    <span class="var-name">${k}</span>
                    <span class="var-val">${parseFloat(vars[k].toFixed(6))}</span>
                </div>
            `;
        });

        memContainer.innerHTML = html;

        memContainer.querySelectorAll('.var-card').forEach(card => {
            card.addEventListener('click', () => {
                if (card.dataset.insert) this.insertFormula(card.dataset.insert);
            });
        });
    }

    memoryOp(op) {
        const currentVal = this.activeResultPackage ? this.activeResultPackage.value : parseFloat(this.formula) || 0;
        switch (op) {
            case 'add':
                this.memory += currentVal;
                this.showToast(`M+ added ${currentVal}`);
                break;
            case 'sub':
                this.memory -= currentVal;
                this.showToast(`M- subtracted ${currentVal}`);
                break;
            case 'recall':
                this.insertFormula(this.memory.toString());
                this.showToast(`MR recalled ${this.memory}`);
                break;
            case 'clear':
                this.memory = 0;
                this.showToast('MC cleared memory');
                break;
        }
        localStorage.setItem('calc_memory', this.memory);
        this.renderMemoryBank();
    }

    handleKeyboard(e) {
        // Ignore if user is typing in standard text inputs outside calculator
        if (e.target.tagName === 'INPUT' && e.target.id !== 'formulaInput' && e.target.id !== 'equationInputStr') {
            return;
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            this.calculate();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            this.clear();
        } else if (e.ctrlKey && e.key === 'c') {
            if (this.resultDisplay.textContent) {
                navigator.clipboard.writeText(this.resultDisplay.textContent.replace(/^=\s*/, ''));
                this.showToast('Copied result');
            }
        } else if (e.ctrlKey && e.key === 'h') {
            e.preventDefault();
            document.getElementById('helpModal')?.classList.toggle('open');
        }
    }

    switchMode(mode) {
        this.activeMode = mode;
        this.modeTabs.forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
        this.modePanes.forEach(p => p.classList.toggle('active', p.id === `pane_${mode}`));

        if (mode === 'graphing' && this.grapher) {
            setTimeout(() => {
                this.grapher.initCanvasSize();
                this.grapher.render();
            }, 50);
        }
    }

    showToast(message) {
        let toast = document.getElementById('toastNotification');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toastNotification';
            toast.className = 'toast-notification';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    }

    escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Module UI Initializers
    initGraphingUI() {
        const canvas = document.getElementById('graphCanvas');
        if (!canvas) return;
        this.grapher = new Grapher(canvas, canvas.parentElement);

        const f1Input = document.getElementById('graphF1');
        const f2Input = document.getElementById('graphF2');

        f1Input?.addEventListener('input', (e) => {
            this.grapher.functions[0].expr = e.target.value;
            this.grapher.render();
        });

        f2Input?.addEventListener('input', (e) => {
            this.grapher.functions[1].expr = e.target.value;
            this.grapher.functions[1].active = !!e.target.value.trim();
            this.grapher.render();
        });

        document.getElementById('graphResetBtn')?.addEventListener('click', () => this.grapher.resetView());
        document.getElementById('graphZoomInBtn')?.addEventListener('click', () => this.grapher.zoom(0.8));
        document.getElementById('graphZoomOutBtn')?.addEventListener('click', () => this.grapher.zoom(1.25));
    }

    initEquationSolverUI() {
        const solveBtn = document.getElementById('equationSolveBtn');
        const input = document.getElementById('equationInputStr');
        const output = document.getElementById('equationOutput');

        const doSolve = () => {
            const eq = input.value.trim();
            if (!eq) return;
            try {
                const res = this.solver.solve(eq);
                let html = `<div class="solver-solution-box">`;
                html += `<h4>Solutions:</h4><div class="solver-roots">${res.solutions.map(s => `<span class="root-pill">${s}</span>`).join(' ')}</div>`;
                html += `<div class="solver-steps-list"><h4>Step-by-Step Derivation:</h4>`;
                html += res.steps.map((s, i) => `<div class="step-card"><div class="step-badge">Step ${i + 1}</div><div>${s}</div></div>`).join('');
                html += `</div></div>`;
                output.innerHTML = html;
            } catch (err) {
                output.innerHTML = `<div class="error-box">Error: ${err.message}</div>`;
            }
        };

        solveBtn?.addEventListener('click', doSolve);
        input?.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSolve(); });
    }

    initProgrammerUI() {
        const board = document.getElementById('programmerBitBoard');
        const hexDisplay = document.getElementById('progHexDisplay');
        const decDisplay = document.getElementById('progDecDisplay');
        const octDisplay = document.getElementById('progOctDisplay');
        const binDisplay = document.getElementById('progBinDisplay');
        const wordSelect = document.getElementById('progWordSelect');
        const signToggle = document.getElementById('progSignToggle');

        const updateProgrammerDisplays = () => {
            if (hexDisplay) hexDisplay.textContent = this.programmer.getHex();
            if (decDisplay) decDisplay.textContent = this.programmer.getDec();
            if (octDisplay) octDisplay.textContent = this.programmer.getOct();
            if (binDisplay) binDisplay.textContent = this.programmer.getFormattedBin();
            renderBitBoard();
        };

        const renderBitBoard = () => {
            if (!board) return;
            const bits = [];
            const size = this.programmer.wordSize;
            for (let i = size - 1; i >= 0; i--) {
                const isSet = (this.programmer.value & (1n << BigInt(i))) !== 0n;
                bits.push(`
                    <button class="bit-btn ${isSet ? 'active' : ''}" data-bit="${i}" title="Bit ${i}">
                        <span class="bit-idx">${i}</span>
                        <span class="bit-val">${isSet ? '1' : '0'}</span>
                    </button>
                `);
            }
            board.innerHTML = bits.join('');
            board.querySelectorAll('.bit-btn').forEach(b => {
                b.addEventListener('click', (e) => {
                    this.programmer.toggleBit(Number(e.currentTarget.dataset.bit));
                    updateProgrammerDisplays();
                });
            });
        };

        wordSelect?.addEventListener('change', (e) => {
            this.programmer.setWordSize(Number(e.target.value));
            updateProgrammerDisplays();
        });

        signToggle?.addEventListener('change', (e) => {
            this.programmer.isSigned = e.target.checked;
            updateProgrammerDisplays();
        });

        document.querySelectorAll('[data-prog-op]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const op = e.currentTarget.dataset.progOp;
                if (op === 'NOT') {
                    this.programmer.bitwiseOp('NOT');
                    updateProgrammerDisplays();
                } else if (op === 'CLEAR') {
                    this.programmer.setValue(0n);
                    updateProgrammerDisplays();
                } else {
                    const val = prompt(`Enter second operand for ${op} (hex, dec, etc.):`);
                    if (val !== null) {
                        try {
                            const bVal = val.startsWith('0x') ? BigInt(val) : BigInt(val);
                            this.programmer.bitwiseOp(op, bVal);
                            updateProgrammerDisplays();
                        } catch (err) {
                            alert('Invalid operand: ' + err.message);
                        }
                    }
                }
            });
        });

        updateProgrammerDisplays();
    }

    initMatrixUI() {
        const computeBtn = document.getElementById('matrixComputeBtn');
        const opSelect = document.getElementById('matrixOpSelect');
        const output = document.getElementById('matrixOutput');

        computeBtn?.addEventListener('click', () => {
            try {
                const aVal = document.getElementById('matrixAInput').value.trim();
                const bVal = document.getElementById('matrixBInput')?.value.trim();
                const op = opSelect.value;

                // Parse matrix format: e.g. "1 2; 3 4"
                const parseMatrix = (str) => {
                    return str.split(';').map(row => row.trim().split(/\s+/).map(Number));
                };

                const A = parseMatrix(aVal);
                let result;

                if (op === 'det') {
                    result = `Determinant = ${MatrixEngine.determinant(A)}`;
                } else if (op === 'inv') {
                    const inv = MatrixEngine.inverse(A);
                    result = `Inverse = \n${inv.map(r => r.join('\t')).join('\n')}`;
                } else if (op === 'trans') {
                    const t = MatrixEngine.transpose(A);
                    result = `Transpose = \n${t.map(r => r.join('\t')).join('\n')}`;
                } else if (op === 'trace') {
                    result = `Trace = ${MatrixEngine.trace(A)}`;
                } else if (op === 'add' || op === 'sub' || op === 'mult') {
                    const B = parseMatrix(bVal);
                    let M;
                    if (op === 'add') M = MatrixEngine.add(A, B);
                    else if (op === 'sub') M = MatrixEngine.subtract(A, B);
                    else if (op === 'mult') M = MatrixEngine.multiply(A, B);
                    result = `Result = \n${M.map(r => r.join('\t')).join('\n')}`;
                }

                output.innerHTML = `<pre class="matrix-result">${result}</pre>`;
            } catch (err) {
                output.innerHTML = `<div class="error-box">Matrix Error: ${err.message}</div>`;
            }
        });
    }

    initStatsUI() {
        const input = document.getElementById('statsDatasetInput');
        const computeBtn = document.getElementById('statsComputeBtn');
        const output = document.getElementById('statsOutput');

        const doStats = () => {
            const data = StatisticsEngine.parseDataset(input.value);
            if (data.length === 0) {
                output.innerHTML = '<div class="empty-state">Please enter valid numbers separated by commas or spaces.</div>';
                return;
            }

            const s = StatisticsEngine.analyze(data);
            let html = `
                <div class="stats-grid">
                    <div class="stat-card"><span class="stat-label">Count (n)</span><span class="stat-num">${s.count}</span></div>
                    <div class="stat-card"><span class="stat-label">Sum (Σx)</span><span class="stat-num">${s.sum}</span></div>
                    <div class="stat-card highlight"><span class="stat-label">Mean (μ)</span><span class="stat-num">${s.mean}</span></div>
                    <div class="stat-card highlight"><span class="stat-label">Median</span><span class="stat-num">${s.median}</span></div>
                    <div class="stat-card"><span class="stat-label">Mode</span><span class="stat-num">${s.mode}</span></div>
                    <div class="stat-card"><span class="stat-label">Min / Max</span><span class="stat-num">${s.min} / ${s.max}</span></div>
                    <div class="stat-card"><span class="stat-label">Range</span><span class="stat-num">${s.range}</span></div>
                    <div class="stat-card"><span class="stat-label">Q1 / Q3</span><span class="stat-num">${s.q1} / ${s.q3}</span></div>
                    <div class="stat-card"><span class="stat-label">IQR</span><span class="stat-num">${s.iqr}</span></div>
                    <div class="stat-card"><span class="stat-label">Sample StdDev (s)</span><span class="stat-num">${s.sampleStdDev}</span></div>
                    <div class="stat-card"><span class="stat-label">Sample Variance (s²)</span><span class="stat-num">${s.sampleVariance}</span></div>
                    <div class="stat-card"><span class="stat-label">Std Error (SEM)</span><span class="stat-num">${s.sem}</span></div>
                </div>
            `;

            // Frequency Histogram
            html += `<h4>Frequency Distribution</h4><div class="histogram-bars">`;
            const maxCount = Math.max(...s.histogram.map(b => b.count));
            s.histogram.forEach(b => {
                const heightPct = maxCount > 0 ? (b.count / maxCount) * 100 : 0;
                html += `
                    <div class="hist-col">
                        <div class="hist-bar" style="height: ${Math.max(10, heightPct)}%;">
                            <span class="hist-count">${b.count}</span>
                        </div>
                        <span class="hist-label">${b.label}</span>
                    </div>
                `;
            });
            html += `</div>`;

            output.innerHTML = html;
        };

        computeBtn?.addEventListener('click', doStats);
    }

    initConverterUI() {
        const catSelect = document.getElementById('convCategorySelect');
        const fromUnitSelect = document.getElementById('convFromUnitSelect');
        const toUnitSelect = document.getElementById('convToUnitSelect');
        const fromInput = document.getElementById('convFromInput');
        const toInput = document.getElementById('convToInput');
        const swapBtn = document.getElementById('convSwapBtn');

        const populateUnits = () => {
            const catKey = catSelect.value;
            const cat = UnitEngine.categories[catKey];
            if (!cat) return;

            const unitOptions = Object.entries(cat.units).map(([k, u]) => `<option value="${k}">${u.label}</option>`).join('');
            fromUnitSelect.innerHTML = unitOptions;
            toUnitSelect.innerHTML = unitOptions;

            const keys = Object.keys(cat.units);
            if (keys.length > 1) toUnitSelect.value = keys[1];

            doConvert();
        };

        const doConvert = () => {
            const val = fromInput.value;
            if (val === '' || isNaN(val)) {
                toInput.value = '';
                return;
            }
            try {
                const res = UnitEngine.convert(val, fromUnitSelect.value, toUnitSelect.value, catSelect.value);
                toInput.value = res !== null ? parseFloat(res.toFixed(6)).toString() : '';
            } catch (err) {
                toInput.value = 'Error';
            }
        };

        catSelect?.addEventListener('change', populateUnits);
        fromUnitSelect?.addEventListener('change', doConvert);
        toUnitSelect?.addEventListener('change', doConvert);
        fromInput?.addEventListener('input', doConvert);

        swapBtn?.addEventListener('click', () => {
            const temp = fromUnitSelect.value;
            fromUnitSelect.value = toUnitSelect.value;
            toUnitSelect.value = temp;
            doConvert();
        });

        populateUnits();
    }

    initWorkspaceUI() {
        const linesContainer = document.getElementById('workspaceLinesContainer');
        const addLineBtn = document.getElementById('workspaceAddLineBtn');
        const clearBtn = document.getElementById('workspaceClearBtn');
        const exportBtn = document.getElementById('workspaceExportBtn');

        const renderWorkspace = () => {
            if (!linesContainer) return;
            const html = this.workspace.lines.map((line, idx) => `
                <div class="workspace-row" data-id="${line.id}">
                    <span class="ws-linenum">L${idx + 1}</span>
                    <input type="text" class="ws-input" value="${this.escapeHtml(line.expr)}" placeholder="e.g. 15 * 4, radius = 5, or L1 + 10" data-id="${line.id}">
                    <span class="ws-result ${line.error ? 'error' : ''}">
                        ${line.error ? '⚠️ ' + this.escapeHtml(line.error) : '= ' + this.escapeHtml(line.result || '—')}
                    </span>
                    <button class="ws-del-btn" data-id="${line.id}" title="Remove line">✕</button>
                </div>
            `).join('');

            linesContainer.innerHTML = html;

            linesContainer.querySelectorAll('.ws-input').forEach(input => {
                input.addEventListener('input', (e) => {
                    this.workspace.updateLine(Number(e.target.dataset.id), e.target.value);
                    // Update result texts without re-rendering entire list to preserve focus
                    this.workspace.lines.forEach((l, i) => {
                        const row = linesContainer.children[i];
                        if (row) {
                            const resSpan = row.querySelector('.ws-result');
                            if (resSpan) {
                                resSpan.className = `ws-result ${l.error ? 'error' : ''}`;
                                resSpan.textContent = l.error ? '⚠️ ' + l.error : '= ' + (l.result || '—');
                            }
                        }
                    });
                });

                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        const currentId = Number(e.target.dataset.id);
                        const newLine = this.workspace.addLine(currentId);
                        renderWorkspace();
                        const nextRow = linesContainer.querySelector(`.workspace-row[data-id="${newLine.id}"] .ws-input`);
                        if (nextRow) nextRow.focus();
                    }
                });
            });

            linesContainer.querySelectorAll('.ws-del-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.workspace.deleteLine(Number(e.currentTarget.dataset.id));
                    renderWorkspace();
                });
            });
        };

        addLineBtn?.addEventListener('click', () => {
            this.workspace.addLine();
            renderWorkspace();
        });

        clearBtn?.addEventListener('click', () => {
            if (confirm('Clear workspace calculations?')) {
                this.workspace.clearWorkspace();
                renderWorkspace();
            }
        });

        exportBtn?.addEventListener('click', () => {
            const md = this.workspace.exportMarkdown();
            const blob = new Blob([md], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `workspace_${Date.now()}.md`;
            a.click();
            URL.revokeObjectURL(url);
        });

        renderWorkspace();
    }
}
