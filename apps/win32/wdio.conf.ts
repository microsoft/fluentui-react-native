/*
 * This WebDriverIO config file runs Win32 FluentUI React-Native spec files in the ReactTest application. The corresponding
 * Motif file that enacts this test runner is FurnJsReactTestScn.scn that lives in the uextest project.
 */

// The first two cmd args are consistent across all uses of this file (specPath and resultsPath).
// The last arg can be one of two options, depending on what host application you want to test.
// The two options are:
//    ReactTest - In this case, pass in "appDirectory {pathToReactTest.exe}"
// We need the path  for where ReactTest is installed on the remote lab machine. This is found in ReactTestClass.cs.
// 'wdioScript appDirectory C://path/to/app specPath C://path/to/specs resultsPath C://path/to/results`
let appWorkingDir,
  nativeWindowHandle,
  specPath,
  resultsPath,
  appPath = '';
const myArgs = process.argv.slice(3);

if (
  myArgs.length == 6 &&
  myArgs[0] == 'specPath' &&
  myArgs[2] == 'resultsPath' &&
  (myArgs[4] == 'appDirectory' || myArgs[4] == 'nativeWindowHandle')
) {
  specPath = myArgs[1];
  resultsPath = myArgs[3];
  if (myArgs[4] == 'appDirectory') {
    appWorkingDir = myArgs[5];
    appPath = appWorkingDir + '\\reacttest.exe';
  } else {
    nativeWindowHandle = myArgs[5];
  }
} else {
  console.error(
    "ERROR! When running this file, you must pass in additional parameters. appDirectory, specPath, and resultsPath. In the form of: 'wdioScript appDirectory C://path/to/app specPath C://path/to/specs resultsPath C://path/to/results`",
  );
}

const commonCapabilities = {
  maxInstances: 1,
  platformName: 'windows',
  'appium:automationName': 'windows',
  'appium:deviceName': 'WindowsPC',
};

console.log('appWorkingDir: "' + appWorkingDir + '"\n');
console.log('nativeWindowHandle: "' + nativeWindowHandle + '"\n');

const capabilities = appWorkingDir
  ? {
      ...commonCapabilities,
      'appium:app': appPath,
      'appium:appArguments': 'bundle furn.win32 component FluentTester',
      'appium:appWorkingDir': appWorkingDir,
    }
  : {
      ...commonCapabilities,
      'appium:appTopLevelWindow': nativeWindowHandle,
    };

export const config: WebdriverIO.Config = {
  runner: 'local',
  specs: [specPath],
  capabilities: [capabilities],
  logLevel: 'debug',
  bail: 0,
  waitforTimeout: 20000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  specFileRetries: 3, // The number of times to retry the entire spec file when it fails as a whole.

  port: 4723, // default appium port
  services: [
    [
      'appium',
      {
        logPath: './lib/reports/',
      },
    ],
  ],

  framework: 'jasmine',

  reporters: ['spec'],
  jasmineOpts: {
    defaultTimeoutInterval: 3 * 60 * 1000, // 3min
  },

  autoCompileOpts: {
    autoCompile: true,

    tsNodeOpts: {
      transpileOnly: true,
      project: 'tsconfig.json',
      ignore: ['/node_modules'],
    },
  },

  before: async function () {
    await browser.maximizeWindow();
  },

  onComplete: function (/* exitCode, config, capabilities, results */) {
    // const mergeResults = require('wdio-json-reporter/mergeResults');
    // mergeResults(resultsPath, 'results-*', 'finalTestResults.json');
  },
};

exports.config = config;

// const path = require('path');
// const fs = require('fs');

// const appPath = path.resolve(path.dirname(require.resolve('@office-iss/rex-win32/rex-win32.js')), 'ReactTest.exe');
// const appArgs = 'basePath ' + path.resolve('dist') + ' plugin defaultplugin bundle index.win32 component FluentTester';
// const appDir = path.dirname(require.resolve('@office-iss/rex-win32/rex-win32.js'));

// const defaultWaitForTimeout = 20000;
// const defaultConnectionRetryTimeout = 60000;
// const jasmineDefaultTimeout = 60000; // 60 seconds for Jasmine test timeout

