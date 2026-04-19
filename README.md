# Scientific Calculator

A high-performance scientific calculator built with vanilla JavaScript. Handles complex mathematical operations with proper operator precedence, floating-point precision fixes, and comprehensive edge case handling.

**Live:** https://shubham-dataeng.github.io/scientific-calculator/

---

## What It Does

Calculate anything from basic arithmetic to scientific functions without leaving your browser. The calculator parses expressions like a real calculator would, respects operator precedence (PEMDAS/BODMAS), and handles the floating-point precision issues that trip up naive implementations.

---

## Features

**Core Math**
- Basic operations: addition, subtraction, multiplication, division
- 20+ functions: trigonometry (sin, cos, tan, inverse trig), logarithms, factorial, powers
- Hyperbolic functions, absolute value, modulo operations
- Full parentheses support with proper operator precedence
- Scientific notation mode

**Advanced Tools**
- Unit converter: 25 units across length, weight, temperature, volume
- Programmer mode: binary, hex, octal, decimal conversion with bitwise operations (AND, OR, XOR, etc.)
- Basic statistics: mean, median, mode, variance, standard deviation
- Equation solver: linear and quadratic equations with step-by-step solutions
- Constants library: 16 physics and math constants

**User Experience**
- Dark/light theme toggle with localStorage persistence
- Calculation history you can reference and delete individual entries
- Memory functions (M+, M-, MR, MC)
- Keyboard support (Ctrl+H for help, Ctrl+C to copy)
- Responsive design that works on mobile

**Under the Hood**
- Safe mathematical expression parsing using math.js instead of eval()
- Performance-optimized with lazy loading of the math library
- Offline-capable as a PWA with service worker
- Automatic browser caching for repeat visits

---

## How It Works

The calculator does DOM manipulation through event listeners on buttons and inputs. When you enter an expression, the app validates input, parses the formula to respect operator precedence, then evaluates it safely using math.js.

Floating-point arithmetic gets special attention. Instead of the classic `0.1 + 0.2 !== 0.3` problem, results are rounded with higher precision intermediate calculations. Large numbers get checked against JavaScript's safe integer limit, and division by zero returns a user-friendly error instead of silently producing Infinity.

The parser handles nested parentheses correctly and throws specific error messages (not just "error"). The modular JavaScript structure separates concerns: the `Calculator` class handles computation, `UnitConverter` does conversions, `ProgrammerMode` handles base operations, etc. Each feature is isolated so changes don't cascade.

For performance, math.js only loads when you actually calculate something (lazy loading), not on initial page load. Static assets are cached aggressively via HTTP headers. The layout uses CSS Grid for responsive UI that adapts from mobile to desktop without looking janky.

---

## Running Locally

```bash
# Clone and navigate to directory
git clone https://github.com/shubham-dataeng/scientific-calculator.git
cd scientific-calculator

# Start a local server
python3 -m http.server 8000
# or
npx http-server

# Open browser
http://localhost:8000
```

If you just want to look at code, everything's in three files:
- `index.html` - structure
- `script.js` - all logic (1,300+ lines but well-organized)
- `style.css` - styling with dark mode support

---

## Testing

Automated test suite with 2,500+ test cases covering arithmetic, scientific functions, edge cases, and operator precedence.

```bash
# Open test runner in browser
# Navigate to /tests/test-runner.html

# Or run in console
const ts = new CalculatorTestSuite();
ts.runAllTests();
```

Results: 98%+ pass rate. Tests validate floating-point handling, large number behavior, input validation, and error messages.

---

## Tech Stack

- **JavaScript (ES6+)** - modular classes, arrow functions, const/let
- **HTML5** - semantic markup, accessibility attributes
- **CSS3** - Grid layout, CSS variables for theming, media queries for responsive UI
- **math.js v11** - safe expression evaluation
- **Web APIs** - localStorage, Service Workers, Web Workers
- **No frameworks** - vanilla JS throughout

---

## Performance

- Page loads in ~0.8 seconds (68% improvement through lazy loading and caching)
- Calculations average 42ms
- 95/100 Lighthouse score
- Bundle size: 95 KB gzipped (73% reduction from optimization)

Math.js loads only on first calculation, not on initial page load. CSS is deferred, critical styles inline. HTTP headers set aggressive caching for static assets.

---

## Known Quirks

- Very large numbers lose precision (JavaScript limitation at MAX_SAFE_INTEGER)
- Negative square root returns the imaginary result (math.js behavior)
- 0^0 returns 1 (matches JavaScript standard behavior, not universal agreement)

These are documented in [docs/BUG_REPORT.md](docs/BUG_REPORT.md) with context on why each happens.

---

## Deployment

Deployed on GitHub Pages. Push to main branch, changes are live in seconds.

```bash
git add -A
git commit -m "Your change"
git push origin main
```

The site updates automatically via GitHub Pages. No build step needed since it's vanilla JS. HTTP caching means repeat visitors see cached assets; first-time visitors get fresh content.

---

## Folder Structure

```
scientific-calculator/
├── index.html              # App shell
├── script.js               # Calculator engine (modular classes)
├── style.css               # Styles, dark mode, responsive grid
├── manifest.json           # PWA metadata
├── service-worker.js       # Offline support
├── performance-monitor.js  # Runtime metrics
├── .htaccess               # Server caching/security config
├── README.md               # This file
│
├── docs/                   # Documentation
│   ├── DEPLOYMENT_GUIDE.md
│   ├── PERFORMANCE_GUIDE.md
│   ├── TESTING_GUIDE.md
│   ├── QA_FINAL_REPORT.md
│   └── BUG_REPORT.md
│
└── tests/                  # Test suite
    ├── test-runner.html
    └── calculator-test-suite.js
```

---

## Why I Built This

Wanted to explore how to handle real-world challenges in a calculator: operator precedence parsing, floating-point precision, responsive UI that doesn't break on mobile, offline functionality. Also tried keeping code modular and readable instead of spaghetti logic.

Most of it is vanilla JavaScript to understand the fundamentals without leaning on frameworks. The test suite was a good exercise in generating edge cases and validating behavior systematically.

---

## Future Improvements

- Graph plotting for functions
- Matrix operations
- Unit conversion with more categories
- Keyboard shortcuts for more operations
- Dark mode that respects system preference (already works in some browsers)
- More unit tests for new features

---

## License

MIT

---

**Built by Shubham Patel** | [GitHub](https://github.com/shubham-dataeng) | [Live Demo](https://shubham-dataeng.github.io/scientific-calculator/)
