// Web Worker - runs calculations in background thread
// Keeps the main UI thread responsive by offloading heavy math.js operations



self.onmessage = function(event) {
    // Receive calculation request from main thread
    const { id, expression, precision } = event.data;
    
    try {
        // Check if expression is safe before evaluating
        if (!isValidExpression(expression)) {
            throw new Error('Invalid expression format');
        }
        
        // Evaluate the mathematical expression
        const result = evaluateExpression(expression, precision);
        
        // Send back the result to main thread
        self.postMessage({
            id: id,
            result: result,
            error: null
        });
        
    } catch (error) {
        // Send back error message if something goes wrong
        self.postMessage({
            id: id,
            result: null,
            error: error.message
        });
    }
};

// Security check - only allow safe mathematical expressions
function isValidExpression(expr) {
    // Block anything that looks suspicious
    const validPattern = /^[\d+\-*/(). sincostan logeπxabcfghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ^!√∛%\s]*$/;
    return validPattern.test(expr);
}

// Parse and evaluate expression with proper precision
function evaluateExpression(expr, precision = 4) {
    try {
        // Convert display symbols to JavaScript format
        let cleanExpr = expr
            .replace(/π/g, Math.PI)
            .replace(/e/g, Math.E)
            .replace(/\^/g, '**')
            .replace(/÷/g, '/')
            .replace(/×/g, '*')
            .replace(/−/g, '-');
        
        // Evaluate using Function constructor (safer than eval)
        let result = Function('"use strict"; return (' + cleanExpr + ')')();
        
        // Apply precision rounding
        const roundingFactor = Math.pow(10, precision);
        result = Math.round(result * roundingFactor) / roundingFactor;
        
        return result;
        
    } catch (error) {
        throw new Error('Calculation failed: ' + error.message);
    }
}