// exports.config = {
//   runner: 'local', // Where should your test be launched
//   specs: ['../E2E/src/**/specs/*.win.ts'],
//   exclude: [],

//   capabilities: [
//     {
//       maxInstances: 1, // Maximum number of total parallel running workers.
//       platformName: 'windows',
//       'appium:automationName': 'windows',
//       'appium:deviceName': 'WindowsPC',
//       'appium:app': appPath,
//       'appium:appArguments': appArgs,
//       'appium:appWorkingDir': appDir,
//     },
//   ],

//   /*
//    ** ===============================================================================================
//    ** Test Configurations - Define all options that are relevant for the WebdriverIO instance here
//    ** ===============================================================================================
//    */

//   logLevel: 'info', // Level of logging verbosity: trace | debug | info | warn | error | silent
//   bail: 0, // If you only want to run your tests until a specific amount of tests have failed use bail (default is 0 - don't bail, run all tests).
//   waitforTimeout: defaultWaitForTimeout, // Default timeout for all waitForXXX commands.
//   connectionRetryTimeout: defaultConnectionRetryTimeout, // Timeout for any WebDriver request to a driver or grid.
//   connectionRetryCount: 3, // Maximum count of request retries to the Selenium server.
//   specFileRetries: 3, // The number of times to retry the entire spec file when it fails as a whole.

//   port: 4723, // default appium port
//   services: [
//     [
//       'appium',
//       {
//         logPath: './reports/',
//       },
//     ],
//   ],

//   framework: 'jasmine',
//   jasmineOpts: {
//     defaultTimeoutInterval: jasmineDefaultTimeout,
//   },

//   reporters: ['spec'],

//   autoCompileOpts: {
//     autoCompile: true,

//     tsNodeOpts: {
//       files: true,
//     },
//   },

//   /*
//    ** ===================
//    ** Hooks
//    ** ===================
//    ** WebdriverIO provides several hooks you can use to interfere with the test process in order to enhance
//    ** it and to build services around it. You can either apply a single function or an array of
//    ** methods to it. If one of them returns with a promise, WebdriverIO will wait until that promise got
//    ** resolved to continue.
//    */
//   /**
//    * Gets executed once before all workers get launched.
//    * @param {Object} config wdio configuration object
//    * @param {Array.<Object>} capabilities list of capabilities details
//    */
//   // onPrepare: function (config, capabilities) {
//   // },
//   /**
//    * Gets executed before a worker process is spawned and can be used to initialise specific service
//    * for that worker as well as modify runtime environments in an async fashion.
//    * @param  {String} cid      capability id (e.g 0-0)
//    * @param  {[type]} caps     object containing capabilities for session that will be spawn in the worker
//    * @param  {[type]} specs    specs to be run in the worker process
//    * @param  {[type]} args     object that will be merged with the main configuration once worker is initialised
//    * @param  {[type]} execArgv list of string arguments passed to the worker process
//    */
//   // onWorkerStart: function (cid, caps, specs, args, execArgv) {
//   // },
//   /**
//    * Gets executed just before initialising the webdriver session and test framework. It allows you
//    * to manipulate configurations depending on the capability or spec.
//    * @param {Object} config wdio configuration object
//    * @param {Array.<Object>} capabilities list of capabilities details
//    * @param {Array.<String>} specs List of spec file paths that are to be run
//    */
//   beforeSession: (/* config, capabilities, specs */) => {
//     fs.mkdirSync('./errorShots', { recursive: true });
//     process.env['E2ETEST_PLATFORM'] = 'win32';
//   },
//   /**
//    * Gets executed before test execution begins. At this point you can access to all global
//    * variables like `browser`. It is the perfect place to define custom commands.
//    * @param {Array.<Object>} capabilities list of capabilities details
//    * @param {Array.<String>} specs List of spec file paths that are to be run
//    */
//   before: async () => {
//     await browser.maximizeWindow();
//   },
//   /**
//    * Runs before a WebdriverIO command gets executed.
//    * @param {String} commandName hook command name
//    * @param {Array} args arguments that command would receive
//    */
//   // beforeCommand: function (commandName, args) {
//   // },
//   /**
//    * Hook that gets executed before the suite starts
//    * @param {Object} suite suite details
//    */
//   // beforeSuite: function (suite) {
//   // },
//   /**
//    * Function to be executed before a test (in Mocha/Jasmine) starts.
//    */
//   // beforeTest: function (test, context) {
//   // },
//   /**
//    * Hook that gets executed _before_ a hook within the suite starts (e.g. runs before calling
//    * beforeEach in Mocha)
//    */
//   // beforeHook: function (test, context) {
//   // },
//   /**
//    * Hook that gets executed _after_ a hook within the suite starts (e.g. runs after calling
//    * afterEach in Mocha)
//    */
//   // afterHook: function (test, context, { error, result, duration, passed, retries }) {
//   // },
//   /**
//    * Function to be executed after a test (in Mocha/Jasmine).
//    */
//   afterTest: async (test, context, results) => {
//     const resultString = results.passed ? 'Passed' : 'Failed';
//     console.log('\n Test Case: ' + test.description + '.    Result: ' + resultString + '\n');

