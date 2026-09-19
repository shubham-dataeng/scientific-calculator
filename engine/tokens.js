/**
 * Scientific Calculator Engine - Lexer & Tokenizer
 * Zero external dependencies. High performance, precise source location tracking.
 */

export const TokenType = {
    NUMBER: 'NUMBER',
    IDENTIFIER: 'IDENTIFIER',
    OPERATOR: 'OPERATOR',
    LPAREN: 'LPAREN',
    RPAREN: 'RPAREN',
    COMMA: 'COMMA',
    EQUALS: 'EQUALS',
    EOF: 'EOF'
};

export class Token {
    constructor(type, value, start, end) {
        this.type = type;
        this.value = value;
        this.start = start;
        this.end = end;
    }
}

export class Lexer {
    constructor(input) {
        this.input = input || '';
        this.pos = 0;
        this.length = this.input.length;
    }

    tokenize() {
        const tokens = [];
        this.pos = 0;

        while (this.pos < this.length) {
            const char = this.input[this.pos];

            // Whitespace
            if (/\s/.test(char)) {
                this.pos++;
                continue;
            }

            // Numbers: integer, float, scientific notation (e.g. 1.23e-4)
            if (/[0-9]/.test(char) || (char === '.' && /[0-9]/.test(this.peek(1)))) {
                tokens.push(this.readNumber());
                continue;
            }

            // Unicode Superscripts for powers (e.g. ², ³, ⁴, ⁵, ⁶, ⁷, ⁸, ⁹, ⁰)
            if (/[⁰¹²³⁴⁵⁶⁷⁸⁹]/.test(char)) {
                const superMap = { '⁰':'0', '¹':'1', '²':'2', '³':'3', '⁴':'4', '⁵':'5', '⁶':'6', '⁷':'7', '⁸':'8', '⁹':'9' };
                let val = '';
                const start = this.pos;
                while (this.pos < this.length && /[⁰¹²³⁴⁵⁶⁷⁸⁹]/.test(this.input[this.pos])) {
                    val += superMap[this.input[this.pos]];
                    this.pos++;
                }
                tokens.push(new Token(TokenType.OPERATOR, '^', start, start + 1));
                tokens.push(new Token(TokenType.NUMBER, parseFloat(val), start, this.pos));
                continue;
            }

            // Mathematical Unicode Symbols - Check BEFORE identifiers
            if (char === 'π') {
                tokens.push(new Token(TokenType.IDENTIFIER, 'pi', this.pos, this.pos + 1));
                this.pos++;
                continue;
            }
            if (char === 'φ') {
                tokens.push(new Token(TokenType.IDENTIFIER, 'phi', this.pos, this.pos + 1));
                this.pos++;
                continue;
            }
            if (char === 'τ') {
                tokens.push(new Token(TokenType.IDENTIFIER, 'tau', this.pos, this.pos + 1));
                this.pos++;
                continue;
            }
            if (char === '√') {
                tokens.push(new Token(TokenType.IDENTIFIER, 'sqrt', this.pos, this.pos + 1));
                this.pos++;
                continue;
            }
            if (char === '∛') {
                tokens.push(new Token(TokenType.IDENTIFIER, 'cbrt', this.pos, this.pos + 1));
                this.pos++;
                continue;
            }

            // Identifiers: functions, constants, variables (e.g., sin, cos, pi, x)
            if (/[a-zA-Z_]/.test(char)) {
                tokens.push(this.readIdentifier());
                continue;
            }

            // Operators & Punctuation
            const start = this.pos;
            if (char === '+' || char === '-' || char === '−') {
                tokens.push(new Token(TokenType.OPERATOR, char === '−' ? '-' : char, start, start + 1));
                this.pos++;
            } else if (char === '*' || char === '×' || char === '·') {
                tokens.push(new Token(TokenType.OPERATOR, '*', start, start + 1));
                this.pos++;
            } else if (char === '/' || char === '÷') {
                tokens.push(new Token(TokenType.OPERATOR, '/', start, start + 1));
                this.pos++;
            } else if (char === '^') {
                tokens.push(new Token(TokenType.OPERATOR, '^', start, start + 1));
                this.pos++;
            } else if (char === '!') {
                tokens.push(new Token(TokenType.OPERATOR, '!', start, start + 1));
                this.pos++;
            } else if (char === '%') {
                tokens.push(new Token(TokenType.OPERATOR, '%', start, start + 1));
                this.pos++;
            } else if (char === '(') {
                tokens.push(new Token(TokenType.LPAREN, '(', start, start + 1));
                this.pos++;
            } else if (char === ')') {
                tokens.push(new Token(TokenType.RPAREN, ')', start, start + 1));
                this.pos++;
            } else if (char === ',') {
                tokens.push(new Token(TokenType.COMMA, ',', start, start + 1));
                this.pos++;
            } else if (char === '=') {
                tokens.push(new Token(TokenType.EQUALS, '=', start, start + 1));
                this.pos++;
            } else {
                throw new Error(`Unexpected character '${char}' at position ${this.pos + 1}`);
            }
        }

        tokens.push(new Token(TokenType.EOF, '', this.pos, this.pos));
        return tokens;
    }

