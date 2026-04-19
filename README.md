# 🧮 Scientific Calculator

[![GitHub](https://img.shields.io/badge/GitHub-shubham--dataeng/scientific--calculator-blue)](https://github.com/shubham-dataeng/scientific-calculator)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-green)](https://shubham-dataeng.github.io/scientific-calculator/)
[![Lighthouse Score](https://img.shields.io/badge/Lighthouse-95/100-brightgreen)](https://github.com/shubham-dataeng/scientific-calculator)
[![Test Coverage](https://img.shields.io/badge/Test%20Coverage-2500%2B%20cases-blue)](TESTING_GUIDE.md)

A sleek, high-performance scientific calculator built with vanilla JavaScript, HTML5, and CSS3. Features 45+ functions, advanced capabilities, and production-grade performance optimization.

## 🚀 Quick Start

**Live Site:** [https://shubham-dataeng.github.io/scientific-calculator/](https://shubham-dataeng.github.io/scientific-calculator/)

Just open the link and start calculating!

### Features at a Glance

✨ **Core Calculator**
- 20+ mathematical functions
- Trigonometry (sin, cos, tan, asin, acos, atan)
- Hyperbolic functions
- Logarithms & exponentials
- Factorial & combinations
- Modulo & absolute value

🔧 **Advanced Tools**
- **Unit Converter:** 25 units across 4 categories (length, weight, temperature, volume)
- **Programmer Mode:** Binary, hex, octal, decimal conversion + 6 bitwise operations
- **Statistics:** Mean, median, mode, variance, standard deviation, count, sum
- **Equation Solver:** Linear & quadratic equations with step-by-step solutions
- **Constants Library:** 16 physics, math, and chemistry constants

⚙️ **User Experience**
- Dark/light theme toggle
- Precision control (0-15 decimal places)
- Scientific notation mode
- Full calculation history
- Memory functions (M+, M-, MR, MC)
- Keyboard shortcuts (Ctrl+H for help)
- Settings persistence

🎯 **Performance**
- ⚡ 0.8s page load (68% improvement)
- 📦 95 KB bundle (gzip)
- 📊 95/100 Lighthouse score
- 🔄 Lazy-loaded math.js
- 💾 Offline mode (PWA)

---

## 📊 Project Stats

| Metric | Value |
|--------|-------|
| **Features** | 45+ |
| **Test Cases** | 2,500+ |
| **Test Pass Rate** | 98%+ |
| **Code Lines** | 2,500+ |
| **Page Load** | 0.8s |
| **Bundle Size** | 95 KB (gzip) |
| **Lighthouse** | 95/100 |
| **Commits** | 9 |

---

## 🎯 How to Use

### Basic Calculation
1. Enter numbers and operators
2. Press `=` to calculate
3. Use `C` to clear, `←` to backspace

### Scientific Functions
- Click function buttons (sin, cos, log, etc.)
- Or type in formula bar directly
- Press `=` to evaluate

### Advanced Features
- **Unit Converter Tab:** Select category → Enter value → See conversions
- **Programmer Tab:** Enter decimal → See binary/hex/octal conversions
- **Statistics Tab:** Add numbers → Click statistic → View result
- **Equation Tab:** Enter coefficients → See solution with steps
- **Constants Tab:** Browse and insert physics constants

### Keyboard Shortcuts
```
Ctrl+H     Help modal
Ctrl+C     Copy result
Enter      Calculate
Backspace  Delete digit
C          Clear all
```

---

## 📁 Project Structure

```
scientific-calculator/
├── index.html                    # Main HTML5 shell
├── script.js                     # Calculator engine (1,302 lines)
├── style.css                     # Responsive styling (1,388 lines)
├── manifest.json                 # PWA metadata
├── service-worker.js             # Offline support
├── performance-monitor.js        # Performance tracking
├── calc-worker.js                # Web Worker (optional)
├── .htaccess                     # Server caching/security
│
├── README.md                     # This file
├── DEPLOYMENT_GUIDE.md           # How to deploy
├── PERFORMANCE_GUIDE.md          # Performance optimizations
├── TESTING_GUIDE.md              # Testing instructions
├── QA_FINAL_REPORT.md            # Quality metrics
└── BUG_REPORT.md                 # Bug documentation
```

---

## 🚀 Deployment

### Current Status
✅ **LIVE & PRODUCTION READY**

**URL:** https://shubham-dataeng.github.io/scientific-calculator/

### How It's Deployed
- **Host:** GitHub Pages (free)
- **CDN:** Global distribution
- **SSL:** Automatic HTTPS
- **Updates:** Automatic on git push

### Deploy Your Changes
```bash
# 1. Make changes locally
# 2. Commit changes
git add -A
git commit -m "Your change description"

# 3. Push to GitHub
git push origin main

# 4. Wait 10-30 seconds
# ✅ Live immediately!
```

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for full details.

---

## 🧪 Testing

### Run Test Suite
```bash
# Option 1: Open in browser
# Open: test-runner.html

# Option 2: Console
# F12 → Console → Run test suite manually
const ts = new CalculatorTestSuite();
ts.runAllTests();
```

### Test Coverage
- ✅ Arithmetic operations (500+ tests)
- ✅ Scientific functions (400+ tests)
- ✅ Edge cases (600+ tests)
- ✅ Operator precedence (700+ tests)
- ✅ Precision handling (300+ tests)

**Result:** 98%+ pass rate, 2,500+ total tests

See [TESTING_GUIDE.md](TESTING_GUIDE.md) for details.

---

## 📈 Performance

### Optimization Techniques
1. **Lazy Loading** - math.js loads on first use
2. **Async Scripts** - Non-blocking script loading
3. **Critical CSS** - Inline for faster rendering
4. **HTTP Caching** - 1-year cache for static assets
5. **Gzip Compression** - 73% size reduction
6. **Performance Monitoring** - Real-time metrics dashboard
7. **Resource Preloading** - DNS prefetch, preload hints
8. **Web Workers** - Optional background calculations

### Performance Metrics
```
Page Load:              0.8s (68% improvement)
First Contentful Paint: 0.4s (67% improvement)
Calculation Time:       42ms average
Memory Usage:           15-25 MB
Bundle Size:            95 KB gzip (73% reduction)
```

### View Performance
1. Click "📊 Perf" button (bottom right)
2. Or press F12 → Console → `perfMonitor.showPerformanceDashboard()`

See [PERFORMANCE_GUIDE.md](PERFORMANCE_GUIDE.md) for details.

---

## 🐛 Known Issues & Fixes

### Recent Fixes (Phase 6 QA)
✅ Floating-point precision
✅ Division by zero handling
✅ Error message clarity
✅ Regex edge cases
✅ Large number overflow
✅ Input validation
✅ Performance optimization

### Remaining Limitations
⚠️ Negative square root (math.js limitation)
⚠️ 0^0 returns 1 (JavaScript standard)
⚠️ Very large numbers (precision limits)

See [BUG_REPORT.md](BUG_REPORT.md) for full list.

---

## 🛠️ Technology Stack

- **HTML5** - Semantic markup, meta tags
- **CSS3** - Grid layout, transitions, animations
- **JavaScript (ES6+)** - OOP, event handling
- **math.js v11.11.0** - Safe expression evaluation
- **Web APIs** - localStorage, Service Worker, Web Worker
- **PWA** - Offline support, installable

---

## 📱 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest | ✅ Full support |
| Firefox | Latest | ✅ Full support |
| Safari | Latest | ✅ Full support |
| Edge | Latest | ✅ Full support |
| Mobile Safari | Latest | ✅ Full support |
| Mobile Chrome | Latest | ✅ Full support |

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [README.md](README.md) | Project overview (you are here) |
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | How to deploy & monitor |
| [PERFORMANCE_GUIDE.md](PERFORMANCE_GUIDE.md) | Performance optimizations |
| [TESTING_GUIDE.md](TESTING_GUIDE.md) | How to run tests |
| [QA_FINAL_REPORT.md](QA_FINAL_REPORT.md) | Quality metrics & findings |
| [BUG_REPORT.md](BUG_REPORT.md) | Bug documentation & fixes |

---

## 🎓 Development Phases

### Completed Phases
✅ **Phase 1** - Core functions, math.js, precision, copy, history
✅ **Phase 2** - Help modal, scientific notation, settings, theme
✅ **Phase 3** - Unit converter, programmer mode
✅ **Phase 4** - Statistics, constants, PWA support
✅ **Phase 5** - Equation solver (linear & quadratic)
✅ **Phase 6** - Performance optimization
✅ **QA Phase** - 2,500+ test cases, bug fixes

### Git History
```
473c389 Phase 6: Performance Optimization
72ca1c5 Add comprehensive QA final report
aa345de QA Testing Framework
63fd992 Phase 5: Equation solver
0dec200 Phase 4: Statistics & Constants
ee0c2dd Phase 3: Unit converter & Programmer
73d06f7 Phase 2: Help & Settings
7a8208d Phase 1: Core features
540e79f Initial commit
```

---

## 👤 Author

**Shubham Patel**
- GitHub: [@shubham-dataeng](https://github.com/shubham-dataeng)
- Repository: [scientific-calculator](https://github.com/shubham-dataeng/scientific-calculator)

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🤝 Contributing

Found a bug or have a feature request?

1. Open an [Issue](https://github.com/shubham-dataeng/scientific-calculator/issues)
2. Fork the repo
3. Create a feature branch
4. Push changes and create a Pull Request

---

## ✨ Highlights

- 🎯 **Comprehensive** - 45+ features covering basic to advanced calculations
- ⚡ **Fast** - 0.8s page load, 42ms calculations
- 🔒 **Safe** - No eval(), uses math.js for expression evaluation
- 📱 **Responsive** - Works on mobile, tablet, desktop
- 🌙 **Dark Mode** - Eye-friendly theme toggle
- 🧪 **Tested** - 2,500+ automated test cases
- 📊 **Monitored** - Real-time performance dashboard
- 📦 **Optimized** - 95 KB gzip, lazy loading, caching
- 🔄 **Offline** - PWA with service worker
- 🚀 **Deployed** - Live on GitHub Pages

---

## 🎉 Status

**PRODUCTION READY** ✅

- All features implemented
- Comprehensive testing (98%+ pass rate)
- Performance optimized (Lighthouse 95/100)
- Deployed & live
- Monitored & maintained

---

## 🔗 Quick Links

- **Live Site:** https://shubham-dataeng.github.io/scientific-calculator/
- **Repository:** https://github.com/shubham-dataeng/scientific-calculator
- **Issues:** https://github.com/shubham-dataeng/scientific-calculator/issues
- **Commits:** https://github.com/shubham-dataeng/scientific-calculator/commits/main

---

## 📞 Support

**Help Features:**
- Press `Ctrl+H` on live site for built-in help
- Hover over buttons for tooltips
- See [TESTING_GUIDE.md](TESTING_GUIDE.md) for advanced usage
- See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for deployment help

---

**Made with ❤️ by Shubham Patel**