//     // if test passed, ignore, else take and save screenshot. Unless it's the first test that boots the app,
//     // it may be useful to have a screenshot of the app on load.
//     if (results.passed) {
//       return;
//     }

//     // get current test title and clean it, to use it as file name
//     const fileName = encodeURIComponent(test.description.replace(/\s+/g, '-'));

//     // build file path
//     const filePath = './errorShots/' + fileName + '.png';

//     /* If there are more than one instance of the app open, we know an assert popped up. Since the test already failed and a screenshot was captured
//      * we want to close the assert popup. If we don't it will stay open and negatively interact with logic in our CI pipeline. */
//     const windowHandles = await browser.getWindowHandles();
//     if (windowHandles.length > 1) {
//       /* Switch to the Assert window - Take a screenshot and close the assert */
//       await browser.switchToWindow(windowHandles[0]);
//       await browser.saveScreenshot(filePath);
//       await browser.closeWindow();

//       /* Switch back to FluentTester and close. The test harness has trouble closing the app when an assert fired */
//       await browser.switchToWindow(windowHandles[1]);
//       await browser.closeWindow();
//     } else {
//       // save screenshot
//       await browser.saveScreenshot(filePath);
//     }
//   },

//   /**
//    * Hook that gets executed after the suite has ended
//    * @param {Object} suite suite details
//    */
//   // afterSuite: function (suite) {
//   // },
//   /**
//    * Runs after a WebdriverIO command gets executed
//    * @param {String} commandName hook command name
//    * @param {Array} args arguments that command would receive
//    * @param {Number} result 0 - command success, 1 - command error
//    * @param {Object} error error object if any
//    */
//   // afterCommand: function (commandName, args, result, error) {
//   // },
//   /**
//    * Gets executed after all tests are done. You still have access to all global variables from
//    * the test.
//    * @param {Number} result 0 - test pass, 1 - test fail
//    * @param {Array.<Object>} capabilities list of capabilities details
//    * @param {Array.<String>} specs List of spec file paths that ran
//    */
//   // after: function (result, capabilities, specs) {
//   // },
//   /**
//    * Gets executed right after terminating the webdriver session.
//    * @param {Object} config wdio configuration object
//    * @param {Array.<Object>} capabilities list of capabilities details
//    * @param {Array.<String>} specs List of spec file paths that ran
//    */
//   // afterSession: function (config, capabilities, specs) {
//   // },
//   /**
//    * Gets executed after all workers got shut down and the process is about to exit. An error
//    * thrown in the onComplete hook will result in the test run failing.
//    * @param {Object} exitCode 0 - success, 1 - fail
//    * @param {Object} config wdio configuration object
//    * @param {Array.<Object>} capabilities list of capabilities details
//    * @param {<Object>} results object containing test results
//    */
//   onComplete: (/* exitCode, config, capabilities, results */) => {
//     console.log('<<< TESTING FINISHED >>>');
//   },
//   /**
//    * Gets executed when a refresh happens.
//    * @param {String} oldSessionId session ID of the old session
//    * @param {String} newSessionId session ID of the new session
//    */
//   //onReload: function(oldSessionId, newSessionId) {
//   //}
// };
