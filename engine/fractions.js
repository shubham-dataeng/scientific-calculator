/**
 * Scientific Calculator Engine - Fraction & Exact Representation
 * Continuous fraction expansion, Stern-Brocot approximation, and radical recognition.
 */

export class MathFormat {
    /**
     * Compute greatest common divisor of two integers.
     */
    static gcd(a, b) {
        a = Math.abs(Math.round(a));
        b = Math.abs(Math.round(b));
        while (b) {
            const t = b;
            b = a % b;
            a = t;
        }
        return a;
    }

    /**
     * Compute least common multiple of two integers.
     */
    static lcm(a, b) {
        if (a === 0 || b === 0) return 0;
        return Math.abs(Math.round(a * b)) / this.gcd(a, b);
    }

    /**
     * Convert floating-point number to reduced fraction using continued fractions.
     * Returns { n, d, string } or null if cannot be neatly represented.
     */
    static toFraction(value, tolerance = 1e-9, maxDenominator = 100000) {
        if (!isFinite(value) || isNaN(value)) return null;
        if (Math.abs(value) < 1e-12) return { n: 0, d: 1, string: '0' };

        const sign = value < 0 ? -1 : 1;
        let x = Math.abs(value);

        // If it's already an integer
        if (Math.abs(x - Math.round(x)) < tolerance) {
            return { n: sign * Math.round(x), d: 1, string: `${sign * Math.round(x)}` };
        }

        let h1 = 1, h2 = 0;
        let k1 = 0, k2 = 1;
        let b = x;
        let iterations = 0;

        while (isFinite(b) && ++iterations < 40) {
            const a = Math.floor(b);
            let h = a * h1 + h2;
            let k = a * k1 + k2;

            if (k > maxDenominator) break;

            h2 = h1;
            h1 = h;
            k2 = k1;
            k1 = k;

            if (Math.abs(x - h1 / k1) <= x * tolerance) break;
            const diff = b - a;
            if (diff < 1e-12) break;
            b = 1 / diff;
        }

        const diff = Math.abs(x - h1 / k1);
        if (diff > 1e-4) {
            return null; // Not close enough to a clean fraction
        }

        const div = this.gcd(h1, k1);
        const num = sign * (h1 / div);
        const den = k1 / div;

        return {
            n: num,
            d: den,
            string: `${num}/${den}`
        };
    }

    /**
     * Attempt to match value to known exact radical forms (e.g. √2, √3/2, π/4, etc.)
     */
    static toExactSymbolic(value, tolerance = 1e-7) {
        if (!isFinite(value) || isNaN(value)) return null;
        if (Math.abs(value) < 1e-12) return '0';

        const sign = value < 0 ? -1 : 1;
        const absVal = Math.abs(value);
        const prefix = sign < 0 ? '-' : '';

        // If already an exact integer, no radical search needed
        if (Math.abs(absVal - Math.round(absVal)) < 1e-8) {
            return null;
        }

        // Check common π multiples: k * π, π / k, etc.
        const piRatio = absVal / Math.PI;
        const piFrac = this.toFraction(piRatio, 1e-6, 120);
        if (piFrac && piFrac.d <= 60 && Math.abs(absVal - (piFrac.n / piFrac.d) * Math.PI) < 1e-5) {
            if (piFrac.n === 1 && piFrac.d === 1) return `${prefix}π`;
            if (piFrac.d === 1) return `${prefix}${piFrac.n}π`;
            if (piFrac.n === 1) return `${prefix}π/${piFrac.d}`;
            return `${prefix}${piFrac.n}π/${piFrac.d}`;
        }

        // Check common e multiples
        const eRatio = absVal / Math.E;
        const eFrac = this.toFraction(eRatio, 1e-6, 50);
        if (eFrac && eFrac.d <= 30 && Math.abs(absVal - (eFrac.n / eFrac.d) * Math.E) < 1e-5) {
            if (eFrac.n === 1 && eFrac.d === 1) return `${prefix}e`;
            if (eFrac.d === 1) return `${prefix}${eFrac.n}e`;
            if (eFrac.n === 1) return `${prefix}e/${eFrac.d}`;
            return `${prefix}${eFrac.n}e/${eFrac.d}`;
        }

        // Check radicals: √k for square-free integers k (2, 3, 5, 6, 7, 10, 11, 13, etc.)
        const squareFree = [2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 17, 19, 20, 24];
        for (const k of squareFree) {
            const sq = Math.sqrt(k);
            const ratio = absVal / sq;
            const frac = this.toFraction(ratio, 1e-6, 16);
            if (frac && frac.d <= 12 && Math.abs(absVal - (frac.n / frac.d) * sq) < 1e-5) {
                const radStr = this.simplifyRadical(k);
                if (!radStr.includes('√')) continue; // Skip if simplified to a pure number
                if (frac.n === 1 && frac.d === 1) return `${prefix}${radStr}`;
                if (frac.d === 1) return `${prefix}${frac.n === 1 ? '' : frac.n}${radStr}`;
                if (frac.n === 1) return `${prefix}${radStr}/${frac.d}`;
                return `${prefix}${frac.n}${radStr}/${frac.d}`;
            }
        }

        return null;
    }

    /**
     * Simplifies √k, e.g. √8 -> 2√2, √18 -> 3√2
     */
    static simplifyRadical(k) {
        let outside = 1;
        let inside = k;

        for (let factor = 2; factor * factor <= inside; factor++) {
            while (inside % (factor * factor) === 0) {
                outside *= factor;
                inside /= (factor * factor);
            }
        }

        if (inside === 1) return `${outside}`;
        if (outside === 1) return `√${inside}`;
        return `${outside}√${inside}`;
    }

    /**
     * Format as engineering notation (power of 10 is a multiple of 3)
     */
    static toEngineering(value, precision = 4) {
        if (!isFinite(value) || isNaN(value) || value === 0) return String(value);

        const exp = Math.floor(Math.log10(Math.abs(value)));
        const engExp = Math.floor(exp / 3) * 3;
        const mantissa = value / Math.pow(10, engExp);
        const factor = Math.pow(10, precision);
        const rounded = Math.round(mantissa * factor) / factor;

        if (engExp === 0) return rounded.toString();
        return `${rounded} × 10${this.toSuperscript(engExp)}`;
    }

    /**
     * Convert integer to superscript characters
     */
    static toSuperscript(num) {
        const str = num.toString();
        const map = {
            '-': '⁻', '+': '⁺',
            '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
            '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
        };
        return str.split('').map(c => map[c] || c).join('');
    }

    /**
     * Normalize floating point noise (e.g. 0.30000000000000004 -> 0.3)
     */
    static cleanFloat(val, precision = 12) {
        if (!isFinite(val) || isNaN(val)) return val;
        // Check if extremely close to integer
        const roundedInt = Math.round(val);
        if (Math.abs(val - roundedInt) < 1e-12) {
            return roundedInt;
        }
        // Round to decimal places to remove binary floating point jitter
        const factor = Math.pow(10, precision);
        return Math.round(val * factor) / factor;
    }
}
