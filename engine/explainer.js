/**
 * Scientific Calculator Engine - Explainable Step-by-Step Reduction
 * Generates transparent mathematical step reductions based on BODMAS / PEMDAS order of operations.
 */

import { Parser } from './parser.js';
import { Evaluator } from './evaluator.js';

export class Explainer {
    constructor(evaluator = new Evaluator()) {
        this.evaluator = evaluator;
    }

    /**
     * Generate step-by-step reduction of the given mathematical expression.
     */
    explain(expression) {
        if (!expression || !expression.trim()) return [];

        const steps = [];
        try {
            const ast = Parser.parse(expression);
            const finalVal = this.evaluator.evaluateNode(ast);

            // Reconstruct and reduce expressions step-by-step
            this.generateSteps(ast, steps);

            // Format final step if steps were produced
            const finalResult = this.evaluator.formatResult(finalVal);
            return {
                original: expression,
                steps: steps,
                result: finalResult
            };
        } catch (err) {
            return {
                original: expression,
                steps: [{ description: `Cannot generate steps: ${err.message}`, expression: expression }],
                result: null
            };
        }
    }

    generateSteps(node, steps) {
        if (!node) return;

        // Post-order traversal to solve deeper expressions first
        if (node.type === 'FunctionCall') {
            node.args.forEach(arg => this.generateSteps(arg, steps));
            const argVals = node.args.map(arg => this.evaluator.evaluateNode(arg));
            const res = this.evaluator.evaluateFunctionCall(node.name, node.args);
            steps.push({
                rule: 'Function Evaluation',
                description: `Compute function ${node.name}(${argVals.join(', ')})`,
                stepExpression: `${node.name}(${argVals.join(', ')}) = ${res}`,
                value: res
            });
            return;
        }

        if (node.type === 'PostfixOp') {
            this.generateSteps(node.argument, steps);
            const argVal = this.evaluator.evaluateNode(node.argument);
            const res = node.op === '!' ? this.evaluator.factorial(argVal) : argVal / 100;
            steps.push({
                rule: node.op === '!' ? 'Factorial' : 'Percentage',
                description: `Calculate ${argVal}${node.op}`,
                stepExpression: `${argVal}${node.op} = ${res}`,
                value: res
            });
            return;
        }

        if (node.type === 'BinaryOp') {
            // First reduce children
            if (node.left.type === 'BinaryOp' || node.left.type === 'FunctionCall') {
                this.generateSteps(node.left, steps);
            }
            if (node.right.type === 'BinaryOp' || node.right.type === 'FunctionCall') {
                this.generateSteps(node.right, steps);
            }

            const leftVal = this.evaluator.evaluateNode(node.left);
            const rightVal = this.evaluator.evaluateNode(node.right);
            const res = this.evaluator.evaluateBinaryOp(node.op, node.left, node.right);

            const ruleName =
                node.op === '^' ? 'Orders / Exponents (O)' :
                (node.op === '*' || node.op === '/' || node.op === '%') ? 'Division & Multiplication (D/M)' :
                'Addition & Subtraction (A/S)';

            steps.push({
                rule: ruleName,
                description: `Perform ${this.opName(node.op)}: ${leftVal} ${node.op} ${rightVal}`,
                stepExpression: `${leftVal} ${node.op} ${rightVal} = ${res}`,
                value: res
            });
            return;
        }
    }

    opName(op) {
        switch (op) {
            case '+': return 'addition';
            case '-': return 'subtraction';
            case '*': return 'multiplication';
            case '/': return 'division';
            case '%': return 'modulo';
            case '^': return 'exponentiation';
            default: return 'operation';
        }
    }
}
