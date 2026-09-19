/**
 * Web Worker - Background Calculation Engine
 * Safely evaluates mathematical expressions in worker thread using the AST engine.
 */

import { Evaluator } from './engine/evaluator.js';

const evaluator = new Evaluator();

self.onmessage = function(event) {
    const { id, expression, angleMode, precision } = event.data;

    try {
        if (angleMode) evaluator.setAngleMode(angleMode);
        if (precision !== undefined) evaluator.setPrecision(precision);

        const result = evaluator.evaluate(expression);

        self.postMessage({
            id: id,
            result: result,
            error: null
        });
    } catch (error) {
        self.postMessage({
            id: id,
            result: null,
            error: error.message
        });
    }
};
