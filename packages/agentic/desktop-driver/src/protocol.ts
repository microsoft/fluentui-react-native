/**
 * Protocol and schema versions for `@fluentui-react-native/desktop-driver`.
 *
 * Every persisted artifact, loopback service payload, and story-test plan carries one of these
 * versions so a mismatched producer and consumer fail loudly instead of silently misbehaving.
 */

export { DESKTOP_PROTOCOL_VERSION, PORTABLE_COMMAND_MATRIX_VERSION, STORY_PLAN_SCHEMA_VERSION } from './protocol/versions.ts';
