/**
 * Comprehensive Automated Test Suite for Antigravity Math Studio
 * Tests arithmetic, BODMAS, trigonometry, floating-point precision, fractions,
 * equation solving, matrix algebra, statistics, programmer mode, and unit conversions.
 * Run directly via Node: node tests/engine-tests.js
 */

import { Evaluator } from '../engine/evaluator.js';
import { Parser } from '../engine/parser.js';
import { MathFormat } from '../engine/fractions.js';
import { Explainer } from '../engine/explainer.js';
import { EquationSolver } from '../engine/solver.js';
import { MatrixEngine } from '../engine/matrix.js';
import { StatisticsEngine } from '../engine/stats.js';
import { ProgrammerEngine } from '../modules/programmer.js';
import { UnitEngine } from '../engine/units.js';

class TestRunner {
    constructor() {
        this.passed = 0;
        this.failed = 0;
        this.tests = [];
    }

    assert(condition, testName, details = '') {
        if (condition) {
            this.passed++;
            console.log(`  ✅ PASS: ${testName}`);
        } else {
            this.failed++;
            console.error(`  ❌ FAIL: ${testName} ${details ? '(' + details + ')' : ''}`);
        }
    }

    assertClose(actual, expected, tolerance = 1e-5, testName = '') {
        const diff = Math.abs(actual - expected);
        this.assert(diff <= tolerance, testName || `Expected ~${expected}, got ${actual}`, `diff=${diff}`);
    }

    assertThrows(fn, testName, expectedErrorSubstr = '') {
        try {
            fn();
            this.assert(false, testName, 'Expected error was not thrown');
        } catch (err) {
            if (expectedErrorSubstr) {
                const matches = err.message.toLowerCase().includes(expectedErrorSubstr.toLowerCase());
                this.assert(matches, testName, `Error '${err.message}' did not contain '${expectedErrorSubstr}'`);
            } else {
                this.assert(true, testName);
            }
        }
    }

    runAll() {
        console.log('\n======================================================');
        console.log('🧪 ANTIGRAVITY MATH STUDIO — FULL ENGINE TEST SUITE');
        console.log('======================================================\n');

        this.testArithmeticAndPrecedence();
        this.testImplicitMultiplication();
        this.testTrigonometry();
        this.testLogarithmsAndExponentials();
        this.testPowersAndFactorials();
        this.testPrecisionAndFractions();
        this.testDomainAndEdgeCases();
        this.testExplainerEngine();
        this.testEquationSolver();
        this.testMatrixAlgebra();
        this.testStatistics();
        this.testProgrammerMode();
        this.testUnitConverter();

        console.log('\n======================================================');
        console.log(`📊 TEST SUMMARY: ${this.passed} PASSED | ${this.failed} FAILED | TOTAL: ${this.passed + this.failed}`);
        console.log('======================================================\n');

        if (this.failed > 0) {
            process.exit(1);
        }
    }

    testArithmeticAndPrecedence() {
        console.log('--- 1. Arithmetic & BODMAS Precedence ---');
        const ev = new Evaluator();

        this.assert(ev.evaluate('2 + 3').value === 5, '2 + 3 = 5');
        this.assert(ev.evaluate('10 - 4').value === 6, '10 - 4 = 6');
        this.assert(ev.evaluate('6 * 7').value === 42, '6 * 7 = 42');
        this.assert(ev.evaluate('20 / 4').value === 5, '20 / 4 = 5');
        this.assert(ev.evaluate('14 % 4').value === 2, '14 % 4 = 2');

        // Precedence: Multiplication before addition
        this.assert(ev.evaluate('2 + 3 * 4').value === 14, '2 + 3 * 4 = 14');
        this.assert(ev.evaluate('10 - 2 * 3').value === 4, '10 - 2 * 3 = 4');
        this.assert(ev.evaluate('20 / 4 + 3').value === 8, '20 / 4 + 3 = 8');
        this.assert(ev.evaluate('(2 + 3) * 4').value === 20, '(2 + 3) * 4 = 20');
        this.assert(ev.evaluate('2 + 3 * 4 - 5').value === 9, '2 + 3 * 4 - 5 = 9');
        this.assert(ev.evaluate('100 - (20 + 30) * 2').value === 0, '100 - (20 + 30) * 2 = 0');
    }

