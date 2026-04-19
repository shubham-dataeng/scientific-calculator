class Calculator {
    constructor() {
        this.formula = '0';
        this.result = '0';
        this.memory = Number(localStorage.getItem('calcMemory')) || 0;
        this.angleMode = localStorage.getItem('angleMode') || 'deg';
        this.history = JSON.parse(localStorage.getItem('calcHistory')) || [];
        this.isAdvanced = false;
        
        this.initElements();
        this.attachEventListeners();
        this.renderHistory();
    }

    initElements() {
        this.formulaDisplay = document.getElementById('formula');
        this.resultDisplay = document.getElementById('result');
        this.historyList = document.getElementById('historyList');
        this.modeToggle = document.getElementById('modeToggle');
        this.themeToggle = document.getElementById('themeToggle');
        this.advancedSection = document.getElementById('advancedSection');
        this.angleModeContainer = document.getElementById('angleModeContainer');
        
        // Load theme preference
        this.theme = localStorage.getItem('calcTheme') || 'light';
        if (this.theme === 'dark') {
            document.body.classList.add('dark-mode');
            this.themeToggle.textContent = '☀ Light';
        }
        
        // Load memory display
        document.getElementById('memValue').textContent = this.memory;
    }

    attachEventListeners() {
        document.querySelectorAll('[data-num]').forEach(btn => {
            btn.addEventListener('click', () => this.appendNumber(btn.dataset.num));
        });

        document.querySelectorAll('[data-op]').forEach(btn => {
            btn.addEventListener('click', () => this.appendOperator(btn.dataset.op));
        });

        document.querySelectorAll('[data-func]').forEach(btn => {
            btn.addEventListener('click', () => this.applyFunction(btn.dataset.func));
        });

        document.getElementById('clear').addEventListener('click', () => this.clear());
        document.getElementById('delete').addEventListener('click', () => this.delete());
        document.getElementById('equals').addEventListener('click', () => this.calculate());
        document.getElementById('clearHistory').addEventListener('click', () => this.clearHistory());
        document.getElementById('modeToggle').addEventListener('click', () => this.toggleMode());
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());

        document.getElementById('memAdd').addEventListener('click', () => this.memoryOp('add'));
        document.getElementById('memSub').addEventListener('click', () => this.memoryOp('sub'));
        document.getElementById('memRecall').addEventListener('click', () => this.memoryOp('recall'));
        document.getElementById('memClear').addEventListener('click', () => this.memoryOp('clear'));

        document.querySelectorAll('.angle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.angle-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.angleMode = e.target.dataset.mode;
                localStorage.setItem('angleMode', this.angleMode);
            });
            
            // Set active button based on saved preference
            if (btn.dataset.mode === this.angleMode) {
                btn.classList.add('active');
            }
        });

        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    appendNumber(num) {
        if (this.formula.length > 40) return;
        
        if (this.formula === '0' && num !== '.') {
            this.formula = num;
        } else if (num === '.') {
            const parts = this.formula.split(/[\+\-\*\/\^\(\)]/);
            if (parts[parts.length - 1].includes('.')) return;
            this.formula += num;
        } else {
            this.formula += num;
        }
        this.updateDisplay();
    }

    appendOperator(op) {
        const lastChar = this.formula[this.formula.length - 1];
        if (['+', '-', '*', '/', '^', '(', '.'].includes(lastChar)) {
            if (op === '-' && lastChar !== ')') {
                this.formula += op;
            } else if (!['(', '.'].includes(op)) {
                this.formula = this.formula.slice(0, -1) + op;
            }
            return;
        }
        this.formula += op;
        this.updateDisplay();
    }

    applyFunction(func) {
        const lastChar = this.formula[this.formula.length - 1];
        
        switch(func) {
            case 'sin':
            case 'cos':
            case 'tan':
            case 'log':
            case 'ln':
            case 'sqrt':
                this.formula += func + '(';
                break;
            case 'fact':
                this.formula += '!';
                break;
            case 'exp':
                this.formula += 'exp(';
                break;
            case 'pi':
                if (lastChar && !['(', '+', '-', '*', '/', '^'].includes(lastChar)) {
                    this.formula += '*';
                }
                this.formula += 'π';
                break;
        }
        this.updateDisplay();
    }

    calculate() {
        try {
            let expr = this.formula;
            
            // Replace π with Math.PI
            expr = expr.replace(/π/g, Math.PI);
            
            // Replace e with Math.E
            expr = expr.replace(/\be\b/g, Math.E);
            
            // Handle trigonometric functions with proper parentheses
            expr = expr.replace(/sin\(([^)]+)\)/g,
                (_, x) => `Math.sin(${this.angleMode === 'deg' ? 'Math.PI/180*' : ''}(${x}))`
            );

            expr = expr.replace(/cos\(([^)]+)\)/g,
                (_, x) => `Math.cos(${this.angleMode === 'deg' ? 'Math.PI/180*' : ''}(${x}))`
            );

            expr = expr.replace(/tan\(([^)]+)\)/g,
                (_, x) => `Math.tan(${this.angleMode === 'deg' ? 'Math.PI/180*' : ''}(${x}))`
            );
            
            // Handle functions
            expr = expr.replace(/sqrt\(/g, 'Math.sqrt(');
            expr = expr.replace(/log\(/g, 'Math.log10(');
            expr = expr.replace(/ln\(/g, 'Math.log(');
            expr = expr.replace(/exp\(/g, 'Math.exp(');
            
            // Handle power operator
            expr = expr.replace(/\^/g, '**');
            
            // Calculate factorial separately
            expr = this.handleFactorial(expr);
            
            const result = eval(expr);
            this.result = (Math.round(result * 100000000) / 100000000).toString();
            
            this.addToHistory(this.formula, this.result);
            this.formula = this.result;
            this.updateDisplay();
        } catch (e) {
            this.result = 'Invalid Expression';
            this.updateDisplay();
        }
    }

    handleFactorial(expr) {
        return expr.replace(/(\([^()]+\)|\d+)!/g, (match, value) => {
            let n = eval(value);
            if (n < 0 || !Number.isInteger(n)) return NaN;

            let res = 1;
            for (let i = 2; i <= n; i++) res *= i;
            return res;
        });
    }

    clear() {
        this.formula = '0';
        this.result = '0';
        this.updateDisplay();
    }

    delete() {
        this.formula = this.formula.slice(0, -1) || '0';
        this.updateDisplay();
    }

    updateDisplay() {
        this.formulaDisplay.textContent = this.formula;
        this.resultDisplay.textContent = this.result;
    }

    addToHistory(formula, result) {
        this.history.unshift({ formula, result, timestamp: new Date().toLocaleTimeString() });
        if (this.history.length > 50) this.history.pop();
        localStorage.setItem('calcHistory', JSON.stringify(this.history));
        this.renderHistory();
    }

    renderHistory() {
        if (this.history.length === 0) {
            this.historyList.innerHTML = '<div class="empty-history">No calculations yet</div>';
            return;
        }
        
        this.historyList.innerHTML = this.history.map((item, idx) => `
            <div class="history-item" data-idx="${idx}">
                <div class="history-formula">${this.escapeHtml(item.formula)}</div>
                <div class="history-result">= ${this.escapeHtml(item.result)}</div>
            </div>
        `).join('');

        document.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const idx = item.dataset.idx;
                this.formula = this.history[idx].formula;
                this.result = this.history[idx].result;
                this.updateDisplay();
            });
        });
    }

    clearHistory() {
        if (confirm('Clear all history?')) {
            this.history = [];
            localStorage.removeItem('calcHistory');
            this.renderHistory();
        }
    }

    toggleMode() {
        this.isAdvanced = !this.isAdvanced;
        this.advancedSection.classList.toggle('show');
        this.angleModeContainer.style.display = this.isAdvanced ? 'flex' : 'none';
        this.modeToggle.textContent = this.isAdvanced ? 'Hide Scientific' : 'Show Scientific';
        document.getElementById('memDisplay').style.display = this.isAdvanced ? 'inline' : 'none';
    }

    toggleTheme() {
        document.body.classList.toggle('dark-mode');
        this.theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('calcTheme', this.theme);
        this.themeToggle.textContent = this.theme === 'dark' ? '☀ Light' : '🌙 Dark';
    }

    memoryOp(op) {
        try {
            const currentValue = parseFloat(this.result);
            const btn = document.getElementById(`mem${op.charAt(0).toUpperCase() + op.slice(1)}`);
            
            switch(op) {
                case 'add':
                    this.memory += currentValue;
                    btn.classList.add('active');
                    break;
                case 'sub':
                    this.memory -= currentValue;
                    btn.classList.add('active');
                    break;
                case 'recall':
                    this.formula = this.memory.toString();
                    this.result = this.memory.toString();
                    break;
                case 'clear':
                    this.memory = 0;
                    btn.classList.remove('active');
            }
            
            if (op !== 'recall') {
                document.getElementById('memValue').textContent = this.memory;
                localStorage.setItem('calcMemory', this.memory);
            }
            this.updateDisplay();
        } catch (e) {
            console.error('Memory operation failed');
        }
    }

    handleKeyboard(e) {
        if (e.key >= '0' && e.key <= '9') this.appendNumber(e.key);
        if (['+', '-', '*', '/'].includes(e.key)) this.appendOperator(e.key);
        if (e.key === '.') this.appendNumber('.');
        if (e.key === '(' || e.key === ')') this.appendOperator(e.key);
        if (e.key === 'Enter') { e.preventDefault(); this.calculate(); }
        if (e.key === 'Backspace') { e.preventDefault(); this.delete(); }
        if (e.key === 'Escape') this.clear();
    }

    escapeHtml(text) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }
}

const calc = new Calculator();