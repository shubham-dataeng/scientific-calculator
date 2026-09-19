/**
 * Scientific Calculator Engine - Evaluator
 * Evaluates AST with domain checking, angle modes, variable scopes, and multi-format outputs.
 */

import { MathFormat } from './fractions.js';
import { Parser } from './parser.js';

export class Evaluator {
    constructor(options = {}) {
        this.angleMode = options.angleMode || 'deg'; // 'deg', 'rad', 'grad'
        this.precision = options.precision !== undefined ? options.precision : 4;
        this.variables = {
            pi: Math.PI,
            π: Math.PI,
            e: Math.E,
            phi: (1 + Math.sqrt(5)) / 2,
            φ: (1 + Math.sqrt(5)) / 2,
            tau: 2 * Math.PI,
            ans: 0,
            ...(options.variables || {})
        };
    }

    setAngleMode(mode) {
        if (['deg', 'rad', 'grad'].includes(mode)) {
            this.angleMode = mode;
        }
    }

    setPrecision(precision) {
        this.precision = Math.max(0, Math.min(16, precision));
    }

    setVariable(name, value) {
        this.variables[name] = value;
    }

    getVariable(name) {
        return this.variables[name];
    }

    /**
     * Parse and evaluate input expression string directly.
     */
    evaluate(expression) {
        if (!expression || !expression.trim()) {
            return this.formatResult(0);
        }

        const ast = Parser.parse(expression);
        const rawValue = this.evaluateNode(ast);

        if (typeof rawValue === 'number') {
            this.variables.ans = rawValue;
            return this.formatResult(rawValue);
        }

        return rawValue;
    }

    evaluateNode(node) {
        switch (node.type) {
            case 'Number':
                return node.value;

            case 'Identifier':
                const id = node.name.toLowerCase();
                if (this.variables.hasOwnProperty(id)) {
                    return this.variables[id];
                }
                if (this.variables.hasOwnProperty(node.name)) {
                    return this.variables[node.name];
                }
                throw new Error(`Undefined variable or constant '${node.name}'`);

            case 'Assignment':
                const val = this.evaluateNode(node.expr);
                this.variables[node.variableName] = val;
                this.variables.ans = val;
                return val;

            case 'UnaryOp':
                const arg = this.evaluateNode(node.argument);
                if (node.op === '+') return +arg;
                if (node.op === '-') return -arg;
                throw new Error(`Unknown unary operator '${node.op}'`);

            case 'PostfixOp':
                const baseVal = this.evaluateNode(node.argument);
                if (node.op === '!') {
                    return this.factorial(baseVal);
                }
                if (node.op === '%') {
                    return baseVal / 100;
                }
                throw new Error(`Unknown postfix operator '${node.op}'`);

            case 'BinaryOp':
                return this.evaluateBinaryOp(node.op, node.left, node.right);

            case 'FunctionCall':
                return this.evaluateFunctionCall(node.name, node.args);

            default:
                throw new Error(`Unknown AST node type '${node.type}'`);
        }
    }

    evaluateBinaryOp(op, leftNode, rightNode) {
        const left = this.evaluateNode(leftNode);
        const right = this.evaluateNode(rightNode);

        switch (op) {
            case '+':
                return MathFormat.cleanFloat(left + right);

            case '-':
                return MathFormat.cleanFloat(left - right);

            case '*':
                return MathFormat.cleanFloat(left * right);

            case '/':
                if (right === 0) {
                    if (left === 0) {
                        throw new Error('Indeterminate form: 0 / 0 is undefined');
                    }
                    throw new Error(`Cannot divide by zero: ${left} / 0 is undefined`);
                }
                return MathFormat.cleanFloat(left / right);

            case '%':
                if (right === 0) {
                    throw new Error('Modulo by zero is undefined');
                }
                return left % right;

            case '^':
                if (left === 0 && right === 0) {
                    throw new Error('0⁰ is mathematically indeterminate');
                }
                if (left < 0 && !Number.isInteger(right)) {
                    throw new Error(`Negative base (${left}) with non-integer exponent (${right}) is not real`);
                }
                return MathFormat.cleanFloat(Math.pow(left, right));

            default:
                throw new Error(`Unsupported binary operator '${op}'`);
        }
    }