    testImplicitMultiplication() {
        console.log('--- 2. Implicit Multiplication ---');
        const ev = new Evaluator({ angleMode: 'deg' });

        this.assert(ev.evaluate('2(3 + 4)').value === 14, '2(3 + 4) = 14');
        this.assert(ev.evaluate('(2 + 3)(4 + 5)').value === 45, '(2 + 3)(4 + 5) = 45');
        this.assertClose(ev.evaluate('2π').value, 2 * Math.PI, 1e-8, '2π = 2 * π');
        this.assertClose(ev.evaluate('3pi').value, 3 * Math.PI, 1e-8, '3pi = 3 * π');
        this.assert(ev.evaluate('4sin(30)').value === 2, '4sin(30) = 4 * 0.5 = 2');
    }

    testTrigonometry() {
        console.log('--- 3. Trigonometry & Angle Modes ---');
        const evDeg = new Evaluator({ angleMode: 'deg' });
        const evRad = new Evaluator({ angleMode: 'rad' });
        const evGrad = new Evaluator({ angleMode: 'grad' });

        // Degrees
        this.assert(evDeg.evaluate('sin(0)').value === 0, 'sin(0°) = 0');
        this.assert(evDeg.evaluate('sin(30)').value === 0.5, 'sin(30°) = 0.5');
        this.assert(evDeg.evaluate('sin(90)').value === 1, 'sin(90°) = 1');
        this.assert(evDeg.evaluate('sin(180)').value === 0, 'sin(180°) = 0');
        this.assert(evDeg.evaluate('cos(60)').value === 0.5, 'cos(60°) = 0.5');
        this.assert(evDeg.evaluate('cos(90)').value === 0, 'cos(90°) = 0');
        this.assert(evDeg.evaluate('tan(45)').value === 1, 'tan(45°) = 1');
        this.assertThrows(() => evDeg.evaluate('tan(90)'), 'tan(90°) vertical asymptote throws', 'asymptote');

        // Inverse Trig in degrees
        this.assert(evDeg.evaluate('asin(0.5)').value === 30, 'asin(0.5) = 30°');
        this.assert(evDeg.evaluate('acos(0.5)').value === 60, 'acos(0.5) = 60°');
        this.assert(evDeg.evaluate('atan(1)').value === 45, 'atan(1) = 45°');

        // Radians
        this.assertClose(evRad.evaluate('sin(pi / 6)').value, 0.5, 1e-6, 'sin(π/6 rad) = 0.5');
        this.assertClose(evRad.evaluate('cos(pi / 3)').value, 0.5, 1e-6, 'cos(π/3 rad) = 0.5');

        // Gradians
        this.assert(evGrad.evaluate('sin(100)').value === 1, 'sin(100 grad) = 1');
        this.assert(evGrad.evaluate('cos(200)').value === -1, 'cos(200 grad) = -1');
    }

    testLogarithmsAndExponentials() {
        console.log('--- 4. Logarithms & Exponentials ---');
        const ev = new Evaluator();

        this.assert(ev.evaluate('log(100)').value === 2, 'log(100) = 2');
        this.assert(ev.evaluate('log(1000)').value === 3, 'log(1000) = 3');
        this.assert(ev.evaluate('log2(8)').value === 3, 'log2(8) = 3');
        this.assert(ev.evaluate('log2(1024)').value === 10, 'log2(1024) = 10');
        this.assertClose(ev.evaluate('ln(e)').value, 1, 1e-8, 'ln(e) = 1');
        this.assertClose(ev.evaluate('exp(1)').value, Math.E, 1e-8, 'exp(1) = e');
        this.assertClose(ev.evaluate('exp(0)').value, 1, 1e-8, 'exp(0) = 1');
    }

