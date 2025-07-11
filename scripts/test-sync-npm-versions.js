const { compareVersions, getLatestNpmVersion } = require('./sync-npm-versions');

/**
 * Test the compareVersions function
 */
function testCompareVersions() {
  console.log('Testing compareVersions function...');
  
  const tests = [
    { v1: '1.0.0', v2: '1.0.0', expected: 0 },
    { v1: '1.0.1', v2: '1.0.0', expected: 1 },
    { v1: '1.0.0', v2: '1.0.1', expected: -1 },
    { v1: '2.0.0', v2: '1.9.9', expected: 1 },
    { v1: '1.10.0', v2: '1.2.0', expected: 1 },
    { v1: '1.0.0', v2: '1.0.0-beta', expected: 1 }, // Will treat -beta as 0
  ];
  
  tests.forEach(({ v1, v2, expected }, index) => {
    const result = compareVersions(v1, v2);
    const passed = result === expected;
    console.log(`Test ${index + 1}: ${v1} vs ${v2} = ${result} (expected ${expected}) ${passed ? '✅' : '❌'}`);
  });
}

/**
 * Test the NPM version fetching (with a known package)
 */
async function testNpmVersionFetch() {
  console.log('\nTesting NPM version fetch...');
  
  try {
    const version = await getLatestNpmVersion('react');
    console.log(`✅ Successfully fetched React version: ${version}`);
  } catch (error) {
    console.log(`❌ Failed to fetch React version: ${error.message}`);
  }
  
  try {
    const version = await getLatestNpmVersion('this-package-definitely-does-not-exist-12345');
    console.log(`⚠️  Unexpectedly found version for non-existent package: ${version}`);
  } catch (error) {
    console.log(`✅ Correctly failed to fetch non-existent package`);
  }
}

async function runTests() {
  console.log('🧪 Running tests for sync-npm-versions.js\n');
  
  testCompareVersions();
  await testNpmVersionFetch();
  
  console.log('\n✨ Tests complete!');
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests };
