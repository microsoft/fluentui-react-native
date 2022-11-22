const fs = require('fs');

const defaultWaitForTimeout = 20000;
const defaultConnectionRetryTimeout = 60000;
const jasmineDefaultTimeout = 60000; // 60 seconds for Jasmine test timeout

exports.config = {
  runner: 'local',
  /* UWP controls are a subset of the Win32 controls. Only some work on our UWP test app,
  so we must specify which ones we want to test here. */
  specs: [
    'src/ActivityIndicator/specs/*.win.ts',
    'src/Button/specs/*.win.ts',
    'src/Checkbox/specs/*.windows.ts', // See spec file for more information
    'src/Link/specs/*.win.ts',
    'src/PersonaCoin/specs/*.win.ts',
    'src/Pressable/specs/*.win.ts',
    'src/Separator/specs/*.win.ts',
    'src/Tabs/specs/*.windows.ts', // See spec file for more information
    'src/Text/specs/*.win.ts',
    'src/TextExperimental/specs/*.win.ts',
    'src/Theme/specs/*.win.ts',
    'src/Tokens/specs/*.win.ts',
  ],
  exclude: [
    /* 'path/to/excluded/files' */
  ],

  maxInstances: 1,
  capabilities: [
    {
      maxInstances: 1, // Maximum number of total parallel running workers.
      platformName: 'windows',
      'appium:automationName': 'windows',
      'appium:deviceName': 'WindowsPC',
      'appium:app': '40411fc5-8e92-4d46-b68d-b62df44b1366_7c3z4tcdk8r62!App',
    },
  ],

  /*
   ** ===============================================================================================
   ** Test Configurations - Define all options that are relevant for the WebdriverIO instance here
   ** ===============================================================================================
   */

  logLevel: 'info', // Level of logging verbosity: trace | debug | info | warn | error | silent
  bail: 0, // If you only want to run your tests until a specific amount of tests have failed use bail (default is 0 - don't bail, run all tests).
  waitforTimeout: defaultWaitForTimeout, // Default timeout for all waitForXXX commands.
  connectionRetryTimeout: defaultConnectionRetryTimeout, // Timeout for any WebDriver request to a driver or grid.
  connectionRetryCount: 3, // Maximum count of request retries to the Selenium server.
  specFileRetries: 3, // The number of times to retry the entire spec file when it fails as a whole.

  port: 4723, // default appium port
  services: [
    [
      'appium',
      {
        logPath: './reports/',
      },
    ],
  ],

  framework: 'jasmine',
  jasmineOpts: {
    defaultTimeoutInterval: jasmineDefaultTimeout,
  },

  reporters: ['spec'],

  autoCompileOpts: {
    autoCompile: true,

    tsNodeOpts: {
      files: true,
    },
  },

  /*
   ** ===================
   ** Hooks
   ** ===================
   ** WebdriverIO provides several hooks you can use to interfere with the test process in order to enhance
   ** it and to build services around it. You can either apply a single function or an array of
   ** methods to it. If one of them returns with a promise, WebdriverIO will wait until that promise got
   ** resolved to continue.
   */
  /**
   * Gets executed once before all workers get launched.
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   */
  // onPrepare: function (config, capabilities) {
  //   require('ts-node/register');
  //   // require('ts-node').register({ files: true });
  //   console.log('<<< NATIVE APP TESTS STARTED >>>');
  // },
  /**
   * Gets executed before a worker process is spawned and can be used to initialise specific service
   * for that worker as well as modify runtime environments in an async fashion.
   * @param  {String} cid      capability id (e.g 0-0)
   * @param  {[type]} caps     object containing capabilities for session that will be spawn in the worker
   * @param  {[type]} specs    specs to be run in the worker process
   * @param  {[type]} args     object that will be merged with the main configuration once worker is initialised
   * @param  {[type]} execArgv list of string arguments passed to the worker process
   */
  // onWorkerStart: function (cid, caps, specs, args, execArgv) {
  // },
  /**
   * Gets executed just before initialising the webdriver session and test framework. It allows you
   * to manipulate configurations depending on the capability or spec.
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that are to be run
   */
  beforeSession: function (/* config, capabilities, specs */) {
    fs.mkdirSync('./errorShots', { recursive: true });
    process.env['E2ETEST_PLATFORM'] = 'windows';
  },
  /**
   * Gets executed before test execution begins. At this point you can access to all global
   * variables like `browser`. It is the perfect place to define custom commands.
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that are to be run
   */
  before: async function () {
    await browser.maximizeWindow();
  },
  /**
   * Runs before a WebdriverIO command gets executed.
   * @param {String} commandName hook command name
   * @param {Array} args arguments that command would receive
   */
  // beforeCommand: function (commandName, args) {
  // },
  /**
   * Hook that gets executed before the suite starts
   * @param {Object} suite suite details
   */
  // beforeSuite: function (suite) {
  // },
  /**
   * Function to be executed before a test (in Mocha/Jasmine) starts.
   */
  // beforeTest: function (test, context) {
  // },
  /**
   * Hook that gets executed _before_ a hook within the suite starts (e.g. runs before calling
   * beforeEach in Mocha)
   */
  // beforeHook: function (test, context) {
  // },
  /**
   * Hook that gets executed _after_ a hook within the suite starts (e.g. runs after calling
   * afterEach in Mocha)
   */
  // afterHook: function (test, context, { error, result, duration, passed, retries }) {
  // },
  /**
   * Function to be executed after a test (in Mocha/Jasmine).
   */
  afterTest: function (test, context, results) {
    const resultString = results.passed ? 'Passed' : 'Failed';
    console.log('\n Test Case: ' + test.description + '.    Result: ' + resultString + '\n');

    // if test passed, ignore, else take and save screenshot.
    if (results.passed) {
      return;
    }

    // get current test title and clean it, to use it as file name
    const fileName = encodeURIComponent(test.description.replace(/\s+/g, '-'));

    // build file path
    const filePath = './errorShots/' + fileName + '.png';

    // save screenshot
    browser.saveScreenshot(filePath);
  },

  /**
   * Hook that gets executed after the suite has ended
   * @param {Object} suite suite details
   */
  // afterSuite: function (suite) {
  // },
  /**
   * Runs after a WebdriverIO command gets executed
   * @param {String} commandName hook command name
   * @param {Array} args arguments that command would receive
   * @param {Number} result 0 - command success, 1 - command error
   * @param {Object} error error object if any
   */
  // afterCommand: function (commandName, args, result, error) {
  // },
  /**
   * Gets executed after all tests are done. You still have access to all global variables from
   * the test.
   * @param {Number} result 0 - test pass, 1 - test fail
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that ran
   */
  // after: function (result, capabilities, specs) {
  // },
  /**
   * Gets executed right after terminating the webdriver session.
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that ran
   */
  // afterSession: function (config, capabilities, specs) {
  // },
  /**
   * Gets executed after all workers got shut down and the process is about to exit. An error
   * thrown in the onComplete hook will result in the test run failing.
   * @param {Object} exitCode 0 - success, 1 - fail
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {<Object>} results object containing test results
   */
  onComplete: function (/* exitCode, config, capabilities, results */) {
    console.log('<<< TESTING FINISHED >>>');
  },
  /**
   * Gets executed when a refresh happens.
   * @param {String} oldSessionId session ID of the old session
   * @param {String} newSessionId session ID of the new session
   */
  //onReload: function(oldSessionId, newSessionId) {
  //}
};
