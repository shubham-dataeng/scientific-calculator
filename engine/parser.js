/**
 * Scientific Calculator Engine - Pratt / Recursive Descent Parser
 * Handles operator precedence, implicit multiplication, superscripts, and syntax diagnostics.
 */

import { TokenType, Lexer } from './tokens.js';
import {
    NumberNode,
    IdentifierNode,
    BinaryOpNode,
    UnaryOpNode,
    PostfixOpNode,
    FunctionCallNode,
    AssignmentNode
} from './ast.js';

export class Parser {
    constructor(tokens, inputString = '') {
        this.tokens = tokens || [];
        this.inputString = inputString;
        this.pos = 0;
    }

    static parse(input) {
        const lexer = new Lexer(input);
        const tokens = lexer.tokenize();
        const parser = new Parser(tokens, input);
        return parser.parseExpression();
    }

    /**
     * Validate expression for live editor intelligence without throwing uncaught exceptions.
     */
    static validate(input) {
        if (!input || !input.trim()) {
            return { isValid: false, isIncomplete: true, error: null, ast: null };
        }

        const trimmed = input.trim();
        try {
            const lexer = new Lexer(trimmed);
            const tokens = lexer.tokenize();
            const parser = new Parser(tokens, trimmed);
            const ast = parser.parseStatement();

            if (!parser.isAtEnd()) {
                return {
                    isValid: false,
                    isIncomplete: false,
                    error: `Unexpected token '${parser.peek().value}' after expression`,
                    ast: null
                };
            }

            return { isValid: true, isIncomplete: false, error: null, ast };
        } catch (err) {
            const msg = err.message || 'Syntax error';
            const isIncomplete =
                /unmatched|missing closing|expected|unexpected end|incomplete/i.test(msg) ||
                /[+\-*/^,(]$/.test(trimmed);

            return {
                isValid: false,
                isIncomplete: isIncomplete,
                error: msg,
                ast: null
            };
        }
    }

    peek(offset = 0) {
        const idx = this.pos + offset;
        return idx < this.tokens.length ? this.tokens[idx] : this.tokens[this.tokens.length - 1];
    }

    isAtEnd() {
        return this.peek().type === TokenType.EOF;
    }

    advance() {
        if (!this.isAtEnd()) this.pos++;
        return this.tokens[this.pos - 1];
    }

    match(type, value = null) {
        const tok = this.peek();
        if (tok.type === type && (value === null || tok.value === value)) {
            return this.advance();
        }
        return null;
    }

    consume(type, expectedDescription) {
        const tok = this.peek();
        if (tok.type === type) {
            return this.advance();
        }
        throw new Error(`${expectedDescription} at position ${tok.start + 1}. Found '${tok.value || tok.type}'.`);
    }

    parseStatement() {
        // Check for variable assignment: identifier = expr
        if (this.peek(0).type === TokenType.IDENTIFIER && this.peek(1).type === TokenType.EQUALS) {
            const idTok = this.advance();
            this.advance(); // consume '='
            const expr = this.parseExpression();
            return new AssignmentNode(idTok.value, expr, idTok.start, expr.end);
        }

        return this.parseExpression();
    }

    parseExpression() {
        return this.parseAdditive();
    }

    parseAdditive() {
        let left = this.parseMultiplicative();

        while (!this.isAtEnd()) {
            const tok = this.peek();
            if (tok.type === TokenType.OPERATOR && (tok.value === '+' || tok.value === '-')) {
                const opTok = this.advance();
                const right = this.parseMultiplicative();
                left = new BinaryOpNode(opTok.value, left, right, left.start, right.end);
            } else {
                break;
            }
        }

        return left;
    }

    parseMultiplicative() {
        let left = this.parsePower();

        while (!this.isAtEnd()) {
            const tok = this.peek();
            if (tok.type === TokenType.OPERATOR && (tok.value === '*' || tok.value === '/' || tok.value === '%')) {
                const opTok = this.advance();
                const right = this.parsePower();
                left = new BinaryOpNode(opTok.value, left, right, left.start, right.end);
            }
            // Check for Implicit Multiplication:
            // e.g. 2(3+4), 2π, (2+3)(4+5), x(y+1)
            else if (this.isImplicitMultiplication()) {
                const right = this.parsePower();
                left = new BinaryOpNode('*', left, right, left.start, right.end);
            } else {
                break;
            }
        }

        return left;
    }

    isImplicitMultiplication() {
        const next = this.peek();
        if (next.type === TokenType.LPAREN) return true;
        if (next.type === TokenType.NUMBER) return true;
        if (next.type === TokenType.IDENTIFIER) return true;
        return false;
    }

    parsePower() {
        let left = this.parseUnary();

        if (!this.isAtEnd() && this.peek().type === TokenType.OPERATOR && this.peek().value === '^') {
            const opTok = this.advance();
            // Right-associative: 2^3^4 = 2^(3^4)
            const right = this.parsePower();
            left = new BinaryOpNode('^', left, right, left.start, right.end);
        }

        return left;
    }

    parseUnary() {
        if (!this.isAtEnd() && this.peek().type === TokenType.OPERATOR && (this.peek().value === '+' || this.peek().value === '-')) {
            const opTok = this.advance();
            const arg = this.parseUnary();
            return new UnaryOpNode(opTok.value, arg, opTok.start, arg.end);
        }

        return this.parsePostfix();
    }

    parsePostfix() {
        let node = this.parsePrimary();

        while (!this.isAtEnd()) {
            const tok = this.peek();
            if (tok.type === TokenType.OPERATOR && tok.value === '!') {
                const opTok = this.advance();
                node = new PostfixOpNode('!', node, node.start, opTok.end);
            } else if (tok.type === TokenType.OPERATOR && tok.value === '%') {
                // Distinguish between postfix percentage and binary modulo:
                // If % is followed by an operand (NUMBER, LPAREN, IDENTIFIER), treat as binary modulo in parseMultiplicative!
                const next = this.tokens[this.pos + 1];
                const isBinaryOperand = next && (next.type === TokenType.NUMBER || next.type === TokenType.LPAREN || next.type === TokenType.IDENTIFIER);
                if (!isBinaryOperand) {
                    const opTok = this.advance();
                    node = new PostfixOpNode('%', node, node.start, opTok.end);
                } else {
                    break;
                }
            } else {
                break;
            }
        }

        return node;
    }

    parsePrimary() {
        const tok = this.peek();

        // 1. Parentheses
        if (tok.type === TokenType.LPAREN) {
            const lparen = this.advance();
            const expr = this.parseExpression();
            const rparen = this.consume(TokenType.RPAREN, "Missing closing parenthesis ')'");
            return expr;
        }

        // 2. Number literal
        if (tok.type === TokenType.NUMBER) {
            this.advance();
            return new NumberNode(tok.value, tok.start, tok.end);
        }

        // 3. Identifier or Function call
        if (tok.type === TokenType.IDENTIFIER) {
            const idTok = this.advance();

            // Check for function power shorthand: sin^2(30) or sin²(30)
            if (this.peek(0).type === TokenType.OPERATOR && this.peek(0).value === '^' &&
                this.peek(1).type === TokenType.NUMBER && this.peek(2).type === TokenType.LPAREN) {
                this.advance(); // consume '^'
                const powerNode = new NumberNode(this.advance().value);
                const call = this.parseFunctionCall(idTok);
                return new BinaryOpNode('^', call, powerNode, idTok.start, powerNode.end);
            }

            // Function call: func(arg1, arg2...)
            if (this.peek().type === TokenType.LPAREN) {
                return this.parseFunctionCall(idTok);
            }

            // Simple identifier / constant / variable
            return new IdentifierNode(idTok.value, idTok.start, idTok.end);
        }

        if (tok.type === TokenType.EOF) {
            throw new Error(`Unexpected end of expression`);
        }

        throw new Error(`Unexpected token '${tok.value}' at position ${tok.start + 1}`);
    }

    parseFunctionCall(idTok) {
        this.consume(TokenType.LPAREN, `Expected '(' after function '${idTok.value}'`);
        const args = [];

        if (this.peek().type !== TokenType.RPAREN) {
            args.push(this.parseExpression());
            while (this.match(TokenType.COMMA)) {
                args.push(this.parseExpression());
            }
        }

        const rparen = this.consume(TokenType.RPAREN, `Missing closing parenthesis ')' in call to '${idTok.value}'`);
        return new FunctionCallNode(idTok.value, args, idTok.start, rparen.end);
    }
}
