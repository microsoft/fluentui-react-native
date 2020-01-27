const { metroPackTask } = require('./tasks/metro-pack');

const bundleName = process.argv[2];
metroPackTask(bundleName)().then(() => console.log('Successful..'));
