const path = require('path');
const fs = require('fs');

const appPath = path.resolve(path.dirname(require.resolve('@office-iss/rex-win32/rex-win32.js')), 'ReactTest.exe');
const appArgs = 'basePath ' + path.resolve('dist') + ' plugin defaultplugin bundle index.win32 component FluentTester';
const appDir = path.dirname(require.resolve('@office-iss/rex-win32/rex-win32.js'));

const defaultWaitForTimeout = 20000;
const defaultConnectionRetryTimeout = 60000;
const jasmineDefaultTimeout = 60000; // 60 seconds for Jasmine test timeout

exports.config = {
  runner: 'local', // Where should your test be launched
  specs: ['../E2E/src/**/specs/*.win.ts'],
  exclude: [],

  capabilities: [
    {
      maxInstances: 1, // Maximum number of total parallel running workers.
      platformName: 'windows',
      'appium:automationName': 'windows',
      'appium:deviceName': 'WindowsPC',
      'appium:app': appPath,
      'appium:appArguments': appArgs,
      'appium:appWorkingDir': appDir,
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
    process.env['E2ETEST_PLATFORM'] = 'win32';
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
  afterTest: async function (test, context, results) {
    const resultString = results.passed ? 'Passed' : 'Failed';
    console.log('\n Test Case: ' + test.description + '.    Result: ' + resultString + '\n');

    // if test passed, ignore, else take and save screenshot. Unless it's the first test that boots the app,
    // it may be useful to have a screenshot of the app on load.
    if (results.passed) {
      return;
    }

    // get current test title and clean it, to use it as file name
    const fileName = encodeURIComponent(test.description.replace(/\s+/g, '-'));

    // build file path
    const filePath = './errorShots/' + fileName + '.png';

    /* If there are more than one instance of the app open, we know an assert popped up. Since the test already failed and a screenshot was captured
     * we want to close the assert popup. If we don't it will stay open and negatively interact with logic in our CI pipeline. */
    const windowHandles = await browser.getWindowHandles();
    if (windowHandles.length > 1) {
      /* Switch to the Assert window - Take a screenshot and close the assert */
      await browser.switchToWindow(windowHandles[0]);
      await browser.saveScreenshot(filePath);
      await browser.closeWindow();

      /* Switch back to FluentTester and close. The test harness has trouble closing the app when an assert fired */
      await browser.switchToWindow(windowHandles[1]);
      await browser.closeWindow();
    } else {
      // save screenshot
      await browser.saveScreenshot(filePath);
    }
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
