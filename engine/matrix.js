/**
 * Scientific Calculator Engine - Matrix Algebra
 * Zero-dependency 2D linear algebra matrix operations.
 */

import { MathFormat } from './fractions.js';

export class MatrixEngine {
    static create(rows, cols, initialValue = 0) {
        const m = [];
        for (let r = 0; r < rows; r++) {
            m.push(new Array(cols).fill(initialValue));
        }
        return m;
    }

    static add(A, B) {
        if (A.length !== B.length || A[0].length !== B[0].length) {
            throw new Error(`Matrix dimensions must match for addition (${A.length}x${A[0].length} vs ${B.length}x${B[0].length})`);
        }
        return A.map((row, i) => row.map((val, j) => MathFormat.cleanFloat(val + B[i][j])));
    }

    static subtract(A, B) {
        if (A.length !== B.length || A[0].length !== B[0].length) {
            throw new Error(`Matrix dimensions must match for subtraction`);
        }
        return A.map((row, i) => row.map((val, j) => MathFormat.cleanFloat(val - B[i][j])));
    }

    static multiplyScalar(A, scalar) {
        return A.map(row => row.map(val => MathFormat.cleanFloat(val * scalar)));
    }

    static multiply(A, B) {
        const rowsA = A.length, colsA = A[0].length;
        const rowsB = B.length, colsB = B[0].length;

        if (colsA !== rowsB) {
            throw new Error(`Cannot multiply ${rowsA}x${colsA} by ${rowsB}x${colsB}: inner dimensions must match.`);
        }

        const result = this.create(rowsA, colsB, 0);
        for (let i = 0; i < rowsA; i++) {
            for (let j = 0; j < colsB; j++) {
                let sum = 0;
                for (let k = 0; k < colsA; k++) {
                    sum += A[i][k] * B[k][j];
                }
                result[i][j] = MathFormat.cleanFloat(sum);
            }
        }
        return result;
    }

    static transpose(A) {
        const rows = A.length, cols = A[0].length;
        const T = this.create(cols, rows, 0);
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                T[j][i] = A[i][j];
            }
        }
        return T;
    }

    static trace(A) {
        if (A.length !== A[0].length) {
            throw new Error('Trace is only defined for square matrices');
        }
        let sum = 0;
        for (let i = 0; i < A.length; i++) {
            sum += A[i][i];
        }
        return MathFormat.cleanFloat(sum);
    }

    static determinant(A) {
        const n = A.length;
        if (n !== A[0].length) {
            throw new Error('Determinant is only defined for square matrices');
        }

        if (n === 1) return A[0][0];
        if (n === 2) {
            return MathFormat.cleanFloat(A[0][0] * A[1][1] - A[0][1] * A[1][0]);
        }
        if (n === 3) {
            return MathFormat.cleanFloat(
                A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) -
                A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) +
                A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0])
            );
        }

        // LU decomposition determinant for n >= 4
        let det = 1;
        const M = A.map(row => [...row]);
        for (let i = 0; i < n; i++) {
            let pivot = i;
            for (let j = i + 1; j < n; j++) {
                if (Math.abs(M[j][i]) > Math.abs(M[pivot][i])) pivot = j;
            }
            if (Math.abs(M[pivot][i]) < 1e-12) return 0;
            if (pivot !== i) {
                [M[i], M[pivot]] = [M[pivot], M[i]];
                det = -det;
            }
            det *= M[i][i];
            for (let j = i + 1; j < n; j++) {
                const factor = M[j][i] / M[i][i];
                for (let k = i + 1; k < n; k++) {
                    M[j][k] -= factor * M[i][k];
                }
            }
        }
        return MathFormat.cleanFloat(det);
    }

    static inverse(A) {
        const det = this.determinant(A);
        if (Math.abs(det) < 1e-12) {
            throw new Error('Matrix is singular (determinant = 0), inverse does not exist');
        }

        const n = A.length;
        if (n === 1) return [[1 / A[0][0]]];
        if (n === 2) {
            return [
                [MathFormat.cleanFloat(A[1][1] / det), MathFormat.cleanFloat(-A[0][1] / det)],
                [MathFormat.cleanFloat(-A[1][0] / det), MathFormat.cleanFloat(A[0][0] / det)]
            ];
        }

        // Gauss-Jordan elimination for general square matrix
        const M = A.map((row, i) => [
            ...row,
            ...new Array(n).fill(0).map((_, j) => (i === j ? 1 : 0))
        ]);

        for (let i = 0; i < n; i++) {
            let pivot = i;
            for (let j = i + 1; j < n; j++) {
                if (Math.abs(M[j][i]) > Math.abs(M[pivot][i])) pivot = j;
            }
            if (Math.abs(M[pivot][i]) < 1e-12) {
                throw new Error('Matrix is singular');
            }
            if (pivot !== i) {
                [M[i], M[pivot]] = [M[pivot], M[i]];
            }

            const pVal = M[i][i];
            for (let j = 0; j < 2 * n; j++) {
                M[i][j] /= pVal;
            }

            for (let j = 0; j < n; j++) {
                if (j !== i) {
                    const factor = M[j][i];
                    for (let k = 0; k < 2 * n; k++) {
                        M[j][k] -= factor * M[i][k];
                    }
                }
            }
        }

        return M.map(row => row.slice(n).map(val => MathFormat.cleanFloat(val)));
    }
}
