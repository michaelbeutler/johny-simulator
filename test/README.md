# Test Examples for Johnny Simulator

This directory contains test cases for validating RAM programs.

## Basic Test Cases

### test-basic.js
```javascript
const JohnnyTestRunner = require('./test-runner');

const testRunner = new JohnnyTestRunner();

// Test 1: Simple HALT program
testRunner.addTest('Basic HALT', 'test-programs/halt.ram', {
    finalAcc: 0,
    maxSteps: 5,
    shouldHalt: true
});

// Test 2: Load and save
testRunner.addTest('Load/Save', 'test-programs/loadsave.ram', {
    finalAcc: 42,
    maxSteps: 10,
    shouldHalt: true,
    memoryChanges: {
        10: 42
    }
});

// Test 3: Arithmetic operations
testRunner.addTest('Arithmetic', 'test-programs/arithmetic.ram', {
    finalAcc: 15, // 10 + 7 - 2
    maxSteps: 20,
    shouldHalt: true
});

// Test 4: Loop countdown
testRunner.addTest('Countdown Loop', '../countdown.ram', {
    finalAcc: 0,
    maxSteps: 200,
    shouldHalt: true
});

// Run all tests
if (require.main === module) {
    testRunner.runAllTests();
}

module.exports = testRunner;
```

### Create Test Program Files

Create `test/test-programs/` directory with sample programs:

#### halt.ram
```
10000
```

#### loadsave.ram  
```
1020
4010
10000
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
42
```

#### arithmetic.ram
```
1020
2021
3022
4023
10000
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
10
7  
2
0
```