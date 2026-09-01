export { isPnpmMode } from './utils/ispnpm.ts';
export { constrain, constrainRoot } from './tasks/constrain.ts';
export type { PackageManifest } from './pkgContext.ts';
export { PackageContext } from './pkgContext.ts';
export { repoContext, RepoContext } from './repoContext.ts';
export type { Constants, ConstValue, CodegenTargetFile, ReExports } from './codegen/types.ts';
export { jsonToCodegenTargetFile, processPlatformJsonFiles } from './codegen/json.ts';
export { writeConstExports, writeExportConst } from './codegen/constants.ts';
export { outputCodegenFile } from './codegen/genFile.ts';
export type {
  DeltaParentCandidate,
  JsonArray,
  JsonDeletion,
  JsonDeltaObject,
  JsonDeltaValue,
  JsonObject,
  JsonPrimitive,
  JsonValue,
  SelectedDeltaParent,
  TypeScriptLiteralOptions,
} from './codegen/structuredJson.ts';
export {
  JSON_DELETION,
  applyJsonObjectDelta,
  cloneJsonValue,
  createJsonObjectDelta,
  selectCompactDeltaParent,
  serializeJson,
  serializeTypeScriptLiteral,
  sortJsonValue,
} from './codegen/structuredJson.ts';
