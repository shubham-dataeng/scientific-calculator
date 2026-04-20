# 📐 BODMAS Guide - Scientific Calculator

## Table of Contents
1. [What is BODMAS?](#what-is-bodmas)
2. [Order of Operations](#order-of-operations)
3. [Examples](#examples)
4. [Implementation](#implementation)
5. [Common Mistakes](#common-mistakes)

---

## What is BODMAS?

**BODMAS** is an acronym that stands for:
- **B** - Brackets
- **O** - Orders (Exponents, Roots)
- **D** - Division
- **M** - Multiplication
- **A** - Addition
- **S** - Subtraction

It defines the sequence in which operations are evaluated in mathematical expressions. This ensures that everyone gets the same answer when solving a math problem.

### Regional Names
BODMAS is also known as:
- **PEMDAS** (North America): Parentheses, Exponents, Multiplication, Division, Addition, Subtraction
- **BEDMAS** (Canada): Brackets, Exponents, Division, Multiplication, Addition, Subtraction
- **BIDMAS** (UK/India): Brackets, Indices, Division, Multiplication, Addition, Subtraction

All refer to the same order of operations.

---

## Order of Operations

### Tier 1: Brackets (Highest Priority)
**Evaluate expressions inside parentheses first**

```
Expression: 2 + 3 × 4
Step 1: No brackets, continue
Result: 2 + 12 = 14
```

```
Expression: (2 + 3) × 4
Step 1: Evaluate bracket first: 2 + 3 = 5
Step 2: Then multiply: 5 × 4 = 20
Result: 20
```

**Key Point:** Brackets override all other rules!

---

### Tier 2: Orders (Exponents & Roots)
**Evaluate powers, exponents, and roots**

```
Expression: 2 + 3²
Step 1: Calculate exponent: 3² = 9
Step 2: Add: 2 + 9 = 11
Result: 11
```

```
Expression: √16 + 2
Step 1: Calculate root: √16 = 4
Step 2: Add: 4 + 2 = 6
Result: 6
```

```
Expression: 2^3 × 3
Step 1: Calculate power: 2³ = 8
Step 2: Multiply: 8 × 3 = 24
Result: 24
```

**Key Point:** Orders are evaluated before multiplication/division!

---

### Tier 3: Division & Multiplication (Left to Right)
**These have equal priority, evaluate from left to right**

```
Expression: 10 ÷ 2 × 3
Step 1: Division first (left): 10 ÷ 2 = 5
Step 2: Multiplication: 5 × 3 = 15
Result: 15
```

**Important!** If multiplication comes first (left), do it first:

```
Expression: 10 × 2 ÷ 3
Step 1: Multiplication first (left): 10 × 2 = 20
Step 2: Division: 20 ÷ 3 = 6.67
Result: 6.67
```

---

### Tier 4: Addition & Subtraction (Left to Right)
**These have equal priority, evaluate from left to right**

```
Expression: 10 - 3 + 2
Step 1: Subtraction first (left): 10 - 3 = 7
Step 2: Addition: 7 + 2 = 9
Result: 9
```

```
Expression: 10 + 3 - 2
Step 1: Addition first (left): 10 + 3 = 13
Step 2: Subtraction: 13 - 2 = 11
Result: 11
```

---

## Examples

### Example 1: Basic BODMAS
```
Expression: 2 + 3 × 4
BODMAS Step:
├─ Brackets: None
├─ Orders: None
├─ Division/Multiplication: 3 × 4 = 12
├─ Addition/Subtraction: 2 + 12 = 14
Result: 14 ✓
```

### Example 2: Using Brackets
```
Expression: (2 + 3) × 4
BODMAS Step:
├─ Brackets: (2 + 3) = 5
├─ Orders: None
├─ Division/Multiplication: 5 × 4 = 20
Result: 20 ✓
```

### Example 3: Complex Expression
```
Expression: 2 + 3 × 4 - 5 ÷ 2
BODMAS Step:
├─ Brackets: None
├─ Orders: None
├─ Multiplication/Division (L→R):
│  ├─ 3 × 4 = 12
│  ├─ 5 ÷ 2 = 2.5
├─ Addition/Subtraction (L→R):
│  ├─ 2 + 12 = 14
│  ├─ 14 - 2.5 = 11.5
Result: 11.5 ✓
```

### Example 4: Nested Brackets
```
Expression: ((2 + 3) × 4) - 5
BODMAS Step:
├─ Brackets (innermost first): (2 + 3) = 5
├─ Brackets: (5 × 4) = 20
├─ Subtraction: 20 - 5 = 15
Result: 15 ✓
```

### Example 5: With Powers
```
Expression: 2 + 3² × 2
BODMAS Step:
├─ Brackets: None
├─ Orders: 3² = 9
├─ Multiplication: 9 × 2 = 18
├─ Addition: 2 + 18 = 20
Result: 20 ✓
```

### Example 6: With Functions
```
Expression: sin(π/2) + cos(0) × 2
BODMAS Step:
├─ Brackets: (π/2) = 1.57...
├─ Functions in brackets: sin(1.57...) = 1, cos(0) = 1
├─ Multiplication: 1 × 2 = 2
├─ Addition: 1 + 2 = 3
Result: 3 ✓
```

---

## Implementation

### In the Calculator
The Scientific Calculator uses **math.js** library which automatically handles BODMAS:

```javascript
// User enters: "2 + 3 * 4"
// Calculator automatically evaluates as:
// Step 1: 3 * 4 = 12 (multiplication first)
// Step 2: 2 + 12 = 14 (then addition)
// Result: 14
```

### Symbol Conversions
The calculator converts display symbols to math.js compatible formats:

| Display | Internal | Name |
|---------|----------|------|
| ÷ | / | Division |
| × | * | Multiplication |
| ^ | ** | Exponent |
| − | - | Minus |
| π | pi | Pi (3.14159...) |
| √ | sqrt() | Square Root |
| ∛ | cbrt() | Cube Root |

---

## Common Mistakes

### ❌ Mistake 1: Not Respecting Multiplication/Division Order
```
WRONG: 10 ÷ 2 × 3 = 1.67
├─ Doing division last: 10 ÷ (2 × 3) = 10 ÷ 6 = 1.67 ✗

RIGHT: 10 ÷ 2 × 3 = 15
├─ Left to right: (10 ÷ 2) × 3 = 5 × 3 = 15 ✓
```

### ❌ Mistake 2: Ignoring Brackets
```
WRONG: 2 + 3 × 4 = 20
├─ Doing addition first: (2 + 3) × 4 = 5 × 4 = 20 ✗

RIGHT: 2 + 3 × 4 = 14
├─ Multiplication first: 2 + (3 × 4) = 2 + 12 = 14 ✓
```

### ❌ Mistake 3: Wrong Order with Subtraction
```
WRONG: 10 - 5 - 2 = 7
├─ Right to left: 10 - (5 - 2) = 10 - 3 = 7 ✗

RIGHT: 10 - 5 - 2 = 3
├─ Left to right: (10 - 5) - 2 = 5 - 2 = 3 ✓
```

### ❌ Mistake 4: Forgetting About Exponents
```
WRONG: 2 + 3 × 2² = 16
├─ Wrong: 2 + 3 × 4 = 2 + 12 = 14 ✗

RIGHT: 2 + 3 × 2² = 14
├─ Exponent first: 3 × 4 = 12
├─ Then add: 2 + 12 = 14 ✓
```

---

## Quick Reference Table

| Priority | Operation | Example | Result |
|----------|-----------|---------|--------|
| 1 | Brackets | (2+3)×4 | 20 |
| 2 | Orders | 2³+1 | 9 |
| 3 | Division/Mult | 10÷2×3 | 15 |
| 4 | Addition/Subt | 5-2+1 | 4 |

---

## Testing Your Knowledge

Try these expressions in the calculator:

1. `2 + 3 * 4` = ? (Answer: 14)
2. `(2 + 3) * 4` = ? (Answer: 20)
3. `10 - 4 / 2` = ? (Answer: 8)
4. `2^3 + 1` = ? (Answer: 9)
5. `(2^3 - 4) * 2` = ? (Answer: 8)
6. `sin(π/2) + 1` = ? (Answer: 2)
7. `sqrt(16) - 2` = ? (Answer: 2)
8. `5 * 2 / 5 * 2` = ? (Answer: 4)

---

## Why BODMAS Matters

Without BODMAS, mathematical expressions would be ambiguous:
- `2 + 3 × 4` could be interpreted as `(2 + 3) × 4 = 20` OR `2 + (3 × 4) = 14`
- BODMAS ensures it's always `2 + (3 × 4) = 14`

This universal rule allows mathematicians, engineers, and students worldwide to communicate clearly and get the same answers!

---

## Resources

- [BODMAS Wikipedia](https://en.wikipedia.org/wiki/Order_of_operations)
- [Math.js Documentation](https://mathjs.org/)
- [Khan Academy - Order of Operations](https://www.khanacademy.org/)

---

**Built into the Scientific Calculator to ensure all expressions are evaluated correctly with BODMAS compliance! 🧮**
