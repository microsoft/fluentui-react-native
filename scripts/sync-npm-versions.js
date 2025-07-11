#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Compares two semver version strings
 * @param {string} version1 - First version string
 * @param {string} version2 - Second version string
 * @returns {number} - Returns 1 if version1 > version2, -1 if version1 < version2, 0 if equal
 */
function compareVersions(version1, version2) {
  // Remove pre-release identifiers for comparison
  const cleanVersion1 = version1.split('-')[0];
  const cleanVersion2 = version2.split('-')[0];
  
  const v1parts = cleanVersion1.split('.').map(Number);
  const v2parts = cleanVersion2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
    const v1part = v1parts[i] || 0;
    const v2part = v2parts[i] || 0;
    
    if (v1part > v2part) return 1;
    if (v1part < v2part) return -1;
  }
  
  // If base versions are equal, check pre-release
  if (cleanVersion1 !== cleanVersion2) {
    return 0; // Base versions are different, already handled above
  }
  
  // If one has pre-release and other doesn't, release version is higher
  const v1hasPrerelease = version1.includes('-');
  const v2hasPrerelease = version2.includes('-');
  
  if (v1hasPrerelease && !v2hasPrerelease) return -1;
  if (!v1hasPrerelease && v2hasPrerelease) return 1;
  
  return 0;
}

/**
 * Gets the latest version of a package from NPM
 * @param {string} packageName - Name of the package
 * @returns {string|null} - Latest version string or null if not found
 */
async function getLatestNpmVersion(packageName) {
  try {
    const command = `npm view ${packageName} version`;
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    return output.trim();
  } catch (error) {
    console.warn(`⚠️  Could not fetch version for ${packageName}: ${error.message}`);
    return null;
  }
}

/**
 * Finds all package.json files in the workspace
 * @param {string} dir - Directory to search
 * @param {string[]} results - Array to store results
 * @returns {string[]} - Array of package.json file paths
 */
function findPackageJsonFiles(dir, results = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules directories
      if (file !== 'node_modules' && file !== '.git') {
        findPackageJsonFiles(fullPath, results);
      }
    } else if (file === 'package.json') {
      results.push(fullPath);
    }
  }
  
  return results;
}

/**
 * Updates package.json version if NPM has a newer version
 * @param {string} packageJsonPath - Path to package.json file
 * @returns {Promise<boolean>} - True if updated, false otherwise
 */
async function updatePackageVersion(packageJsonPath) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Skip private packages and packages without a name
    if (packageJson.private || !packageJson.name) {
      return false;
    }
    
    const currentVersion = packageJson.version;
    if (!currentVersion) {
      console.warn(`⚠️  No version found in ${packageJsonPath}`);
      return false;
    }
    
    console.log(`🔍 Checking ${packageJson.name} (current: ${currentVersion})`);
    
    const latestVersion = await getLatestNpmVersion(packageJson.name);
    if (!latestVersion) {
      return false;
    }
    
    const comparison = compareVersions(latestVersion, currentVersion);
    
    if (comparison > 0) {
      console.log(`📦 Updating ${packageJson.name}: ${currentVersion} → ${latestVersion}`);
      
      // Update the version
      packageJson.version = latestVersion;
      
      // Write the updated package.json
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      
      return true;
    } else if (comparison === 0) {
      console.log(`✅ ${packageJson.name} is up to date (${currentVersion})`);
    } else {
      console.log(`⚠️  ${packageJson.name} local version (${currentVersion}) is newer than NPM (${latestVersion})`);
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${packageJsonPath}:`, error.message);
    return false;
  }
}

/**
 * Main function to sync all package versions
 */
async function syncAllPackageVersions() {
  const rootDir = path.resolve(__dirname, '..');
  console.log(`🚀 Starting version sync for ${rootDir}`);
  
  const packageJsonFiles = findPackageJsonFiles(rootDir);
  console.log(`📁 Found ${packageJsonFiles.length} package.json files`);
  
  let updatedCount = 0;
  
  for (const packageJsonPath of packageJsonFiles) {
    const relativePath = path.relative(rootDir, packageJsonPath);
    console.log(`\n📂 Processing ${relativePath}`);
    
    const wasUpdated = await updatePackageVersion(packageJsonPath);
    if (wasUpdated) {
      updatedCount++;
    }
    
    // Add a small delay to avoid overwhelming NPM registry
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n✨ Sync complete! Updated ${updatedCount} package(s).`);
  
  if (updatedCount > 0) {
    console.log('\n💡 Don\'t forget to:');
    console.log('   1. Review the changes');
    console.log('   2. Run tests to ensure compatibility');
    console.log('   3. Commit the updated versions');
  }
}

// Run the script if called directly
if (require.main === module) {
  syncAllPackageVersions().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

module.exports = {
  syncAllPackageVersions,
  updatePackageVersion,
  getLatestNpmVersion,
  compareVersions
};