    testPowersAndFactorials() {
        console.log('--- 5. Powers & Factorials ---');
        const ev = new Evaluator();

        this.assert(ev.evaluate('2^3').value === 8, '2^3 = 8');
        this.assert(ev.evaluate('10^4').value === 10000, '10^4 = 10000');
        this.assert(ev.evaluate('(2 + 3)^4').value === 625, '(2 + 3)^4 = 625');
        this.assert(ev.evaluate('sqrt(25)').value === 5, 'sqrt(25) = 5');
        this.assert(ev.evaluate('cbrt(27)').value === 3, 'cbrt(27) = 3');
        this.assert(ev.evaluate('0!').value === 1, '0! = 1');
        this.assert(ev.evaluate('1!').value === 1, '1! = 1');
        this.assert(ev.evaluate('5!').value === 120, '5! = 120');
        this.assert(ev.evaluate('7!').value === 5040, '7! = 5040');
    }

    testPrecisionAndFractions() {
        console.log('--- 6. Precision & Multi-Format Representation ---');
        const ev = new Evaluator();

        // 0.1 + 0.2 precision fix
        const res = ev.evaluate('0.1 + 0.2');
        this.assert(res.value === 0.3, '0.1 + 0.2 equals exactly 0.3');
        this.assert(res.decimal === '0.3', 'Decimal formatting of 0.1 + 0.2 is "0.3"');
        this.assert(res.fraction === '3/10', 'Fraction formatting of 0.1 + 0.2 is "3/10"');

        // Continuous fractions
        const frac1 = MathFormat.toFraction(0.75);
        this.assert(frac1 && frac1.string === '3/4', '0.75 converts to fraction 3/4');

        const frac2 = MathFormat.toFraction(0.125);
        this.assert(frac2 && frac2.string === '1/8', '0.125 converts to fraction 1/8');

        // Radical recognition
        const rad1 = MathFormat.toExactSymbolic(Math.sqrt(18));
        this.assert(rad1 === '3√2', '√18 recognized as 3√2');

        const rad2 = MathFormat.toExactSymbolic(Math.sqrt(8));
        this.assert(rad2 === '2√2', '√8 recognized as 2√2');
    }

    testDomainAndEdgeCases() {
        console.log('--- 7. Domain Checks & Edge Cases ---');
        const ev = new Evaluator();

        this.assertThrows(() => ev.evaluate('1 / 0'), '1 / 0 throws division by zero error', 'divide by zero');
        this.assertThrows(() => ev.evaluate('0 / 0'), '0 / 0 throws indeterminate form error', 'indeterminate');
        this.assertThrows(() => ev.evaluate('sqrt(-4)'), 'sqrt(-4) throws in real mode', 'real-number');
        this.assertThrows(() => ev.evaluate('0^0'), '0^0 throws indeterminate form error', 'indeterminate');
        this.assertThrows(() => ev.evaluate('log(-10)'), 'log(-10) throws non-positive error', 'non-positive');
        this.assertThrows(() => ev.evaluate('(-4)!'), '(-4)! throws factorial domain error', 'non-negative');
    }

    testExplainerEngine() {
        console.log('--- 8. Explainable Steps Engine ---');
        const explainer = new Explainer();
        const exp = explainer.explain('2 + 3 * 4');

        this.assert(exp.steps && exp.steps.length === 2, 'Generates 2 reduction steps for 2 + 3 * 4');
        this.assert(exp.steps[0].stepExpression === '3 * 4 = 12', 'Step 1 reduces 3 * 4 = 12');
        this.assert(exp.steps[1].stepExpression === '2 + 12 = 14', 'Step 2 reduces 2 + 12 = 14');
    }

    testEquationSolver() {
        console.log('--- 9. Equation Solver ---');
        const solver = new EquationSolver();

        // Linear
        const lin = solver.solve('2x + 5 = 15');
        this.assert(lin.type === 'linear', 'Identifies linear equation');
        this.assert(lin.solutions[0] === '5', 'Solves 2x + 5 = 15 -> x = 5');

        // Quadratic - 2 real roots
        const quad1 = solver.solve('x^2 - 5x + 6 = 0');
        this.assert(quad1.type === 'quadratic', 'Identifies quadratic equation');
        this.assert(quad1.numericSolutions.includes(3) && quad1.numericSolutions.includes(2), 'x^2 - 5x + 6 = 0 roots: 3 and 2');

        // Quadratic - Complex roots
        const quad2 = solver.solve('x^2 + 1 = 0');
        this.assert(quad2.solutions.some(s => s.includes('i')), 'x^2 + 1 = 0 yields complex conjugate roots');
    }

