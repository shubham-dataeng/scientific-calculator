/**
 * SCIENTIFIC CALCULATOR - PERFORMANCE MONITORING
 * Real-time performance tracking and optimization metrics
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            pageLoadTime: 0,
            firstPaint: 0,
            firstContentfulPaint: 0,
            timeToInteractive: 0,
            calculationTimes: [],
            memoryUsage: [],
            networkRequests: [],
            renderTimes: []
        };
        
        this.thresholds = {
            pageLoad: 2000,      // 2 seconds
            calculation: 500,    // 500ms
            rendering: 100,      // 100ms
            memory: 50 * 1024 * 1024  // 50MB
        };
        
        this.init();
    }
    
    /**
     * INITIALIZATION
     */
    init() {
        this.setupPerformanceObservers();
        this.measurePageLoad();
        this.setupCalculationTracking();
        this.setupMemoryMonitoring();
        this.createPerformanceUI();
    }
    
    /**
     * SETUP PERFORMANCE OBSERVERS
     */
    setupPerformanceObservers() {
        // Observe paint timing
        if (window.PerformanceObserver) {
            try {
                const paintObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        this.metrics[entry.name === 'first-paint' ? 'firstPaint' : 'firstContentfulPaint'] = entry.startTime;
                    }
                });
                paintObserver.observe({ entryTypes: ['paint'] });
            } catch (e) {
                console.log('Paint observer not supported');
            }
        }
    }
    
    /**
     * MEASURE PAGE LOAD TIME
     */
    measurePageLoad() {
        window.addEventListener('load', () => {
            const perfData = window.performance.timing;
            this.metrics.pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            
            console.log(`⏱️ Page Load Time: ${this.metrics.pageLoadTime}ms`);
            
            if (this.metrics.pageLoadTime > this.thresholds.pageLoad) {
                console.warn(`⚠️ Page load exceeds threshold: ${this.metrics.pageLoadTime}ms`);
            }
        });
    }
    
    /**
     * TRACK CALCULATION TIMING
     */
    setupCalculationTracking() {
        // Override calculator calculate method
        if (typeof calc !== 'undefined') {
            const originalCalculate = calc.calculate.bind(calc);
            
            calc.calculate = function() {
                const startTime = performance.now();
                originalCalculate();
                const duration = performance.now() - startTime;
                
                perfMonitor.logCalculation(duration);
                
                if (duration > perfMonitor.thresholds.calculation) {
                    console.warn(`⚠️ Slow calculation (${duration.toFixed(2)}ms): ${calc.formula}`);
                }
            };
        }
    }
    
    /**
     * LOG CALCULATION TIME
     */
    logCalculation(duration) {
        this.metrics.calculationTimes.push(duration);
        
        // Keep only last 100 calculations
        if (this.metrics.calculationTimes.length > 100) {
            this.metrics.calculationTimes.shift();
        }
    }
    
    /**
     * MONITOR MEMORY USAGE
     */
    setupMemoryMonitoring() {
        setInterval(() => {
            if (performance.memory) {
                const memUsage = performance.memory.usedJSHeapSize;
                this.metrics.memoryUsage.push(memUsage);
                
                // Keep only last 60 samples (1 minute)
                if (this.metrics.memoryUsage.length > 60) {
                    this.metrics.memoryUsage.shift();
                }
                
                if (memUsage > this.thresholds.memory) {
                    console.warn(`⚠️ High memory usage: ${(memUsage / 1024 / 1024).toFixed(2)}MB`);
                }
            }
        }, 1000);
    }
    
    /**
     * CREATE PERFORMANCE UI
     */
    createPerformanceUI() {
        // Add performance dashboard button
        const perfBtn = document.createElement('button');
        perfBtn.textContent = '📊 Perf';
        perfBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 10px 15px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 50px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 9999;
            transition: all 0.3s ease;
        `;
        
        perfBtn.addEventListener('mouseover', () => perfBtn.style.transform = 'scale(1.1)');
        perfBtn.addEventListener('mouseout', () => perfBtn.style.transform = 'scale(1)');
        perfBtn.addEventListener('click', () => this.showPerformanceDashboard());
        
        document.body.appendChild(perfBtn);
    }
    
    /**
     * SHOW PERFORMANCE DASHBOARD
     */
    showPerformanceDashboard() {
        const avgCalcTime = this.getAverageCalculationTime();
        const maxMemory = this.getMaxMemory();
        const avgMemory = this.getAverageMemory();
        
        const dashboard = `
╔═══════════════════════════════════════════════════╗
║         📊 PERFORMANCE METRICS                     ║
╠═══════════════════════════════════════════════════╣
║                                                   ║
║ Page Load Time:      ${this.metrics.pageLoadTime.toString().padEnd(25, ' ')} ms ║
║ First Paint:         ${(this.metrics.firstPaint || 0).toFixed(2).padEnd(25, ' ')} ms ║
║ First Contentful:    ${(this.metrics.firstContentfulPaint || 0).toFixed(2).padEnd(25, ' ')} ms ║
║                                                   ║
║ Calculations:        ${this.metrics.calculationTimes.length.toString().padEnd(25, ' ')} total ║
║ Avg Calc Time:       ${avgCalcTime.toFixed(2).padEnd(25, ' ')} ms ║
║ Min Calc Time:       ${Math.min(...this.metrics.calculationTimes).toFixed(2).padEnd(25, ' ')} ms ║
║ Max Calc Time:       ${Math.max(...this.metrics.calculationTimes).toFixed(2).padEnd(25, ' ')} ms ║
║                                                   ║
║ Memory Usage:        ${(avgMemory / 1024 / 1024).toFixed(2).padEnd(25, ' ')} MB (avg) ║
║ Peak Memory:         ${(maxMemory / 1024 / 1024).toFixed(2).padEnd(25, ' ')} MB ║
║                                                   ║
║ 🟢 STATUS: ${this.getPerformanceStatus().padEnd(37, ' ')} ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
        `;
        
        console.log(dashboard);
        alert(dashboard);
    }
    
    /**
     * GET AVERAGE CALCULATION TIME
     */
    getAverageCalculationTime() {
        if (this.metrics.calculationTimes.length === 0) return 0;
        const sum = this.metrics.calculationTimes.reduce((a, b) => a + b, 0);
        return sum / this.metrics.calculationTimes.length;
    }
    
    /**
     * GET MEMORY STATS
     */
    getMaxMemory() {
        return Math.max(...this.metrics.memoryUsage) || 0;
    }
    
    getAverageMemory() {
        if (this.metrics.memoryUsage.length === 0) return 0;
        const sum = this.metrics.memoryUsage.reduce((a, b) => a + b, 0);
        return sum / this.metrics.memoryUsage.length;
    }
    
    /**
     * GET PERFORMANCE STATUS
     */
    getPerformanceStatus() {
        const avgCalc = this.getAverageCalculationTime();
        const memory = this.getAverageMemory();
        
        if (avgCalc < 100 && memory < 30 * 1024 * 1024) {
            return 'EXCELLENT ✅';
        } else if (avgCalc < 300 && memory < 50 * 1024 * 1024) {
            return 'GOOD ✅';
        } else if (avgCalc < 500 && memory < 100 * 1024 * 1024) {
            return 'ACCEPTABLE ⚠️';
        } else {
            return 'NEEDS OPTIMIZATION 🔴';
        }
    }
    
    /**
     * GET PERFORMANCE SUMMARY
     */
    getSummary() {
        return {
            pageLoadTime: this.metrics.pageLoadTime,
            avgCalculationTime: this.getAverageCalculationTime(),
            totalCalculations: this.metrics.calculationTimes.length,
            averageMemory: this.getAverageMemory(),
            peakMemory: this.getMaxMemory(),
            status: this.getPerformanceStatus()
        };
    }
    
    /**
     * EXPORT METRICS
     */
    exportMetrics() {
        return JSON.stringify(this.metrics, null, 2);
    }
}

// Initialize performance monitor
const perfMonitor = new PerformanceMonitor();

// Make it accessible globally
window.perfMonitor = perfMonitor;
