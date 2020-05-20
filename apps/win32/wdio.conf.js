const path = require('path');

const appPath = path.resolve(path.dirname(require.resolve('@office-iss/rex-win32/rex-win32.js')), 'ReactTest.exe');
const appArgs = 'basePath ' + path.resolve('dist') + ' plugin defaultplugin bundle index component FluentTester';
const appDir = path.dirname(require.resolve('@office-iss/rex-win32/rex-win32.js'));

const baseUrl = 'https://webdriver.io';

exports.config = {
  runner: 'local', // Where should your test be launched
  specs: ['../fluent-tester/src/E2E/test/**/*.ts'],
  exclude: [
    /* 'path/to/excluded/files' */
  ],

  maxInstances: 1,
  capabilities: [
    {
      maxInstances: 1, // Maximum number of total parallel running workers.
      platformName: 'windows',
      deviceName: 'WindowsPC',
      app: appPath,
      appArguments: appArgs,
      appWorkingDir: appDir
    }
  ],

  /*
   ** ===================
   ** Test Configurations
   ** ===================
   ** Define all options that are relevant for the WebdriverIO instance here
   */

  logLevel: 'info', // Level of logging verbosity: trace | debug | info | warn | error | silent

  // If you only want to run your tests until a specific amount of tests have failed use bail (default is 0 - don't bail, run all tests).
  bail: 0,
  baseUrl: baseUrl, // Shorten url command calls by setting a base URL.
  waitforTimeout: 10000, // Default timeout for all waitForXXX commands.
  connectionRetryTimeout: 9000, // Timeout for any WebDriver request to a driver or grid.
  connectionRetryCount: 2, // Maximum count of request retries to the Selenium server.

  port: 4723, // default appium port
  services: ['appium'],
  appium: {
    logPath: './src/reports/',
    args: {
      port: '4723'
    }
  },

  framework: 'jasmine',
  jasmineNodeOpts: {
    defaultTimeoutInterval: 10000
  },

  reporters: ['dot', 'spec'],

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
  // beforeSession: function (config, capabilities, specs) {
  // },
  /**
   * Gets executed before test execution begins. At this point you can access to all global
   * variables like `browser`. It is the perfect place to define custom commands.
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that are to be run
   */
  before: function() {
    // not needed for Cucumber
    require('ts-node').register({ files: true });
    browser.maximizeWindow();
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
  afterTest: function(test) {
    if (test.error !== undefined) {
      const name = 'ERROR-' + Date.now();
      browser.saveScreenshot('./src/errorShots/' + name + '.png');
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
  onComplete: function(exitCode, config, capabilities, results) {
    console.log('<<< TESTING FINISHED >>>');
  }
  /**
   * Gets executed when a refresh happens.
   * @param {String} oldSessionId session ID of the old session
   * @param {String} newSessionId session ID of the new session
   */
  //onReload: function(oldSessionId, newSessionId) {
  //}
};
