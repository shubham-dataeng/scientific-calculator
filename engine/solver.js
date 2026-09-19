/**
 * Scientific Calculator Engine - Equation Solver
 * Solves linear equations, quadratic equations with full derivations, and general non-linear equations.
 */

import { Parser } from './parser.js';
import { Evaluator } from './evaluator.js';
import { MathFormat } from './fractions.js';

export class EquationSolver {
    constructor() {
        this.evaluator = new Evaluator();
    }

    /**
     * Solve an algebraic equation (e.g. "2x + 5 = 15", "x^2 - 5x + 6 = 0", "3(x - 2) = x + 4")
     */
    solve(equationStr) {
        if (!equationStr || !equationStr.trim()) {
            throw new Error('Please enter an equation to solve.');
        }

        let eq = equationStr
            .replace(/x²/gi, 'x^2')
            .replace(/x³/gi, 'x^3')
            .trim();

        if (!eq.includes('=')) {
            // Default to "... = 0" if no equals sign provided
            eq += ' = 0';
        }

        const parts = eq.split('=');
        if (parts.length !== 2) {
            throw new Error('Equation must contain exactly one "=" sign.');
        }

        const lhsStr = parts[0].trim();
        const rhsStr = parts[1].trim();

        if (!lhsStr || !rhsStr) {
            throw new Error('Both sides of the equation must contain an expression.');
        }

        // Standard form: f(x) = LHS - (RHS) = 0
        const fStr = `(${lhsStr}) - (${rhsStr})`;

        // Check polynomial coefficients by evaluating f(x) at select points
        // For f(x) = a*x^2 + b*x + c:
        // f(0) = c
        // f(1) = a + b + c  => a + b = f(1) - c
        // f(-1) = a - b + c => a - b = f(-1) - c
        // => 2a = (f(1) - c) + (f(-1) - c) = f(1) + f(-1) - 2c => a = (f(1) + f(-1) - 2*f(0)) / 2
        // => 2b = (f(1) - c) - (f(-1) - c) = f(1) - f(-1)      => b = (f(1) - f(-1)) / 2
        // We verify if f(2) == a*(4) + b*(2) + c to ensure it's truly at most degree 2!

        const f = (xVal) => {
            this.evaluator.setVariable('x', xVal);
            this.evaluator.setVariable('X', xVal);
            return this.evaluator.evaluate(fStr).value;
        };

        try {
            const f0 = f(0);
            const f1 = f(1);
            const fn1 = f(-1);
            const f2 = f(2);
            const f3 = f(3);

            const a = MathFormat.cleanFloat((f1 + fn1 - 2 * f0) / 2);
            const b = MathFormat.cleanFloat((f1 - fn1) / 2);
            const c = MathFormat.cleanFloat(f0);

            // Verify if quadratic or linear model holds accurately at sample points
            const modelAt2 = MathFormat.cleanFloat(a * 4 + b * 2 + c);
            const modelAt3 = MathFormat.cleanFloat(a * 9 + b * 3 + c);

            const isPolynomial = Math.abs(modelAt2 - f2) < 1e-5 && Math.abs(modelAt3 - f3) < 1e-5;

            if (isPolynomial) {
                if (Math.abs(a) > 1e-8) {
                    return this.solveQuadratic(a, b, c, eq);
                } else if (Math.abs(b) > 1e-8) {
                    return this.solveLinear(b, c, eq);
                } else {
                    if (Math.abs(c) < 1e-8) {
                        return {
                            type: 'identity',
                            solutions: ['All real numbers (x ∈ ℝ)'],
                            steps: ['Both sides are algebraically identical for all values of x.']
                        };
                    } else {
                        return {
                            type: 'contradiction',
                            solutions: ['No solution (contradiction)'],
                            steps: [`Simplifies to ${c} = 0, which is false for all x.`]
                        };
                    }
                }
            }

            // If not a simple quadratic/linear, attempt numerical root finding
            return this.solveNumerical(f, eq);
        } catch (err) {
            throw new Error(`Solving failed: ${err.message}`);
        }
    }

    solveLinear(b, c, originalEquation) {
        // b*x + c = 0 => x = -c / b
        const x = -c / b;
        const frac = MathFormat.toFraction(x);
        const xDisplay = frac ? frac.string : MathFormat.cleanFloat(x).toString();

        const steps = [
            `Standard Form: ${b}x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)} = 0`,
            `Subtract constant term: ${b}x = ${-c}`,
            `Divide by coefficient of x (${b}): x = ${-c} / ${b}`,
            `Final Solution: x = ${xDisplay}`
        ];

        return {
            type: 'linear',
            equation: originalEquation,
            solutions: [xDisplay],
            numericSolutions: [x],
            steps: steps
        };
    }