    testMatrixAlgebra() {
        console.log('--- 10. Matrix Algebra ---');
        const A = [[1, 2], [3, 4]];
        const B = [[5, 6], [7, 8]];

        // Determinant
        const det = MatrixEngine.determinant(A);
        this.assert(det === -2, 'det([[1,2],[3,4]]) = -2');

        // Transpose
        const T = MatrixEngine.transpose(A);
        this.assert(T[0][1] === 3 && T[1][0] === 2, 'Transpose flips rows and columns');

        // Matrix Multiplication
        const C = MatrixEngine.multiply(A, B);
        // [1*5 + 2*7, 1*6 + 2*8] = [19, 22]
        // [3*5 + 4*7, 3*6 + 4*8] = [43, 50]
        this.assert(C[0][0] === 19 && C[0][1] === 22 && C[1][0] === 43 && C[1][1] === 50, 'Matrix multiply 2x2');

        // Inversion
        const inv = MatrixEngine.inverse(A);
        this.assert(inv[0][0] === -2 && inv[0][1] === 1 && inv[1][0] === 1.5 && inv[1][1] === -0.5, 'Matrix inverse 2x2');
    }

    testStatistics() {
        console.log('--- 11. Statistics Engine ---');
        const data = [12, 15, 18, 20, 25];
        const s = StatisticsEngine.analyze(data);

        this.assert(s.count === 5, 'Count = 5');
        this.assert(s.sum === 90, 'Sum = 90');
        this.assert(s.mean === 18, 'Mean = 18');
        this.assert(s.median === 18, 'Median = 18');
        this.assert(s.min === 12 && s.max === 25, 'Min=12, Max=25');
        this.assert(s.range === 13, 'Range = 13');
        this.assert(s.sampleVariance === 24.5, 'Sample variance = 24.5');
    }

    testProgrammerMode() {
        console.log('--- 12. Programmer Mode 64-Bit Logic ---');
        const prog = new ProgrammerEngine();

        prog.setValue(42);
        this.assert(prog.getHex() === '000000000000002A', 'HEX representation of 42');
        this.assert(prog.getDec() === '42', 'DEC representation of 42');
        this.assert(prog.getOct() === '52', 'OCT representation of 42');

        // Bit toggle
        prog.toggleBit(0); // 42 is 101010, toggling bit 0 makes it 43 (101011)
        this.assert(prog.getDec() === '43', 'Toggling bit 0 changes 42 to 43');

        // Bitwise AND
        prog.setValue(0b1100);
        prog.bitwiseOp('AND', 0b1010);
        this.assert(prog.value === 0b1000n, '1100 & 1010 = 1000');

        // Bitwise XOR
        prog.setValue(0b1100);
        prog.bitwiseOp('XOR', 0b1010);
        this.assert(prog.value === 0b0110n, '1100 ^ 1010 = 0110');
    }

    testUnitConverter() {
        console.log('--- 13. Unit Converter & NLP ---');

        // Direct conversion
        const mToKm = UnitEngine.convert(5000, 'm', 'km', 'length');
        this.assert(mToKm === 5, '5000 m = 5 km');

        const cToF = UnitEngine.convert(100, 'c', 'f', 'temperature');
        this.assert(cToF === 212, '100 °C = 212 °F');

        // Natural Language Parsing
        const nlp1 = UnitEngine.parseNaturalLanguage('10 km to miles');
        this.assert(nlp1 && nlp1.success, 'Parses "10 km to miles"');
        this.assertClose(nlp1.result, 6.213712, 1e-4, '10 km = 6.2137 mi');

        const nlp2 = UnitEngine.parseNaturalLanguage('25 C to F');
        this.assert(nlp2 && nlp2.success, 'Parses "25 C to F"');
        this.assert(nlp2.result === 77, '25 C = 77 F');
    }
}

// Execute tests
const runner = new TestRunner();
runner.runAll();