    evaluateFunctionCall(name, argNodes) {
        const fn = name.toLowerCase();
        const args = argNodes.map(arg => this.evaluateNode(arg));

        // Trigonometric functions
        if (['sin', 'cos', 'tan', 'sec', 'csc', 'cot'].includes(fn)) {
            if (args.length !== 1) throw new Error(`${name}() expects exactly 1 argument`);
            return this.evalTrig(fn, args[0]);
        }

        // Inverse Trigonometric functions
        if (['asin', 'acos', 'atan'].includes(fn)) {
            if (args.length !== 1) throw new Error(`${name}() expects exactly 1 argument`);
            return this.evalInvTrig(fn, args[0]);
        }

        // Hyperbolic functions
        if (['sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh'].includes(fn)) {
            if (args.length !== 1) throw new Error(`${name}() expects exactly 1 argument`);
            return this.evalHyperbolic(fn, args[0]);
        }

        // Logarithms
        if (fn === 'log' || fn === 'log10') {
            if (args.length !== 1) throw new Error(`${name}() expects exactly 1 argument`);
            if (args[0] <= 0) throw new Error(`log(${args[0]}) is undefined for non-positive values`);
            return MathFormat.cleanFloat(Math.log10(args[0]));
        }

        if (fn === 'ln') {
            if (args.length !== 1) throw new Error(`ln() expects exactly 1 argument`);
            if (args[0] <= 0) throw new Error(`ln(${args[0]}) is undefined for non-positive values`);
            return MathFormat.cleanFloat(Math.log(args[0]));
        }

        if (fn === 'log2') {
            if (args.length !== 1) throw new Error(`log2() expects exactly 1 argument`);
            if (args[0] <= 0) throw new Error(`log2(${args[0]}) is undefined for non-positive values`);
            return MathFormat.cleanFloat(Math.log2(args[0]));
        }

        // Roots & Powers
        if (fn === 'sqrt') {
            if (args.length !== 1) throw new Error(`sqrt() expects exactly 1 argument`);
            if (args[0] < 0) throw new Error(`√(${args[0]}) is not defined in real-number mode`);
            return MathFormat.cleanFloat(Math.sqrt(args[0]));
        }

        if (fn === 'cbrt') {
            if (args.length !== 1) throw new Error(`cbrt() expects exactly 1 argument`);
            return MathFormat.cleanFloat(Math.cbrt(args[0]));
        }

        if (fn === 'abs') {
            if (args.length !== 1) throw new Error(`abs() expects exactly 1 argument`);
            return Math.abs(args[0]);
        }

        if (fn === 'exp') {
            if (args.length !== 1) throw new Error(`exp() expects exactly 1 argument`);
            return MathFormat.cleanFloat(Math.exp(args[0]));
        }

        // Rounding
        if (fn === 'round') {
            if (args.length === 1) return Math.round(args[0]);
            if (args.length === 2) {
                const f = Math.pow(10, args[1]);
                return Math.round(args[0] * f) / f;
            }
            throw new Error(`round() expects 1 or 2 arguments`);
        }

        if (fn === 'floor') return Math.floor(args[0]);
        if (fn === 'ceil') return Math.ceil(args[0]);

        // Combinatorics & Number theory
        if (fn === 'fact' || fn === 'factorial') {
            if (args.length !== 1) throw new Error(`fact() expects 1 argument`);
            return this.factorial(args[0]);
        }

        if (fn === 'npr') {
            if (args.length !== 2) throw new Error(`nPr(n, r) expects 2 arguments`);
            const [n, r] = args;
            if (r > n || n < 0 || r < 0) throw new Error(`Invalid arguments for nPr: n must be >= r >= 0`);
            return this.factorial(n) / this.factorial(n - r);
        }

        if (fn === 'ncr') {
            if (args.length !== 2) throw new Error(`nCr(n, r) expects 2 arguments`);
            const [n, r] = args;
            if (r > n || n < 0 || r < 0) throw new Error(`Invalid arguments for nCr: n must be >= r >= 0`);
            return this.factorial(n) / (this.factorial(r) * this.factorial(n - r));
        }

        if (fn === 'gcd') {
            if (args.length !== 2) throw new Error(`gcd(a, b) expects 2 arguments`);
            return MathFormat.gcd(args[0], args[1]);
        }

        if (fn === 'lcm') {
            if (args.length !== 2) throw new Error(`lcm(a, b) expects 2 arguments`);
            return MathFormat.lcm(args[0], args[1]);
        }

        throw new Error(`Unknown function '${name}()'`);
    }

