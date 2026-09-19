/**
 * Scientific Calculator - Programmer Mode 2.0
 * 64-bit interactive bitboard, multiple word sizes, signed/unsigned two's complement, and bitwise ops.
 */

export class ProgrammerEngine {
    constructor() {
        this.value = 0n; // 64-bit BigInt
        this.wordSize = 64; // 64 (QWORD), 32 (DWORD), 16 (WORD), 8 (BYTE)
        this.isSigned = false;
        this.pendingOp = null;
        this.storedValue = null;
    }

    getMask() {
        if (this.wordSize === 8) return 0xFFn;
        if (this.wordSize === 16) return 0xFFFFn;
        if (this.wordSize === 32) return 0xFFFFFFFFn;
        return 0xFFFFFFFFFFFFFFFFn;
    }

    setValue(val) {
        try {
            let b = BigInt(val);
            b = b & this.getMask();
            this.value = b;
        } catch {
            this.value = 0n;
        }
    }

    setWordSize(bits) {
        if ([8, 16, 32, 64].includes(bits)) {
            this.wordSize = bits;
            this.value = this.value & this.getMask();
        }
    }

    toggleBit(bitIndex) {
        if (bitIndex >= 0 && bitIndex < this.wordSize) {
            const bitMask = 1n << BigInt(bitIndex);
            this.value = this.value ^ bitMask;
        }
    }

    getHex() {
        const hex = this.value.toString(16).toUpperCase();
        const padLen = this.wordSize / 4;
        return hex.padStart(padLen, '0');
    }

    getDec() {
        if (!this.isSigned) {
            return this.value.toString(10);
        }
        // Two's complement signed conversion
        const signBit = 1n << BigInt(this.wordSize - 1);
        if ((this.value & signBit) !== 0n) {
            const fullMask = (1n << BigInt(this.wordSize));
            const signedVal = this.value - fullMask;
            return signedVal.toString(10);
        }
        return this.value.toString(10);
    }

    getOct() {
        return this.value.toString(8);
    }

    getBin() {
        const bin = this.value.toString(2);
        return bin.padStart(this.wordSize, '0');
    }

    getFormattedBin() {
        const bin = this.getBin();
        // Group by 4 bits
        const chunks = [];
        for (let i = 0; i < bin.length; i += 4) {
            chunks.push(bin.slice(i, i + 4));
        }
        return chunks.join(' ');
    }

    bitwiseOp(op, operand2 = null) {
        const mask = this.getMask();
        let a = this.value;

        if (op === 'NOT') {
            this.value = (~a) & mask;
            return this.value;
        }

        if (operand2 === null) {
            this.pendingOp = op;
            this.storedValue = a;
            return a;
        }

        const b = BigInt(operand2) & mask;
        let res = 0n;

        switch (op) {
            case 'AND': res = a & b; break;
            case 'OR': res = a | b; break;
            case 'XOR': res = a ^ b; break;
            case 'NAND': res = ~(a & b); break;
            case 'NOR': res = ~(a | b); break;
            case 'LSH': res = a << (b % BigInt(this.wordSize)); break;
            case 'RSH': res = a >> (b % BigInt(this.wordSize)); break;
            case 'ROTL': {
                const shift = Number(b % BigInt(this.wordSize));
                res = ((a << BigInt(shift)) | (a >> BigInt(this.wordSize - shift)));
                break;
            }
            case 'ROTR': {
                const shift = Number(b % BigInt(this.wordSize));
                res = ((a >> BigInt(shift)) | (a << BigInt(this.wordSize - shift)));
                break;
            }
        }

        this.value = res & mask;
        this.pendingOp = null;
        this.storedValue = null;
        return this.value;
    }
}
