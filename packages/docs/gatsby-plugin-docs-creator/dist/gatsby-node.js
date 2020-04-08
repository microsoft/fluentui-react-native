'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var tslib_1 = require('tslib');
var lodash_1 = tslib_1.__importDefault(require('lodash'));
var js_yaml_1 = tslib_1.__importDefault(require('js-yaml'));
var gatsby_page_utils_1 = require('gatsby-page-utils');
var BBPromise = require('bluebird');
var existsSync = require('fs-exists-cached').sync;
var systemPath = require('path');
var readFileSync = require('fs').readFileSync;
var globCB = require('glob');
var glob = BBPromise.promisify(globCB);
// Path creator.
// Auto-create pages.
// algorithm is glob /pages directory for js/jsx/cjsx files *not*
// underscored. Then create url w/ our path algorithm *unless* user
// takes control of that page component in gatsby-node.
exports.createPagesStatefully = function(_a, _b, doneCb) {
  var store = _a.store,
    actions = _a.actions,
    reporter = _a.reporter;
  var pagesPath = _b.path,
    _c = _b.pathCheck,
    pathCheck = _c === void 0 ? true : _c,
    ignore = _b.ignore;
  return tslib_1.__awaiter(void 0, void 0, void 0, function() {
    var createPage, deletePage, program, exts, findNearestFile, pagesDirectory, pagesGlob, tocGlob, files, tocs;
    return tslib_1.__generator(this, function(_d) {
      switch (_d.label) {
        case 0:
          (createPage = actions.createPage), (deletePage = actions.deletePage);
          program = store.getState().program;
          exts = program.extensions
            .map(function(e) {
              return '' + e.slice(1);
            })
            .join(',');
          if (!pagesPath) {
            reporter.panic(
              '\n      "path" is a required option for gatsby-plugin-page-creator\n\n      See docs here - https://www.gatsbyjs.org/plugins/gatsby-plugin-page-creator/\n      '
            );
          }
          // Validate that the path exists.
          if (pathCheck && !existsSync(pagesPath)) {
            reporter.panic(
              '\n      The path passed to gatsby-plugin-page-creator does not exist on your file system:\n\n      ' +
                pagesPath +
                '\n\n      Please pick a path to an existing directory.\n      '
            );
          }
          findNearestFile = function(matchPath, filePaths) {
            if (filePaths === undefined) {
              return undefined;
            }
            var matchParts = matchPath.split('/');
            do {
              var match = filePaths.find(function(filePath) {
                var fileRelPath = systemPath.dirname(filePath);
                var matchRelPath = systemPath.dirname(matchParts.join('/'));
                return fileRelPath === matchRelPath;
              });
              if (match !== undefined) {
                return match;
              } else {
                matchParts.splice(-1, 1);
              }
            } while (matchParts.length > -1);
            return undefined;
          };
          pagesDirectory = systemPath.resolve(process.cwd(), pagesPath);
          pagesGlob = '**/*.{' + exts + '}';
          tocGlob = '**/toc.yml';
          return [4 /*yield*/, glob(pagesGlob, { cwd: pagesPath })];
        case 1:
          files = _d.sent();
          return [4 /*yield*/, glob(tocGlob, { cwd: pagesPath })];
        case 2:
          tocs = _d.sent();
          files.forEach(function(file) {
            var tocPath = findNearestFile(file, tocs);
            _createPage(file, pagesDirectory, createPage, ignore, tocPath);
          });
          gatsby_page_utils_1
            .watchDirectory(
              pagesPath,
              pagesGlob,
              function(addedPath) {
                if (!lodash_1.default.includes(files, addedPath)) {
                  var tocPath = findNearestFile(addedPath, tocs);
                  _createPage(addedPath, pagesDirectory, createPage, ignore, tocPath);
                  files.push(addedPath);
                }
              },
              function(removedPath) {
                // Delete the page for the now deleted component.
                var componentPath = systemPath.join(pagesDirectory, removedPath);
                store.getState().pages.forEach(function(page) {
                  if (page.component === componentPath) {
                    deletePage({
                      path: gatsby_page_utils_1.createPath(removedPath),
                      component: componentPath
                    });
                  }
                });
                files = files.filter(function(f) {
                  return f !== removedPath;
                });
              }
            )
            .then(function() {
              return doneCb();
            });
          return [2 /*return*/];
      }
    });
  });
};
var _createPage = function(filePath, pagesDirectory, createPage, ignore, tocPath) {
  // Filter out special components that shouldn't be made into
  // pages.
  if (!gatsby_page_utils_1.validatePath(filePath)) {
    return;
  }
  // Filter out anything matching the given ignore patterns and options
  if (gatsby_page_utils_1.ignorePath(filePath, ignore)) {
    return;
  }
  var toc = undefined;
  if (tocPath !== undefined) {
    try {
      toc = js_yaml_1.default.safeLoad(readFileSync(systemPath.join(pagesDirectory, tocPath), 'utf8'));
    } catch (e) {
      console.log(e);
    }
  }
  // Create page object
  var createdPath = gatsby_page_utils_1.createPath(filePath);
  var page = {
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
//# sourceMappingURL=gatsby-node.js.map
