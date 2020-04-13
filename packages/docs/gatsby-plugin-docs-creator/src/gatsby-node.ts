import _ from 'lodash';
import yaml from 'js-yaml';
import { createPath, validatePath, ignorePath, watchDirectory } from 'gatsby-page-utils';

const BBPromise = require('bluebird');
const existsSync = require(`fs-exists-cached`).sync;
const systemPath = require(`path`);
const { readFileSync } = require(`fs`);
const globCB = require(`glob`);
const glob = BBPromise.promisify(globCB);

// Path creator.
// Auto-create pages.
// algorithm is glob /pages directory for js/jsx/cjsx files *not*
// underscored. Then create url w/ our path algorithm *unless* user
// takes control of that page component in gatsby-node.
export const createPagesStatefully = async ({ store, actions, reporter }, { path: pagesPath, pathCheck = true, ignore }, doneCb) => {
  const { createPage, deletePage } = actions;
  const program = store.getState().program;
  const exts = program.extensions.map(e => `${e.slice(1)}`).join(`,`);

  if (!pagesPath) {
    reporter.panic(
      `
      "path" is a required option for gatsby-plugin-page-creator

      See docs here - https://www.gatsbyjs.org/plugins/gatsby-plugin-page-creator/
      `
    );
  }

  // Validate that the path exists.
  if (pathCheck && !existsSync(pagesPath)) {
    reporter.panic(
      `
      The path passed to gatsby-plugin-page-creator does not exist on your file system:

      ${pagesPath}

      Please pick a path to an existing directory.
      `
    );
  }

  const findNearestFile = (matchPath: string, filePaths: string[]): string | undefined => {
    if (filePaths === undefined) {
      return undefined;
    }
    const matchParts = matchPath.split('/');
    do {
      const match = filePaths.find(filePath => {
        const fileRelPath = systemPath.dirname(filePath);
        const matchRelPath = systemPath.dirname(matchParts.join('/'));
        return fileRelPath === matchRelPath;
      });
      if (match !== undefined) {
        return match;
      } else matchParts.splice(-1, 1);
    } while (matchParts.length > 0);

    return undefined;
  };

  const pagesDirectory = systemPath.resolve(process.cwd(), pagesPath);
  const pagesGlob = `**/*.{${exts}}`;
  const tocGlob = '**/toc.yml';

  // Get initial list of files.
  let files = await glob(pagesGlob, { cwd: pagesPath });
  const tocs = await glob(tocGlob, { cwd: pagesPath });

  files.forEach(file => {
    const tocPath = findNearestFile(file, tocs);
    _createPage(file, pagesDirectory, createPage, ignore, tocPath);
  });

  watchDirectory(
    pagesPath,
    pagesGlob,
    addedPath => {
      if (!_.includes(files, addedPath)) {
        const tocPath = findNearestFile(addedPath, tocs);
        _createPage(addedPath, pagesDirectory, createPage, ignore, tocPath);
        files.push(addedPath);
      }
    },
    removedPath => {
      // Delete the page for the now deleted component.
      const componentPath = systemPath.join(pagesDirectory, removedPath);
      store.getState().pages.forEach(page => {
        if (page.component === componentPath) {
          deletePage({
            path: createPath(removedPath),
            component: componentPath
          });
        }
      });
      files = files.filter(f => f !== removedPath);
    }
  ).then(() => doneCb());
};
const _createPage = (filePath, pagesDirectory, createPage, ignore, tocPath) => {
  // Filter out special components that shouldn't be made into
  // pages.
  if (!validatePath(filePath)) {
    return;
  }

  // Filter out anything matching the given ignore patterns and options
  if (ignorePath(filePath, ignore)) {
    return;
  }

  let toc = undefined;
  if (tocPath !== undefined) {
    try {
      toc = yaml.safeLoad(readFileSync(systemPath.join(pagesDirectory, tocPath), 'utf8'));
    } catch (e) {
      console.log(e);
    }
  }

  // Create page object
  const createdPath = createPath(filePath);
  const page = {
    path: createdPath,
    component: systemPath.join(pagesDirectory, filePath),
    context: {
      toc: toc,
      rootPath: filePath.substring(0, filePath.indexOf('/'))
    }
  };

  // Add page
  createPage(page);
};
