// @ts-check

const path = require('path');
const { apiExtractorVerifyTask, apiExtractorUpdateTask } = require('just-scripts');

const configPath = path.resolve(process.cwd(), 'api-extractor.json');

exports.verifyApiExtractor = apiExtractorVerifyTask(configPath, undefined);
exports.updateApiExtractor = apiExtractorUpdateTask(configPath, undefined);
