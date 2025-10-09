const JohnnyTestRunner = require('./test-runner');

const testRunner = new JohnnyTestRunner();

// Add test cases for the simple test programs
testRunner.addTest('Basic HALT', 'test/test-programs/halt.ram', {
  finalAcc: 0,
  maxSteps: 5,
  shouldHalt: true,
});

testRunner.addTest('Load/Save Test', 'test/test-programs/loadsave.ram', {
  finalAcc: 42,
  maxSteps: 10,
  shouldHalt: true,
  memoryChanges: {
    10: 42, // SAVE 010 should put 42 at address 10
  },
});

testRunner.addTest('Arithmetic Test', 'test/test-programs/arithmetic.ram', {
  finalAcc: 15, // 10 + 7 - 2 = 15
  maxSteps: 20,
  shouldHalt: true,
  memoryChanges: {
    23: 15,
  },
});

// Run the tests
if (require.main === module) {
  console.log('🧪 Running Basic Test Suite...\n');
  testRunner.runAllTests();
}

module.exports = testRunner;
