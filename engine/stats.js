/**
 * Scientific Calculator Engine - Statistics & Data Analysis
 * Computes descriptive statistics, quartiles, variance, standard deviation, and histogram bins.
 */

import { MathFormat } from './fractions.js';

export class StatisticsEngine {
    static parseDataset(text) {
        if (!text || typeof text !== 'string') return [];
        const clean = text.replace(/[,;\t\n]+/g, ' ').trim();
        if (!clean) return [];
        return clean.split(/\s+/)
            .map(s => parseFloat(s))
            .filter(n => !isNaN(n) && isFinite(n));
    }

    static analyze(data) {
        if (!data || data.length === 0) {
            return null;
        }

        const n = data.length;
        const sorted = [...data].sort((a, b) => a - b);
        const sum = sorted.reduce((acc, val) => acc + val, 0);
        const mean = sum / n;
        const min = sorted[0];
        const max = sorted[n - 1];
        const range = max - min;

        // Median
        const mid = Math.floor(n / 2);
        const median = n % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

        // Quartiles (Q1, Q3)
        const q1 = this.percentile(sorted, 0.25);
        const q3 = this.percentile(sorted, 0.75);
        const iqr = q3 - q1;

        // Mode
        const freqs = {};
        sorted.forEach(x => { freqs[x] = (freqs[x] || 0) + 1; });
        let maxFreq = 0;
        for (const count of Object.values(freqs)) {
            if (count > maxFreq) maxFreq = count;
        }
        let mode = 'None';
        if (maxFreq > 1) {
            const modes = Object.keys(freqs).filter(k => freqs[k] === maxFreq).map(Number);
            if (modes.length < n) {
                mode = modes.join(', ');
            }
        }

        // Variances & Standard Deviations
        const sumSqDiffs = sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
        const populationVariance = sumSqDiffs / n;
        const populationStdDev = Math.sqrt(populationVariance);
        const sampleVariance = n > 1 ? sumSqDiffs / (n - 1) : 0;
        const sampleStdDev = Math.sqrt(sampleVariance);

        // Standard Error of Mean
        const sem = sampleStdDev / Math.sqrt(n);

        return {
            count: n,
            sum: MathFormat.cleanFloat(sum),
            mean: MathFormat.cleanFloat(mean),
            median: MathFormat.cleanFloat(median),
            mode: mode,
            min: MathFormat.cleanFloat(min),
            max: MathFormat.cleanFloat(max),
            range: MathFormat.cleanFloat(range),
            q1: MathFormat.cleanFloat(q1),
            q3: MathFormat.cleanFloat(q3),
            iqr: MathFormat.cleanFloat(iqr),
            populationVariance: MathFormat.cleanFloat(populationVariance),
            populationStdDev: MathFormat.cleanFloat(populationStdDev),
            sampleVariance: MathFormat.cleanFloat(sampleVariance),
            sampleStdDev: MathFormat.cleanFloat(sampleStdDev),
            sem: MathFormat.cleanFloat(sem),
            histogram: this.getHistogram(sorted)
        };
    }

    static percentile(sorted, p) {
        if (sorted.length === 1) return sorted[0];
        const pos = (sorted.length - 1) * p;
        const base = Math.floor(pos);
        const rest = pos - base;
        if (sorted[base + 1] !== undefined) {
            return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
        } else {
            return sorted[base];
        }
    }

    static getHistogram(sorted, binCount = 5) {
        if (sorted.length === 0) return [];
        const min = sorted[0];
        const max = sorted[sorted.length - 1];
        if (min === max) {
            return [{ label: `${min}`, count: sorted.length, min, max }];
        }

        const binWidth = (max - min) / binCount;
        const bins = [];

        for (let i = 0; i < binCount; i++) {
            const bMin = min + i * binWidth;
            const bMax = bMin + binWidth;
            const isLast = i === binCount - 1;
            const count = sorted.filter(v => (v >= bMin && (isLast ? v <= bMax : v < bMax))).length;
            bins.push({
                label: `${bMin.toFixed(1)} - ${bMax.toFixed(1)}`,
                min: bMin,
                max: bMax,
                count: count
            });
        }

        return bins;
    }
}
