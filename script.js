class Calculator {
    constructor() {
        this.formula = '0';
        this.result = '0';
        this.memory = Number(localStorage.getItem('calcMemory')) || 0;
        this.angleMode = localStorage.getItem('angleMode') || 'deg';
        this.history = JSON.parse(localStorage.getItem('calcHistory')) || [];
        this.isAdvanced = false;
        this.precision = Number(localStorage.getItem('calcPrecision')) || 4;
        this.scientificNotation = localStorage.getItem('calcNotation') === 'true' || false;
        
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
        this.precisionSelect = document.getElementById('precisionSelect');
        
        // Set precision selector value
        this.precisionSelect.value = this.precision;
        
        // Load theme preference
        this.theme = localStorage.getItem('calcTheme') || 'light';
        if (this.theme === 'dark') {
            document.body.classList.add('dark-mode');
            this.themeToggle.textContent = '☀ Light';
        }
        
        // Load memory display
        document.getElementById('memValue').textContent = this.memory;
        
        // Add click to copy functionality
        this.resultDisplay.addEventListener('click', () => {
            if (this.result !== '0' && this.result !== 'Invalid Expression') {
                navigator.clipboard.writeText(this.result);
                
                this.resultDisplay.classList.add('copied');
                const originalText = this.resultDisplay.textContent;
                this.resultDisplay.textContent = '✓ Copied!';
                
                setTimeout(() => {
                    this.resultDisplay.classList.remove('copied');
                    this.resultDisplay.textContent = originalText;
                }, 1500);
            }
        });

        // Initialize settings panel
        document.getElementById('settingAngleMode').value = this.angleMode;
        document.getElementById('settingPrecision').value = this.precision;
        document.getElementById('settingNotation').checked = this.scientificNotation;

        // Set theme buttons opacity
        if (this.theme === 'dark') {
            document.getElementById('settingDark').style.opacity = '1';
            document.getElementById('settingLight').style.opacity = '0.6';
        } else {
            document.getElementById('settingLight').style.opacity = '1';
            document.getElementById('settingDark').style.opacity = '0.6';
        }

        // Set notation toggle opacity
        this.notationToggle = document.getElementById('notationToggle');
        this.notationToggle.style.opacity = this.scientificNotation ? '1' : '0.6';
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
        document.getElementById('precisionSelect').addEventListener('change', (e) => {
            this.precision = Number(e.target.value);
            localStorage.setItem('calcPrecision', this.precision);
            this.updateDisplay();
        });

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

        // Help modal
        document.getElementById('helpBtn').addEventListener('click', () => {
            document.getElementById('helpModal').style.display = 'block';
        });

        document.getElementById('closeHelp').addEventListener('click', () => {
            document.getElementById('helpModal').style.display = 'none';
        });

        // Settings panel
        document.getElementById('settingsBtn').addEventListener('click', () => {
            document.getElementById('settingsPanel').classList.toggle('active');
        });

        document.getElementById('closeSettings').addEventListener('click', () => {
            document.getElementById('settingsPanel').classList.remove('active');
        });

        // Settings options
        document.getElementById('settingAngleMode').addEventListener('change', (e) => {
            this.angleMode = e.target.value;
            localStorage.setItem('angleMode', this.angleMode);
            document.querySelectorAll('.angle-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.mode === this.angleMode);
            });
        });

        document.getElementById('settingPrecision').addEventListener('change', (e) => {
            this.precision = Number(e.target.value);
            localStorage.setItem('calcPrecision', this.precision);
            this.precisionSelect.value = this.precision;
            this.updateDisplay();
        });

        document.getElementById('settingLight').addEventListener('click', () => {
            document.body.classList.remove('dark-mode');
            this.theme = 'light';
            localStorage.setItem('calcTheme', this.theme);
            document.getElementById('settingLight').style.opacity = '1';
            document.getElementById('settingDark').style.opacity = '0.6';
            this.themeToggle.textContent = '🌙 Dark';
        });

        document.getElementById('settingDark').addEventListener('click', () => {
            document.body.classList.add('dark-mode');
            this.theme = 'dark';
            localStorage.setItem('calcTheme', this.theme);
            document.getElementById('settingDark').style.opacity = '1';
            document.getElementById('settingLight').style.opacity = '0.6';
            this.themeToggle.textContent = '☀ Light';
        });

        document.getElementById('settingNotation').addEventListener('change', (e) => {
            this.scientificNotation = e.target.checked;
            localStorage.setItem('calcNotation', this.scientificNotation);
            this.notationToggle.style.opacity = this.scientificNotation ? '1' : '0.6';
            this.updateDisplay();
        });

        document.getElementById('resetSettings').addEventListener('click', () => {
            if (confirm('Reset all settings to defaults?')) {
                localStorage.clear();
                location.reload();
            }
        });

        // Notation toggle
        this.notationToggle.addEventListener('click', () => {
            this.scientificNotation = !this.scientificNotation;
            localStorage.setItem('calcNotation', this.scientificNotation);
            this.notationToggle.style.opacity = this.scientificNotation ? '1' : '0.6';
            this.updateDisplay();
        });

        // Keyboard shortcut for help
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'h') {
                e.preventDefault();
                document.getElementById('helpModal').style.display = 
                    document.getElementById('helpModal').style.display === 'block' ? 'none' : 'block';
            }
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('helpModal');
            if (e.target === modal) {
                modal.style.display = 'none';
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
            case 'asin':
            case 'acos':
            case 'atan':
            case 'sinh':
            case 'cosh':
            case 'tanh':
            case 'log':
            case 'ln':
            case 'sqrt':
            case 'cbrt':
            case 'abs':
                this.formula += func + '(';
                break;
            case 'fact':
                this.formula += '!';
                break;
            case 'exp':
                this.formula += 'exp(';
                break;
            case 'percent':
                this.formula += '%';
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
            
            // Replace display symbols with math.js compatible versions
            expr = expr.replace(/π/g, 'pi');
            expr = expr.replace(/\^/g, '**');
            expr = expr.replace(/÷/g, '/');
            expr = expr.replace(/×/g, '*');
            expr = expr.replace(/−/g, '-');
            
            // Handle angle conversions for trig functions
            if (this.angleMode === 'deg') {
                expr = expr.replace(/sin\(([^)]+)\)/g, 'sin(pi/180*($1))');
                expr = expr.replace(/cos\(([^)]+)\)/g, 'cos(pi/180*($1))');
                expr = expr.replace(/tan\(([^)]+)\)/g, 'tan(pi/180*($1))');
                expr = expr.replace(/asin\(([^)]+)\)/g, '180/pi*asin($1)');
                expr = expr.replace(/acos\(([^)]+)\)/g, '180/pi*acos($1)');
                expr = expr.replace(/atan\(([^)]+)\)/g, '180/pi*atan($1)');
            }
            
            // Replace e with Math.E for math.js
            expr = expr.replace(/\be\b/g, 'e');
            
            // Handle percentage
            expr = expr.replace(/(\d+)%/g, '($1/100)');
            
            // Use math.js to evaluate safely
            const result = math.evaluate(expr);
            
            // Apply precision
            const multiplier = Math.pow(10, this.precision);
            this.result = (Math.round(result * multiplier) / multiplier).toString();
            
            this.addToHistory(this.formula, this.result);
            this.formula = this.result;
            this.updateDisplay();
        } catch (e) {
            // Better error messages
            const errorMsg = e.message.toLowerCase();
            if (errorMsg.includes('divide')) {
                this.result = 'Division by zero';
            } else if (errorMsg.includes('parenthes')) {
                this.result = 'Unmatched parentheses';
            } else if (errorMsg.includes('syntax')) {
                this.result = 'Syntax error';
            } else {
                this.result = 'Invalid Expression';
            }
            this.updateDisplay();
        }
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
        
        if (this.scientificNotation && this.result !== '0' && this.result !== 'Invalid Expression') {
            const num = parseFloat(this.result);
            if (!isNaN(num) && (Math.abs(num) > 1e6 || Math.abs(num) < 1e-4)) {
                this.resultDisplay.textContent = num.toExponential(this.precision - 1);
            } else {
                this.resultDisplay.textContent = this.result;
            }
        } else {
            this.resultDisplay.textContent = this.result;
        }
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
                <div>
                    <div class="history-formula">${this.escapeHtml(item.formula)}</div>
                    <div class="history-result">= ${this.escapeHtml(item.result)}</div>
                </div>
                <button class="history-delete-btn" data-idx="${idx}">Delete</button>
            </div>
        `).join('');

        document.querySelectorAll('.history-item').forEach(item => {
            const content = item.querySelector('div');
            content.addEventListener('click', () => {
                const idx = item.dataset.idx;
                this.formula = this.history[idx].formula;
                this.result = this.history[idx].result;
                this.updateDisplay();
            });
        });

        // Add delete functionality
        document.querySelectorAll('.history-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = btn.dataset.idx;
                this.history.splice(idx, 1);
                localStorage.setItem('calcHistory', JSON.stringify(this.history));
                this.renderHistory();
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

class UnitConverter {
    constructor() {
        this.categories = {
            length: {
                name: 'Length',
                units: {
                    mm: { label: 'Millimeter (mm)', factor: 0.001 },
                    cm: { label: 'Centimeter (cm)', factor: 0.01 },
                    m: { label: 'Meter (m)', factor: 1 },
                    km: { label: 'Kilometer (km)', factor: 1000 },
                    in: { label: 'Inch (in)', factor: 0.0254 },
                    ft: { label: 'Foot (ft)', factor: 0.3048 },
                    yd: { label: 'Yard (yd)', factor: 0.9144 },
                    mi: { label: 'Mile (mi)', factor: 1609.34 }
                }
            },
            weight: {
                name: 'Weight',
                units: {
                    mg: { label: 'Milligram (mg)', factor: 0.001 },
                    g: { label: 'Gram (g)', factor: 1 },
                    kg: { label: 'Kilogram (kg)', factor: 1000 },
                    lb: { label: 'Pound (lb)', factor: 453.592 },
                    oz: { label: 'Ounce (oz)', factor: 28.3495 },
                    ton: { label: 'Metric Ton (t)', factor: 1000000 }
                }
            },
            temperature: {
                name: 'Temperature',
                units: {
                    c: { label: 'Celsius (°C)', convert: 'temp' },
                    f: { label: 'Fahrenheit (°F)', convert: 'temp' },
                    k: { label: 'Kelvin (K)', convert: 'temp' }
                }
            },
            volume: {
                name: 'Volume',
                units: {
                    ml: { label: 'Milliliter (ml)', factor: 1 },
                    l: { label: 'Liter (l)', factor: 1000 },
                    gal: { label: 'US Gallon (gal)', factor: 3785.41 },
                    cup: { label: 'US Cup (cup)', factor: 236.588 },
                    pt: { label: 'Pint (pt)', factor: 473.176 }
                }
            }
        };

        this.initElements();
        this.attachListeners();
    }

    initElements() {
        this.categorySelect = document.getElementById('converterCategory');
        this.fromUnitSelect = document.getElementById('converterFromUnit');
        this.toUnitSelect = document.getElementById('converterToUnit');
        this.fromInput = document.getElementById('converterFrom');
        this.toInput = document.getElementById('converterTo');
        this.swapBtn = document.getElementById('swapUnits');

        this.updateUnitOptions('length');
    }

    attachListeners() {
        this.categorySelect.addEventListener('change', (e) => {
            this.updateUnitOptions(e.target.value);
        });

        this.fromInput.addEventListener('input', () => this.convert());
        this.fromUnitSelect.addEventListener('change', () => this.convert());
        this.toUnitSelect.addEventListener('change', () => this.convert());

        this.swapBtn.addEventListener('click', () => {
            [this.fromUnitSelect.value, this.toUnitSelect.value] = 
            [this.toUnitSelect.value, this.fromUnitSelect.value];
            this.convert();
        });
    }

    updateUnitOptions(category) {
        const units = this.categories[category].units;
        const unitKeys = Object.keys(units);

        this.fromUnitSelect.innerHTML = unitKeys.map(key => 
            `<option value="${key}">${units[key].label}</option>`
        ).join('');

        this.toUnitSelect.innerHTML = unitKeys.map((key, idx) => 
            `<option value="${key}" ${idx === 1 ? 'selected' : ''}>${units[key].label}</option>`
        ).join('');

        this.convert();
    }

    convert() {
        const from = this.fromInput.value;
        if (!from || isNaN(from)) {
            this.toInput.value = '';
            return;
        }

        const category = this.categorySelect.value;
        const fromUnit = this.fromUnitSelect.value;
        const toUnit = this.toUnitSelect.value;
        const units = this.categories[category].units;

        let result;
        
        if (category === 'temperature') {
            result = this.convertTemperature(parseFloat(from), fromUnit, toUnit);
        } else {
            const toBase = parseFloat(from) * units[fromUnit].factor;
            result = toBase / units[toUnit].factor;
        }

        this.toInput.value = (Math.round(result * 10000) / 10000).toString();
    }

    convertTemperature(value, from, to) {
        let celsius;
        
        if (from === 'c') celsius = value;
        else if (from === 'f') celsius = (value - 32) * 5/9;
        else if (from === 'k') celsius = value - 273.15;

        if (to === 'c') return celsius;
        else if (to === 'f') return celsius * 9/5 + 32;
        else if (to === 'k') return celsius + 273.15;
    }
}

class ProgrammerMode {
    constructor() {
        this.initElements();
        this.attachListeners();
    }

    initElements() {
        this.decimalInput = document.getElementById('progDecimal');
        this.binaryInput = document.getElementById('progBinary');
        this.hexInput = document.getElementById('progHex');
        this.octalInput = document.getElementById('progOctal');
        this.bitNum1 = document.getElementById('bitNum1');
        this.bitNum2 = document.getElementById('bitNum2');
        this.bitwiseOp = document.getElementById('bitwiseOp');
        this.bitwiseCalcBtn = document.getElementById('bitwiseCalc');
        this.bitResult = document.getElementById('bitResult');
    }

    attachListeners() {
        this.decimalInput.addEventListener('input', () => this.updateFromDecimal());
        this.binaryInput.addEventListener('input', () => this.updateFromBinary());
        this.hexInput.addEventListener('input', () => this.updateFromHex());
        this.octalInput.addEventListener('input', () => this.updateFromOctal());
        this.bitwiseCalcBtn.addEventListener('click', () => this.calculateBitwise());
    }

    updateFromDecimal() {
        const decimal = parseInt(this.decimalInput.value);
        if (isNaN(decimal)) return;

        this.binaryInput.value = '0b' + decimal.toString(2);
        this.hexInput.value = '0x' + decimal.toString(16).toUpperCase();
        this.octalInput.value = '0o' + decimal.toString(8);
    }

    updateFromBinary() {
        const binary = this.binaryInput.value.replace('0b', '');
        const decimal = parseInt(binary, 2);
        if (isNaN(decimal)) return;

        this.decimalInput.value = decimal;
        this.hexInput.value = '0x' + decimal.toString(16).toUpperCase();
        this.octalInput.value = '0o' + decimal.toString(8);
    }

    updateFromHex() {
        const hex = this.hexInput.value.replace('0x', '');
        const decimal = parseInt(hex, 16);
        if (isNaN(decimal)) return;

        this.decimalInput.value = decimal;
        this.binaryInput.value = '0b' + decimal.toString(2);
        this.octalInput.value = '0o' + decimal.toString(8);
    }

    updateFromOctal() {
        const octal = this.octalInput.value.replace('0o', '');
        const decimal = parseInt(octal, 8);
        if (isNaN(decimal)) return;

        this.decimalInput.value = decimal;
        this.binaryInput.value = '0b' + decimal.toString(2);
        this.hexInput.value = '0x' + decimal.toString(16).toUpperCase();
    }

    calculateBitwise() {
        const num1 = parseInt(this.bitNum1.value);
        const num2 = parseInt(this.bitNum2.value);
        const operation = this.bitwiseOp.value;

        if (isNaN(num1) || (operation !== 'not' && isNaN(num2))) {
            this.bitResult.textContent = 'Invalid input';
            return;
        }

        let result;
        switch (operation) {
            case 'and':
                result = num1 & num2;
                this.bitResult.textContent = `${num1} & ${num2} = ${result}`;
                break;
            case 'or':
                result = num1 | num2;
                this.bitResult.textContent = `${num1} | ${num2} = ${result}`;
                break;
            case 'xor':
                result = num1 ^ num2;
                this.bitResult.textContent = `${num1} ^ ${num2} = ${result}`;
                break;
            case 'not':
                result = ~num1;
                this.bitResult.textContent = `~${num1} = ${result}`;
                break;
            case 'lshift':
                result = num1 << num2;
                this.bitResult.textContent = `${num1} << ${num2} = ${result}`;
                break;
            case 'rshift':
                result = num1 >> num2;
                this.bitResult.textContent = `${num1} >> ${num2} = ${result}`;
                break;
        }
    }
}

class Statistics {
    constructor() {
        this.numbers = [];
        this.initElements();
        this.attachListeners();
    }

    initElements() {
        this.input = document.getElementById('statsInput');
        this.addBtn = document.getElementById('statsAddBtn');
        this.clearBtn = document.getElementById('statsClearBtn');
        this.list = document.getElementById('statsList');
        this.countDisplay = document.getElementById('statsCount');
        this.sumDisplay = document.getElementById('statsSum');
        this.meanDisplay = document.getElementById('statsMean');
        this.medianDisplay = document.getElementById('statsMedian');
        this.modeDisplay = document.getElementById('statsMode');
        this.varianceDisplay = document.getElementById('statsVariance');
        this.stdDevDisplay = document.getElementById('statsStdDev');
    }

    attachListeners() {
        this.addBtn.addEventListener('click', () => this.addNumber());
        this.clearBtn.addEventListener('click', () => this.clearAll());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addNumber();
        });
    }

    addNumber() {
        const value = parseFloat(this.input.value);
        if (isNaN(value)) {
            alert('Please enter a valid number');
            return;
        }
        this.numbers.push(value);
        this.input.value = '';
        this.input.focus();
        this.updateDisplay();
    }

    clearAll() {
        this.numbers = [];
        this.updateDisplay();
    }

    updateDisplay() {
        // Display numbers
        if (this.numbers.length === 0) {
            this.list.innerHTML = 'No numbers yet';
        } else {
            this.list.innerHTML = this.numbers.map((num, idx) => `
                <div class="stats-item">
                    ${num}
                    <button onclick="stats.numbers.splice(${idx}, 1); stats.updateDisplay();">×</button>
                </div>
            `).join('');
        }

        // Calculate and display statistics
        this.countDisplay.textContent = this.numbers.length;
        this.sumDisplay.textContent = this.numbers.length > 0 ? this.sum().toFixed(4) : '0';
        this.meanDisplay.textContent = this.numbers.length > 0 ? this.mean().toFixed(4) : '0';
        this.medianDisplay.textContent = this.numbers.length > 0 ? this.median().toFixed(4) : '0';
        this.modeDisplay.textContent = this.numbers.length > 0 ? this.mode() : 'N/A';
        this.varianceDisplay.textContent = this.numbers.length > 0 ? this.variance().toFixed(4) : '0';
        this.stdDevDisplay.textContent = this.numbers.length > 0 ? this.standardDeviation().toFixed(4) : '0';
    }

    sum() {
        return this.numbers.reduce((a, b) => a + b, 0);
    }

    mean() {
        return this.numbers.length > 0 ? this.sum() / this.numbers.length : 0;
    }

    median() {
        const sorted = [...this.numbers].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }

    mode() {
        if (this.numbers.length === 0) return 'N/A';
        const frequency = {};
        this.numbers.forEach(num => {
            frequency[num] = (frequency[num] || 0) + 1;
        });
        const maxFreq = Math.max(...Object.values(frequency));
        if (maxFreq === 1) return 'No mode';
        const modes = Object.keys(frequency).filter(key => frequency[key] === maxFreq);
        return modes.length === this.numbers.length ? 'No mode' : modes.map(m => parseFloat(m).toFixed(2)).join(', ');
    }

    variance() {
        if (this.numbers.length === 0) return 0;
        const mean = this.mean();
        const squaredDiffs = this.numbers.map(num => Math.pow(num - mean, 2));
        return squaredDiffs.reduce((a, b) => a + b, 0) / this.numbers.length;
    }

    standardDeviation() {
        return Math.sqrt(this.variance());
    }
}

class EquationSolver {
    constructor() {
        this.initElements();
        this.attachListeners();
    }

    initElements() {
        this.input = document.getElementById('equationInput');
        this.solveBtn = document.getElementById('solveBtn');
        this.resultsDiv = document.getElementById('solverResults');
        this.solutionDiv = document.getElementById('solverSolution');
        this.stepsDiv = document.getElementById('solverSteps');
        this.errorDiv = document.getElementById('solverError');
    }

    attachListeners() {
        this.solveBtn.addEventListener('click', () => this.solveEquation());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.solveEquation();
        });
    }

    solveEquation() {
        const equation = this.input.value.trim();
        
        // Clear previous results
        this.resultsDiv.style.display = 'none';
        this.errorDiv.style.display = 'none';
        this.errorDiv.textContent = '';
        
        if (!equation) {
            this.showError('Please enter an equation');
            return;
        }

        try {
            // Parse equation: convert x² to x^2, normalize
            const normalizedEquation = equation.replace(/x²|x\^2/gi, 'x^2')
                                             .replace(/x³|x\^3/gi, 'x^3')
                                             .replace(/\s+/g, '')
                                             .toUpperCase();
            
            // Check if equation has "=" sign
            if (!normalizedEquation.includes('=')) {
                this.showError('Equation must contain "=" sign (e.g., 2x + 5 = 13)');
                return;
            }

            // Split by "="
            const [leftSide, rightSide] = normalizedEquation.split('=');
            
            // Convert to standard form: leftSide - rightSide = 0
            const standardForm = `${leftSide}-(${rightSide})`;
            
            // Expand and simplify
            const expanded = this.expandAndSimplify(standardForm);
            
            // Extract coefficients for ax^2 + bx + c
            const { isQuadratic, a, b, c, isLinear } = this.extractCoefficients(expanded);
            
            if (isQuadratic) {
                this.solveQuadratic(a, b, c);
            } else if (isLinear) {
                this.solveLinear(b, c);
            } else {
                this.showError('Invalid equation format. Please use linear (ax + b = 0) or quadratic (ax² + bx + c = 0) format');
            }
        } catch (error) {
            this.showError('Invalid equation: ' + error.message);
        }
    }

    expandAndSimplify(expr) {
        try {
            // Use math.js to evaluate the expression symbolically
            // For now, we'll do a simpler approach by checking for x terms
            return expr;
        } catch (e) {
            throw new Error('Failed to parse equation');
        }
    }

    extractCoefficients(equation) {
        // Convert to lowercase for parsing
        const eq = equation.toLowerCase().replace(/\s+/g, '');
        
        // Regex patterns
        const x2Pattern = /([+-]?\d*)\*?x\^2/g;
        const xPattern = /([+-]?\d*)\*?x(?!\^)/g;
        const constantPattern = /([+-]?\d+)(?![x\^])/g;
        
        let a = 0, b = 0, c = 0;
        
        // Extract x^2 coefficient
        let match;
        while ((match = x2Pattern.exec(eq)) !== null) {
            let coeff = match[1] === '' ? 1 : match[1] === '-' ? -1 : parseFloat(match[1]);
            a += coeff;
        }
        
        // Extract x coefficient
        while ((match = xPattern.exec(eq)) !== null) {
            let coeff = match[1] === '' ? 1 : match[1] === '-' ? -1 : parseFloat(match[1]);
            b += coeff;
        }
        
        // Simple constant extraction (this is approximate)
        // For more accuracy, we'd need full symbolic math
        let constants = [];
        let tempEq = eq.replace(/[+-]?\d*\.?\d*\*?x\^?2/g, '')
                       .replace(/[+-]?\d*\.?\d*\*?x/g, '');
        
        const parts = tempEq.match(/[+-]?\d+\.?\d*/g) || [];
        c = parts.reduce((sum, part) => sum + parseFloat(part), 0);
        
        return {
            a: parseFloat(a.toFixed(10)),
            b: parseFloat(b.toFixed(10)),
            c: parseFloat(c.toFixed(10)),
            isQuadratic: a !== 0,
            isLinear: a === 0 && b !== 0
        };
    }

    solveLinear(b, c) {
        if (b === 0) {
            this.showError('Invalid linear equation: coefficient of x cannot be zero');
            return;
        }
        
        // bx + c = 0 → x = -c/b
        const x = -c / b;
        
        this.displaySolution([x.toFixed(4)]);
        
        const steps = `
            <div class="solver-step">
                <strong>Linear Equation: ${b.toFixed(2)}x + ${c.toFixed(2)} = 0</strong>
            </div>
            <div class="solver-step">
                Step 1: Move constant to right side
                <br><code>${b.toFixed(2)}x = -${c.toFixed(2)}</code>
            </div>
            <div class="solver-step">
                Step 2: Divide by coefficient of x
                <br><code>x = -${c.toFixed(2)} / ${b.toFixed(2)}</code>
            </div>
            <div class="solver-step">
                <strong>Solution: x = ${x.toFixed(4)}</strong>
            </div>
        `;
        
        this.stepsDiv.innerHTML = steps;
        this.resultsDiv.style.display = 'block';
    }

    solveQuadratic(a, b, c) {
        if (a === 0) {
            this.showError('This is not a quadratic equation');
            return;
        }
        
        // Using quadratic formula: x = (-b ± √(b² - 4ac)) / 2a
        const discriminant = b * b - 4 * a * c;
        
        let solutions = [];
        if (discriminant > 0) {
            // Two real solutions
            const sqrtDisc = Math.sqrt(discriminant);
            const x1 = (-b + sqrtDisc) / (2 * a);
            const x2 = (-b - sqrtDisc) / (2 * a);
            solutions = [x1.toFixed(4), x2.toFixed(4)];
            
            this.displaySolution(solutions);
            
            const steps = `
                <div class="solver-step">
                    <strong>Quadratic Equation: ${a.toFixed(2)}x² + ${b.toFixed(2)}x + ${c.toFixed(2)} = 0</strong>
                </div>
                <div class="solver-step">
                    <strong>Quadratic Formula:</strong> x = (-b ± √(b² - 4ac)) / 2a
                </div>
                <div class="solver-step">
                    Step 1: Calculate discriminant (Δ)
                    <br><code>Δ = b² - 4ac</code>
                    <br><code>Δ = (${b.toFixed(2)})² - 4(${a.toFixed(2)})(${c.toFixed(2)})</code>
                    <br><code>Δ = ${(b * b).toFixed(2)} - ${(4 * a * c).toFixed(2)}</code>
                    <br><code>Δ = ${discriminant.toFixed(2)}</code>
                </div>
                <div class="solver-step">
                    Step 2: Since Δ > 0, there are two real solutions
                    <br><code>√Δ = √${discriminant.toFixed(2)} = ${Math.sqrt(discriminant).toFixed(4)}</code>
                </div>
                <div class="solver-step">
                    Step 3: Apply quadratic formula
                    <br><code>x₁ = (-${b.toFixed(2)} + ${Math.sqrt(discriminant).toFixed(4)}) / (2 × ${a.toFixed(2)})</code>
                    <br><code>x₁ = ${x1.toFixed(4)}</code>
                    <br><code>x₂ = (-${b.toFixed(2)} - ${Math.sqrt(discriminant).toFixed(4)}) / (2 × ${a.toFixed(2)})</code>
                    <br><code>x₂ = ${x2.toFixed(4)}</code>
                </div>
                <div class="solver-step" style="color: #28a745; font-weight: bold;">
                    <strong>Solutions: x₁ = ${x1.toFixed(4)}, x₂ = ${x2.toFixed(4)}</strong>
                </div>
            `;
            
            this.stepsDiv.innerHTML = steps;
        } else if (discriminant === 0) {
            // One repeated solution
            const x = -b / (2 * a);
            solutions = [x.toFixed(4)];
            
            this.displaySolution(solutions);
            
            const steps = `
                <div class="solver-step">
                    <strong>Quadratic Equation: ${a.toFixed(2)}x² + ${b.toFixed(2)}x + ${c.toFixed(2)} = 0</strong>
                </div>
                <div class="solver-step">
                    Step 1: Calculate discriminant
                    <br><code>Δ = ${discriminant.toFixed(2)}</code>
                </div>
                <div class="solver-step">
                    Step 2: Since Δ = 0, there is one repeated solution
                    <br><code>x = -b / 2a = -${b.toFixed(2)} / (2 × ${a.toFixed(2)})</code>
                    <br><code>x = ${x.toFixed(4)}</code>
                </div>
                <div class="solver-step" style="color: #28a745; font-weight: bold;">
                    <strong>Solution: x = ${x.toFixed(4)} (repeated root)</strong>
                </div>
            `;
            
            this.stepsDiv.innerHTML = steps;
        } else {
            // Complex solutions
            const realPart = (-b / (2 * a)).toFixed(4);
            const imagPart = (Math.sqrt(-discriminant) / (2 * a)).toFixed(4);
            
            this.displaySolution([
                `${realPart} + ${imagPart}i`,
                `${realPart} - ${imagPart}i`
            ]);
            
            const steps = `
                <div class="solver-step">
                    <strong>Quadratic Equation: ${a.toFixed(2)}x² + ${b.toFixed(2)}x + ${c.toFixed(2)} = 0</strong>
                </div>
                <div class="solver-step">
                    Step 1: Calculate discriminant
                    <br><code>Δ = ${discriminant.toFixed(2)}</code>
                </div>
                <div class="solver-step">
                    Step 2: Since Δ < 0, solutions are complex
                </div>
                <div class="solver-step">
                    Step 3: Apply quadratic formula with imaginary numbers
                    <br><code>x = (-b ± i√|Δ|) / 2a</code>
                </div>
                <div class="solver-step" style="color: #17a2b8; font-weight: bold;">
                    <strong>Solutions:</strong>
                    <br>x₁ = ${realPart} + ${imagPart}i
                    <br>x₂ = ${realPart} - ${imagPart}i
                </div>
            `;
            
            this.stepsDiv.innerHTML = steps;
        }
        
        this.resultsDiv.style.display = 'block';
    }

    displaySolution(solutions) {
        const solutionHTML = solutions.map((sol, i) => `
            <div class="solution-item">
                <strong>x${solutions.length > 1 ? (i + 1) : ''} = ${sol}</strong>
            </div>
        `).join('');
        
        this.solutionDiv.innerHTML = solutionHTML;
    }

    showError(message) {
        this.errorDiv.textContent = message;
        this.errorDiv.style.display = 'block';
    }
}

class ConstantsLibrary {
    constructor() {
        this.constants = {
            physics: [
                { name: 'Gravitational Constant', symbol: 'G', value: '6.67430e-11 m³·kg⁻¹·s⁻²' },
                { name: 'Speed of Light', symbol: 'c', value: '299792458 m/s' },
                { name: 'Planck Constant', symbol: 'h', value: '6.62607015e-34 J·s' },
                { name: 'Boltzmann Constant', symbol: 'k_B', value: '1.380649e-23 J/K' },
                { name: 'Elementary Charge', symbol: 'e', value: '1.602176634e-19 C' },
                { name: 'Avogadro Number', symbol: 'N_A', value: '6.02214076e23 mol⁻¹' },
            ],
            math: [
                { name: 'Pi', symbol: 'π', value: '3.14159265359' },
                { name: 'Euler Number', symbol: 'e', value: '2.71828182846' },
                { name: 'Golden Ratio', symbol: 'φ', value: '1.61803398875' },
                { name: 'Square Root of 2', symbol: '√2', value: '1.41421356237' },
                { name: 'Imaginary Unit', symbol: 'i', value: '√(-1)' },
            ],
            chemistry: [
                { name: 'Avogadro Number', symbol: 'N_A', value: '6.022e23' },
                { name: 'Faraday Constant', symbol: 'F', value: '96485.3 C/mol' },
                { name: 'Gas Constant', symbol: 'R', value: '8.314 J/(mol·K)' },
                { name: 'Molar Volume (STP)', symbol: 'V_m', value: '22.71 L/mol' },
                { name: 'Atomic Mass Unit', symbol: 'u', value: '1.66054e-27 kg' },
            ]
        };
        this.initElements();
        this.attachListeners();
        this.renderConstants();
    }

    initElements() {
        this.physicsContainer = document.getElementById('physicsConstants');
        this.mathContainer = document.getElementById('mathConstants');
        this.chemistryContainer = document.getElementById('chemistryConstants');
    }

    attachListeners() {
        // Listeners will be attached when constants are rendered
    }

    renderConstants() {
        this.physicsContainer.innerHTML = this.constants.physics.map(c => this.createConstantHTML(c)).join('');
        this.mathContainer.innerHTML = this.constants.math.map(c => this.createConstantHTML(c)).join('');
        this.chemistryContainer.innerHTML = this.constants.chemistry.map(c => this.createConstantHTML(c)).join('');

        // Attach click listeners
        document.querySelectorAll('.constant-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const symbol = e.currentTarget.querySelector('.constant-symbol').textContent.trim();
                calc.formula += symbol;
                calc.updateDisplay();
            });
        });
    }

    createConstantHTML(constant) {
        return `
            <div class="constant-item">
                <div class="constant-name">${constant.name}</div>
                <div class="constant-symbol">${constant.symbol}</div>
                <div class="constant-value">${constant.value}</div>
            </div>
        `;
    }
}

const calc = new Calculator();
const converter = new UnitConverter();
const programmer = new ProgrammerMode();
const stats = new Statistics();
const constants = new ConstantsLibrary();
const solver = new EquationSolver();

// Toggle between calculator, converter, and programmer mode
document.getElementById('converterToggle').addEventListener('click', () => {
    const calcSection = document.querySelector('.calculator');
    const historySection = document.querySelector('.history-section');
    const converterSection = document.getElementById('converterSection');
    const programmerSection = document.getElementById('programmerSection');
    const statsSection = document.getElementById('statsSection');
    const constantsSection = document.getElementById('constantsSection');
    
    const isConverterShown = converterSection.style.display !== 'none';
    
    calcSection.style.display = isConverterShown ? 'block' : 'none';
    historySection.style.display = isConverterShown ? 'block' : 'none';
    converterSection.style.display = isConverterShown ? 'none' : 'block';
    programmerSection.style.display = 'none';
    statsSection.style.display = 'none';
    constantsSection.style.display = 'none';
});

document.getElementById('programmerToggle').addEventListener('click', () => {
    const calcSection = document.querySelector('.calculator');
    const historySection = document.querySelector('.history-section');
    const converterSection = document.getElementById('converterSection');
    const programmerSection = document.getElementById('programmerSection');
    const statsSection = document.getElementById('statsSection');
    const constantsSection = document.getElementById('constantsSection');
    
    const isProgrammerShown = programmerSection.style.display !== 'none';
    
    calcSection.style.display = isProgrammerShown ? 'block' : 'none';
    historySection.style.display = isProgrammerShown ? 'block' : 'none';
    converterSection.style.display = 'none';
    programmerSection.style.display = isProgrammerShown ? 'none' : 'block';
    statsSection.style.display = 'none';
    constantsSection.style.display = 'none';
});

document.getElementById('statsToggle').addEventListener('click', () => {
    const calcSection = document.querySelector('.calculator');
    const historySection = document.querySelector('.history-section');
    const converterSection = document.getElementById('converterSection');
    const programmerSection = document.getElementById('programmerSection');
    const statsSection = document.getElementById('statsSection');
    const constantsSection = document.getElementById('constantsSection');
    
    const isStatsShown = statsSection.style.display !== 'none';
    
    calcSection.style.display = isStatsShown ? 'block' : 'none';
    historySection.style.display = isStatsShown ? 'block' : 'none';
    converterSection.style.display = 'none';
    programmerSection.style.display = 'none';
    statsSection.style.display = isStatsShown ? 'none' : 'block';
    constantsSection.style.display = 'none';
});

document.getElementById('constantsToggle').addEventListener('click', () => {
    const calcSection = document.querySelector('.calculator');
    const historySection = document.querySelector('.history-section');
    const converterSection = document.getElementById('converterSection');
    const programmerSection = document.getElementById('programmerSection');
    const statsSection = document.getElementById('statsSection');
    const constantsSection = document.getElementById('constantsSection');
    
    const isConstantsShown = constantsSection.style.display !== 'none';
    
    calcSection.style.display = isConstantsShown ? 'block' : 'none';
    historySection.style.display = isConstantsShown ? 'block' : 'none';
    converterSection.style.display = 'none';
    programmerSection.style.display = 'none';
    statsSection.style.display = 'none';
    constantsSection.style.display = isConstantsShown ? 'none' : 'block';
});

document.getElementById('solverToggle').addEventListener('click', () => {
    const calcSection = document.querySelector('.calculator');
    const historySection = document.querySelector('.history-section');
    const converterSection = document.getElementById('converterSection');
    const programmerSection = document.getElementById('programmerSection');
    const statsSection = document.getElementById('statsSection');
    const constantsSection = document.getElementById('constantsSection');
    const solverSection = document.getElementById('solverSection');
    
    const isSolverShown = solverSection.style.display !== 'none';
    
    calcSection.style.display = isSolverShown ? 'block' : 'none';
    historySection.style.display = isSolverShown ? 'block' : 'none';
    converterSection.style.display = 'none';
    programmerSection.style.display = 'none';
    statsSection.style.display = 'none';
    constantsSection.style.display = 'none';
    solverSection.style.display = isSolverShown ? 'none' : 'block';
});