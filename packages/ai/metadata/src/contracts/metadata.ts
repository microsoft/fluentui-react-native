export const METADATA_SCHEMA_NAME = 'furn-component-metadata';
export const METADATA_SCHEMA_VERSION = '1.0.0' as const;

export type MetadataSchemaVersion = typeof METADATA_SCHEMA_VERSION;
export type MetadataPlatform = 'ios' | 'android' | 'macos' | 'windows' | 'win32' | 'web' | string;

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export interface MetadataGeneratorInfo {
  name: string;
  version: string;
}

export interface ComponentIdentity {
  name: string;
  packageName: string;
  exportName: string;
  platform?: MetadataPlatform;
}

export interface ComponentStateInteractionSummary {
  totalInteractions: number;
  interactionKinds: readonly string[];
}

export interface ComponentStateMetadata {
  id: string;
  props?: Record<string, JsonValue>;
  interactionSummary?: ComponentStateInteractionSummary;
}

export interface ComponentTokenMapping {
  slot: string;
  property: string;
  tokenPath?: string;
  tokenValue?: JsonValue;
}

export interface ComponentTokenPayload {
  mappings: readonly ComponentTokenMapping[];
}

export interface ComponentA11yIssue {
  severity: 'info' | 'warning' | 'error';
  rule: string;
  message: string;
  path?: string;
}

export interface ComponentA11yPayload {
  serializedTree: JsonValue;
  issues: readonly ComponentA11yIssue[];
}

export interface ComponentNoteProvenance {
  source: 'manual' | 'generated' | 'imported' | string;
  author?: string;
  updatedAt?: string;
  reference?: string;
}

export interface ComponentNote {
  text: string;
  provenance: ComponentNoteProvenance;
}

export interface ComponentNotesPayload {
  notes: readonly ComponentNote[];
}

export interface ComponentExtractionError {
  code: string;
  message: string;
  stage?: string;
}

export interface ComponentExtractionStatus {
  status: 'pending' | 'partial' | 'complete' | 'failed';
  errors: readonly ComponentExtractionError[];
}

export interface ComponentMetadataRecord {
  identity: ComponentIdentity;
  states: readonly ComponentStateMetadata[];
  tokens: ComponentTokenPayload;
  a11y: ComponentA11yPayload;
  notes: ComponentNotesPayload;
  extraction: ComponentExtractionStatus;
}

export interface MetadataEnvelope {
  schemaVersion: MetadataSchemaVersion | string;
  generatedAt: string;
  generator: MetadataGeneratorInfo;
  components: readonly ComponentMetadataRecord[];
}
