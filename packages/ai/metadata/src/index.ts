export {
  METADATA_SCHEMA_NAME,
  METADATA_SCHEMA_VERSION,
  type ComponentA11yIssue,
  type ComponentA11yPayload,
  type ComponentExtractionError,
  type ComponentExtractionStatus,
  type ComponentIdentity,
  type ComponentMetadataRecord,
  type ComponentNote,
  type ComponentNoteProvenance,
  type ComponentNotesPayload,
  type ComponentStateInteractionSummary,
  type ComponentStateMetadata,
  type ComponentTokenMapping,
  type ComponentTokenPayload,
  type JsonPrimitive,
  type JsonValue,
  type MetadataEnvelope,
  type MetadataGeneratorInfo,
  type MetadataPlatform,
  type MetadataSchemaVersion,
} from './contracts/metadata.ts';

export { componentMetadataRecordSchema, metadataEnvelopeSchema, type JsonSchema } from './contracts/schema.ts';

export {
  componentCatalogId,
  getComponentCatalog,
  listMetadataComponents,
  METADATA_LIST_COMPONENTS_COMMAND,
  type ComponentCatalogEntry,
  type ComponentCatalogOptions,
  type ComponentCatalogOverride,
  type ListComponentsOptions,
  type ListComponentsResult,
} from './componentCatalog/index.ts';

export {
  generateComponentMetadata,
  generateMetadata,
  METADATA_GENERATE_COMMAND,
  type GenerateComponentMetadataOptions,
  type MetadataGenerateOptions,
  type MetadataGenerateResult,
  type MetadataSourceDocument,
  type MetadataSourceResolver,
  type TimestampMode,
} from './generate/index.ts';

export {
  readAndValidateMetadataEnvelope,
  readMetadataEnvelope,
  serializeMetadataEnvelope,
  writeMetadataArtifacts,
  writeMetadataEnvelope,
  type MetadataArtifactFileWrite,
  type WriteMetadataArtifactsOptions,
  type WriteMetadataArtifactsResult,
  type WriteMetadataOptions,
} from './io/index.ts';

export {
  validateComponentMetadataRecord,
  validateMetadataArtifact,
  validateMetadataEnvelope,
  METADATA_VALIDATE_COMMAND,
  type MetadataValidationIssue,
  type MetadataValidationResult,
  type ValidateMetadataArtifactResult,
  type ValidateMetadataOptions,
} from './validate/index.ts';
