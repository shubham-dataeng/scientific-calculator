/**
 * SCIENTIFIC CALCULATOR - PERFORMANCE OPTIMIZATION
 * Web Worker for Async Math Calculations
 * 
 * Offloads heavy math.js calculations to background thread
 * Keeps UI responsive during complex operations
 */

self.onmessage = function(event) {
    const { id, expression, precision } = event.data;
    
    try {
        // Simulate math.js evaluation in worker
        // In production, math.js would be loaded here
        
        // For now, use native JavaScript evaluation with safety checks
        let result;
        
        // Parse expression safely
        if (isValidExpression(expression)) {
            result = evaluateExpression(expression, precision);
        } else {
            throw new Error('Invalid expression');
        }
        
        // Send result back to main thread
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

/**
 * VALIDATE EXPRESSION - Prevent injection attacks
 */
function isValidExpression(expr) {
    // Only allow numbers, operators, functions, parentheses
    const validPattern = /^[\d+\-*/(). sincostan logeπxabcfghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ^!√∛%\s]*$/;
    return validPattern.test(expr);
}

/**
 * EVALUATE EXPRESSION - Basic math operations
 * Note: For full functionality, math.js should be loaded in worker
 */
function evaluateExpression(expr, precision = 4) {
    try {
        // Replace symbols with valid JavaScript
        let cleanExpr = expr
            .replace(/π/g, Math.PI)
            .replace(/e/g, Math.E)
            .replace(/\^/g, '**')
            .replace(/÷/g, '/')
            .replace(/×/g, '*')
            .replace(/−/g, '-');
        
        // Evaluate (note: in production use math.js instead of eval)
        let result = Function('"use strict"; return (' + cleanExpr + ')')();
        
        // Apply precision
        const factor = Math.pow(10, precision);
        result = Math.round(result * factor) / factor;
        
        return result;
        
    } catch (error) {
        throw new Error('Calculation failed: ' + error.message);
    }
}
