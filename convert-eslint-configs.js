#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Find all .eslintrc.js files (excluding node_modules)
const findEslintrcFiles = () => {
  const command = 'find . -name ".eslintrc.js" -type f -not -path "./node_modules/*"';
  const output = execSync(command, { encoding: 'utf8' });
  return output
    .trim()
    .split('\n')
    .filter((line) => line.trim() !== '');
};

// Convert legacy config to flat config
const convertToFlatConfig = (legacyConfig) => {
  const config = [];

  // Base configuration
  const baseConfig = {};

  // Handle extends
  if (legacyConfig.extends) {
    // For now, we'll add a comment about the extends
    baseConfig.extends = legacyConfig.extends;
  }

  // Handle parser options
  if (legacyConfig.parserOptions) {
    baseConfig.languageOptions = {
      parserOptions: legacyConfig.parserOptions,
    };
  }

  // Handle plugins
  if (legacyConfig.plugins) {
    baseConfig.plugins = legacyConfig.plugins;
  }

  // Handle rules
  if (legacyConfig.rules) {
    baseConfig.rules = legacyConfig.rules;
  }

  // Handle env
  if (legacyConfig.env) {
    if (!baseConfig.languageOptions) {
      baseConfig.languageOptions = {};
    }
    baseConfig.languageOptions.globals = legacyConfig.env;
  }

  config.push(baseConfig);

  // Handle overrides
  if (legacyConfig.overrides) {
    legacyConfig.overrides.forEach((override) => {
      const overrideConfig = {};

      if (override.files) {
        overrideConfig.files = override.files;
      }

      if (override.excludedFiles) {
        overrideConfig.ignores = override.excludedFiles;
      }

      if (override.rules) {
        overrideConfig.rules = override.rules;
      }

      if (override.parserOptions) {
        overrideConfig.languageOptions = {
          parserOptions: override.parserOptions,
        };
      }

      if (override.plugins) {
        overrideConfig.plugins = override.plugins;
      }

      if (override.env) {
        if (!overrideConfig.languageOptions) {
          overrideConfig.languageOptions = {};
        }
        overrideConfig.languageOptions.globals = override.env;
      }

      config.push(overrideConfig);
    });
  }

  return config;
};

// Generate flat config file content
const generateFlatConfigContent = (flatConfig) => {
  let content = '';

  // Check if any config has extends
  const hasExtends = flatConfig.some((config) => config.extends);

  if (hasExtends) {
    // For files that extend @fluentui-react-native/eslint-config-rules
    const extendsConfig = flatConfig.find((config) => config.extends);
    if (extendsConfig.extends.includes('@fluentui-react-native/eslint-config-rules')) {
      content += `const baseConfig = require('@fluentui-react-native/eslint-config-rules');\n\n`;

      // Check if there are additional rules
      const hasAdditionalRules = flatConfig.some((config) => config.rules && Object.keys(config.rules).length > 0);

      if (hasAdditionalRules) {
        content += `module.exports = [\n`;
        content += `  ...baseConfig,\n`;
        content += `  {\n`;

        const rulesConfig = flatConfig.find((config) => config.rules);
        if (rulesConfig.rules) {
          content += `    rules: ${JSON.stringify(rulesConfig.rules, null, 6)},\n`;
        }

        content += `  },\n`;
        content += `];\n`;
      } else {
        content += `module.exports = baseConfig;\n`;
      }
    } else {
      // For other extends configurations, create a more generic structure
      content += `module.exports = ${JSON.stringify(flatConfig, null, 2)};\n`;
    }
  } else {
    // No extends, just export the flat config
    content += `module.exports = ${JSON.stringify(flatConfig, null, 2)};\n`;
  }

  return content;
};

// Process a single file
const processFile = (filePath) => {
  console.log(`Processing: ${filePath}`);

  try {
    // Read the existing .eslintrc.js file
    const fullPath = path.resolve(filePath);
    delete require.cache[fullPath]; // Clear require cache
    const legacyConfig = require(fullPath);

    // Convert to flat config
    const flatConfig = convertToFlatConfig(legacyConfig);

    // Generate new content
    const newContent = generateFlatConfigContent(flatConfig);

    // Write to eslint.config.js
    const newFilePath = path.join(path.dirname(filePath), 'eslint.config.js');
    fs.writeFileSync(newFilePath, newContent);

    // Remove old file
    fs.unlinkSync(filePath);

    console.log(`✅ Converted ${filePath} to ${newFilePath}`);
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
};

// Main execution
const main = () => {
  console.log('🔄 Finding .eslintrc.js files...');

  const eslintrcFiles = findEslintrcFiles();
  console.log(`Found ${eslintrcFiles.length} .eslintrc.js files`);

  eslintrcFiles.forEach(processFile);

  console.log('✅ All files processed!');
};

main();
