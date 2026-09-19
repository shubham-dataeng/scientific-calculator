/**
 * Scientific Calculator - Compatibility Bridge & Legacy API Adapter
 * Bridges legacy script API to the modern AST Evaluator & Engine.
 */

import { Evaluator } from './engine/evaluator.js';
import { Explainer } from './engine/explainer.js';
import { Parser } from './engine/parser.js';

export class Calculator {
    constructor() {
        this.formula = '0';
        this.result = '0';
        const hasStorage = typeof localStorage !== 'undefined';
        this.angleMode = hasStorage ? (localStorage.getItem('calc_angle_mode') || 'deg') : 'deg';
        this.precision = hasStorage ? (Number(localStorage.getItem('calc_precision')) || 4) : 4;
        this.evaluator = new Evaluator({ angleMode: this.angleMode, precision: this.precision });
        this.explainer = new Explainer(this.evaluator);
    }

    calculate() {
        try {
            if (!this.formula || this.formula.trim() === '' || this.formula === '0') {
                this.result = '0';
                return '0';
            }
            this.evaluator.setAngleMode(this.angleMode);
            this.evaluator.setPrecision(this.precision);
            const res = this.evaluator.evaluate(this.formula);
            this.result = res.decimal;
            return this.result;
        } catch (err) {
            this.result = `Invalid Expression: ${err.message}`;
            return this.result;
        }
    }

    clear() {
        this.formula = '0';
        this.result = '0';
    }

    delete() {
        this.formula = this.formula.slice(0, -1) || '0';
    }
}

// Attach globally for backward compatibility in browsers
if (typeof window !== 'undefined') {
    window.Calculator = Calculator;
    window.calc = new Calculator();
}