    solveQuadratic(a, b, c, originalEquation) {
        // a*x^2 + b*x + c = 0
        const discriminant = MathFormat.cleanFloat(b * b - 4 * a * c);
        const steps = [
            `Standard Quadratic Form: ${a}x² ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)} = 0`,
            `Identify coefficients: a = ${a}, b = ${b}, c = ${c}`,
            `Compute Discriminant: Δ = b² - 4ac = (${b})² - 4(${a})(${c}) = ${discriminant}`
        ];

        let solutions = [];
        let numericSolutions = [];

        if (discriminant > 0) {
            const sqrtDelta = Math.sqrt(discriminant);
            const x1 = (-b + sqrtDelta) / (2 * a);
            const x2 = (-b - sqrtDelta) / (2 * a);
            numericSolutions = [x1, x2];

            const frac1 = MathFormat.toFraction(x1);
            const frac2 = MathFormat.toFraction(x2);
            const disp1 = frac1 ? frac1.string : MathFormat.cleanFloat(x1).toString();
            const disp2 = frac2 ? frac2.string : MathFormat.cleanFloat(x2).toString();
            solutions = [`x₁ = ${disp1}`, `x₂ = ${disp2}`];

            steps.push(`Since Δ > 0, there are two distinct real roots.`);
            steps.push(`Apply Quadratic Formula: x = (-b ± √Δ) / 2a`);
            steps.push(`x₁ = (-(${b}) + √${discriminant}) / (2 × ${a}) = ${disp1}`);
            steps.push(`x₂ = (-(${b}) - √${discriminant}) / (2 × ${a}) = ${disp2}`);
        } else if (discriminant === 0) {
            const x = -b / (2 * a);
            numericSolutions = [x];
            const frac = MathFormat.toFraction(x);
            const disp = frac ? frac.string : MathFormat.cleanFloat(x).toString();
            solutions = [`x = ${disp} (repeated root)`];

            steps.push(`Since Δ = 0, there is exactly one repeated real root.`);
            steps.push(`x = -b / 2a = -(${b}) / (2 × ${a}) = ${disp}`);
        } else {
            // Complex roots
            const realPart = MathFormat.cleanFloat(-b / (2 * a));
            const imagPart = MathFormat.cleanFloat(Math.sqrt(-discriminant) / (2 * a));
            solutions = [
                `x₁ = ${realPart} + ${Math.abs(imagPart)}i`,
                `x₂ = ${realPart} - ${Math.abs(imagPart)}i`
            ];

            steps.push(`Since Δ < 0, roots are complex conjugates.`);
            steps.push(`Real part: -b / 2a = ${realPart}`);
            steps.push(`Imaginary part: √|Δ| / 2a = ${Math.abs(imagPart)}i`);
            steps.push(`Roots: ${solutions.join(', ')}`);
        }

        return {
            type: 'quadratic',
            equation: originalEquation,
            discriminant: discriminant,
            solutions: solutions,
            numericSolutions: numericSolutions,
            steps: steps
        };
    }

    /**
     * Solve general equation numerically using Newton-Raphson with bisection fallback
     */
    solveNumerical(f, originalEquation) {
        const roots = [];
        // Scan intervals from -20 to 20 to find sign changes
        const start = -20;
        const end = 20;
        const step = 0.5;

        for (let x = start; x < end; x += step) {
            const y1 = f(x);
            const y2 = f(x + step);

            if (isFinite(y1) && isFinite(y2)) {
                if (Math.abs(y1) < 1e-7) {
                    if (!roots.some(r => Math.abs(r - x) < 0.01)) roots.push(x);
                } else if (y1 * y2 < 0) {
                    // Bisection
                    let low = x;
                    let high = x + step;
                    for (let iter = 0; iter < 50; iter++) {
                        const mid = (low + high) / 2;
                        const ym = f(mid);
                        if (Math.abs(ym) < 1e-9 || (high - low) < 1e-9) {
                            if (!roots.some(r => Math.abs(r - mid) < 0.01)) roots.push(mid);
                            break;
                        }
                        if (y1 * ym < 0) {
                            high = mid;
                        } else {
                            low = mid;
                        }
                    }
                }
            }
        }

        if (roots.length === 0) {
            return {
                type: 'numerical',
                equation: originalEquation,
                solutions: ['No real roots detected in range [-20, 20]'],
                steps: ['Scanned search domain [-20, 20] using root-bracketing algorithm.']
            };
        }

        const formatted = roots.map((r, i) => `x${roots.length > 1 ? (i + 1) : ''} ≈ ${MathFormat.cleanFloat(r, 6)}`);
        return {
            type: 'numerical',
            equation: originalEquation,
            solutions: formatted,
            numericSolutions: roots,
            steps: [
                `Non-linear / transcendental equation detected.`,
                `Applied numerical root-bracketing and bisection algorithm.`,
                `Found ${roots.length} real root(s): ${formatted.join(', ')}`
            ]
        };
    }
}
