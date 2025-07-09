// @ts-check

/**
 * Quick and dirty script to ensure we have got our nested peerDependencies correct
 *
 * Any package that depends on a package within the repo, that has a peerDependency, should also have that dependency declared as a peerDependency
 * Also, peerDependencies for additional platforms should be marked as optional peerDependencies
 */

import { readFileSync, writeFileSync } from 'fs';
import { logger } from 'just-task';

import { findGitRoot, getPackageInfos } from 'workspace-tools';

export function checkDependencies() {
  let requireRescan = true;
  let everWrote = false;

  // These packages should be optional peers, since not all consumers may require all platforms
  const optionalPeers = ['react-native-windows', '@office-iss/react-native-win32', 'react-native-macos'];

  while (requireRescan) {
    requireRescan = false;

    const infos = getPackageInfos(findGitRoot(process.cwd()));

    // getPackageInfos unfortunately doesn't provide peerDependenciesMeta, so we need to parse the whole package.json
    for (const pkgName in infos) {
      infos[pkgName].pkgJson = JSON.parse(readFileSync(infos[pkgName].packageJsonPath).toString());
    }

    for (const pkgName in infos) {
      const deps = { ...infos[pkgName].dependencies, ...infos[pkgName].peerDependencies };

      /** @type {{ name: string, version: string }[]} */
      const missingPeerDeps = [];
      /** @type {string[]} */
      const missingPeerDepsMeta = [];

      for (const dep in deps) {
        if (infos[dep]) {
          for (const peerDep in infos[dep].peerDependencies) {
            if (!deps[peerDep]) {
              if (!missingPeerDeps.some((missingDep) => missingDep.name === peerDep)) {
                missingPeerDeps.push({ name: peerDep, version: infos[dep].peerDependencies[peerDep] });
                if (optionalPeers.includes(peerDep)) {
                  missingPeerDepsMeta.push(peerDep);
                }
              }
            }
          }
        }
      }

      for (const peerDep in infos[pkgName].peerDependencies) {
        if (optionalPeers.includes(peerDep)) {
          if (!infos[pkgName].pkgJson.peerDependenciesMeta || !infos[pkgName].pkgJson.peerDependenciesMeta[peerDep]) {
            missingPeerDepsMeta.push(peerDep);
          }
        }
      }

      let requireWriteFile = false;

      if (missingPeerDeps.length !== 0) {
        if (!infos[pkgName].pkgJson.peerDependencies) {
          infos[pkgName].pkgJson.peerDependencies = {};
        }
        for (const missingDep of missingPeerDeps) {
          infos[pkgName].pkgJson.peerDependencies[missingDep.name] = missingDep.version;
        }
        requireWriteFile = true;
      }

      if (missingPeerDepsMeta.length !== 0) {
        if (!infos[pkgName].pkgJson.peerDependenciesMeta) {
          infos[pkgName].pkgJson.peerDependenciesMeta = {};
        }

        for (const missingMeta of missingPeerDepsMeta) {
          infos[pkgName].pkgJson.peerDependenciesMeta[missingMeta] = {
            optional: true,
          };
        }
        requireWriteFile = true;
      }

      if (requireWriteFile) {
        writeFileSync(infos[pkgName].packageJsonPath, JSON.stringify(infos[pkgName].pkgJson, null, 2));
        everWrote = true;
        requireRescan = true;
      }

      // Run the whole process again, since we have more peerDependencies to track now
    }
  }

  if (everWrote) {
    const errorMsg = `Required package dependencies updated.`;
    logger.error(errorMsg);
    throw errorMsg;
  }
}