    peek(offset = 0) {
        return this.pos + offset < this.length ? this.input[this.pos + offset] : null;
    }

    readNumber() {
        const start = this.pos;
        let numStr = '';
        let hasDot = false;

        // Check for hex (0x...), binary (0b...), octal (0o...)
        if (this.input[this.pos] === '0' && this.pos + 1 < this.length) {
            const next = this.input[this.pos + 1].toLowerCase();
            if (next === 'x' || next === 'b' || next === 'o') {
                numStr += this.input[this.pos] + this.input[this.pos + 1];
                this.pos += 2;
                const pattern = next === 'x' ? /[0-9a-fA-F]/ : next === 'b' ? /[01]/ : /[0-7]/;
                while (this.pos < this.length && pattern.test(this.input[this.pos])) {
                    numStr += this.input[this.pos++];
                }
                return new Token(TokenType.NUMBER, Number(numStr), start, this.pos);
            }
        }

        while (this.pos < this.length) {
            const char = this.input[this.pos];
            if (/[0-9]/.test(char)) {
                numStr += char;
                this.pos++;
            } else if (char === '.' && !hasDot) {
                hasDot = true;
                numStr += char;
                this.pos++;
            } else {
                break;
            }
        }

        // Check for scientific exponential notation: e.g. 1.5e-3 or 2e10
        if (this.pos < this.length && (this.input[this.pos] === 'e' || this.input[this.pos] === 'E')) {
            const nextChar = this.peek(1);
            if (nextChar && (/[0-9]/.test(nextChar) || nextChar === '+' || nextChar === '-')) {
                numStr += this.input[this.pos++]; // 'e'
                if (this.input[this.pos] === '+' || this.input[this.pos] === '-') {
                    numStr += this.input[this.pos++];
                }
                while (this.pos < this.length && /[0-9]/.test(this.input[this.pos])) {
                    numStr += this.input[this.pos++];
                }
            }
        }

        const value = parseFloat(numStr);
        if (isNaN(value)) {
            throw new Error(`Invalid number format '${numStr}' at position ${start + 1}`);
        }
        return new Token(TokenType.NUMBER, value, start, this.pos);
    }

    readIdentifier() {
        const start = this.pos;
        let idStr = '';

        while (this.pos < this.length) {
            const char = this.input[this.pos];
            if (/[a-zA-Z0-9_]/.test(char)) {
                idStr += char;
                this.pos++;
            } else {
                break;
            }
        }

        if (idStr.length === 0) {
            this.pos++;
            idStr = this.input[start];
        }

        return new Token(TokenType.IDENTIFIER, idStr, start, this.pos);
    }
}