    evalTrig(fn, val) {
        let rad = val;
        if (this.angleMode === 'deg') {
            rad = val * (Math.PI / 180);
            // Handle exact angle cases to eliminate floating point noise (e.g. sin(180) -> 0, cos(90) -> 0)
            const normalizedDeg = ((val % 360) + 360) % 360;
            if (fn === 'sin') {
                if (normalizedDeg === 0 || normalizedDeg === 180 || normalizedDeg === 360) return 0;
                if (normalizedDeg === 30 || normalizedDeg === 150) return 0.5;
                if (normalizedDeg === 90) return 1;
                if (normalizedDeg === 270) return -1;
            }
            if (fn === 'cos') {
                if (normalizedDeg === 90 || normalizedDeg === 270) return 0;
                if (normalizedDeg === 60 || normalizedDeg === 300) return 0.5;
                if (normalizedDeg === 0 || normalizedDeg === 360) return 1;
                if (normalizedDeg === 180) return -1;
            }
            if (fn === 'tan') {
                if (normalizedDeg === 90 || normalizedDeg === 270) {
                    throw new Error(`tan(${val}°) is undefined (vertical asymptote)`);
                }
                if (normalizedDeg === 0 || normalizedDeg === 180 || normalizedDeg === 360) return 0;
                if (normalizedDeg === 45 || normalizedDeg === 225) return 1;
                if (normalizedDeg === 135 || normalizedDeg === 315) return -1;
            }
        } else if (this.angleMode === 'grad') {
            rad = val * (Math.PI / 200);
            const normalizedGrad = ((val % 400) + 400) % 400;
            if (fn === 'tan' && (normalizedGrad === 100 || normalizedGrad === 300)) {
                throw new Error(`tan(${val} grad) is undefined (vertical asymptote)`);
            }
        }

        let res;
        switch (fn) {
            case 'sin': res = Math.sin(rad); break;
            case 'cos': res = Math.cos(rad); break;
            case 'tan': res = Math.tan(rad); break;
            case 'sec': res = 1 / Math.cos(rad); break;
            case 'csc': res = 1 / Math.sin(rad); break;
            case 'cot': res = 1 / Math.tan(rad); break;
        }

        return MathFormat.cleanFloat(res);
    }

    evalInvTrig(fn, val) {
        if ((fn === 'asin' || fn === 'acos') && (val < -1 || val > 1)) {
            throw new Error(`Domain error: ${fn}(${val}) requires -1 ≤ x ≤ 1`);
        }

        let rad;
        if (fn === 'asin') rad = Math.asin(val);
        else if (fn === 'acos') rad = Math.acos(val);
        else if (fn === 'atan') rad = Math.atan(val);

        if (this.angleMode === 'deg') {
            return MathFormat.cleanFloat(rad * (180 / Math.PI));
        } else if (this.angleMode === 'grad') {
            return MathFormat.cleanFloat(rad * (200 / Math.PI));
        }
        return MathFormat.cleanFloat(rad);
    }

    evalHyperbolic(fn, val) {
        switch (fn) {
            case 'sinh': return MathFormat.cleanFloat(Math.sinh(val));
            case 'cosh': return MathFormat.cleanFloat(Math.cosh(val));
            case 'tanh': return MathFormat.cleanFloat(Math.tanh(val));
            case 'asinh': return MathFormat.cleanFloat(Math.asinh(val));
            case 'acosh':
                if (val < 1) throw new Error(`Domain error: acosh(${val}) requires x ≥ 1`);
                return MathFormat.cleanFloat(Math.acosh(val));
            case 'atanh':
                if (val <= -1 || val >= 1) throw new Error(`Domain error: atanh(${val}) requires -1 < x < 1`);
                return MathFormat.cleanFloat(Math.atanh(val));
        }
    }

    factorial(n) {
        if (!Number.isInteger(n) || n < 0) {
            throw new Error(`Factorial is only defined for non-negative integers (received ${n})`);
        }
        if (n > 170) {
            return Infinity; // Overflow for IEEE-754 double precision
        }
        let res = 1;
        for (let i = 2; i <= n; i++) {
            res *= i;
        }
        return res;
    }

    /**
     * Convert numeric result to all presentation formats
     */
    formatResult(val) {
        if (typeof val !== 'number') {
            return {
                value: val,
                decimal: String(val),
                fraction: null,
                scientific: String(val),
                engineering: String(val),
                percentage: null,
                exact: null
            };
        }

        // Clean precision
        const cleaned = MathFormat.cleanFloat(val);

        // Format decimal
        let decStr;
        if (!isFinite(cleaned)) {
            decStr = cleaned > 0 ? 'Infinity' : '-Infinity';
        } else {
            const factor = Math.pow(10, this.precision);
            const rounded = Math.round(cleaned * factor) / factor;
            decStr = rounded.toString();
        }

        // Exact fraction
        const frac = MathFormat.toFraction(cleaned);

        // Scientific & Engineering
        const sciStr = isFinite(cleaned) ? cleaned.toExponential(this.precision) : decStr;
        const engStr = isFinite(cleaned) ? MathFormat.toEngineering(cleaned, this.precision) : decStr;

        // Percentage
        const pctStr = isFinite(cleaned) ? `${MathFormat.cleanFloat(cleaned * 100)}%` : null;

        // Exact radical or symbolic representation
        const exact = MathFormat.toExactSymbolic(cleaned);

        return {
            value: cleaned,
            decimal: decStr,
            fraction: frac ? frac.string : null,
            scientific: sciStr,
            engineering: engStr,
            percentage: pctStr,
            exact: exact
        };
    }
}
