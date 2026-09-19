/**
 * Scientific Calculator Engine - AST Node Definitions
 */

export class ASTNode {
    constructor(type) {
        this.type = type;
    }
}

export class NumberNode extends ASTNode {
    constructor(value, start, end) {
        super('Number');
        this.value = value;
        this.start = start;
        this.end = end;
    }
}

export class IdentifierNode extends ASTNode {
    constructor(name, start, end) {
        super('Identifier');
        this.name = name;
        this.start = start;
        this.end = end;
    }
}

export class BinaryOpNode extends ASTNode {
    constructor(op, left, right, start, end) {
        super('BinaryOp');
        this.op = op;
        this.left = left;
        this.right = right;
        this.start = start;
        this.end = end;
    }
}

export class UnaryOpNode extends ASTNode {
    constructor(op, argument, start, end) {
        super('UnaryOp');
        this.op = op;
        this.argument = argument;
        this.start = start;
        this.end = end;
    }
}

export class PostfixOpNode extends ASTNode {
    constructor(op, argument, start, end) {
        super('PostfixOp');
        this.op = op;
        this.argument = argument;
        this.start = start;
        this.end = end;
    }
}

export class FunctionCallNode extends ASTNode {
    constructor(name, args, start, end) {
        super('FunctionCall');
        this.name = name;
        this.args = args;
        this.start = start;
        this.end = end;
    }
}

export class AssignmentNode extends ASTNode {
    constructor(variableName, expr, start, end) {
        super('Assignment');
        this.variableName = variableName;
        this.expr = expr;
        this.start = start;
        this.end = end;
    }
}
