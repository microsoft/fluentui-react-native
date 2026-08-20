/**
 * Protocol and schema versions for `@fluentui-react-native/desktop-driver`.
 *
 * Every persisted artifact, loopback service payload, and story-test plan carries one of these
 * versions so a mismatched producer and consumer fail loudly instead of silently misbehaving.
 */

/** Version of the loopback desktop test service protocol and of `run.json` / `events.ndjson`. */
export const DESKTOP_PROTOCOL_VERSION = 1;

/** Version of the serializable story-test plan schema embedded in `parameters.desktopTest`. */
export const STORY_PLAN_SCHEMA_VERSION = 1;

/**
 * Version of the portable WebdriverIO command matrix.
 *
 * Bump this whenever a command enters or leaves the shared subset. A cross-platform result pair is
 * only comparable when both jobs report the same matrix version.
 */
export const PORTABLE_COMMAND_MATRIX_VERSION = 1;
