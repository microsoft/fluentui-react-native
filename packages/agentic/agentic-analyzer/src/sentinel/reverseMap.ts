/**
 * A reverse map from a unique sentinel leaf value back to the semantic theme path
 * that produced it (e.g. `"#FF0001" -> "colors.buttonBackground"`).
 *
 * Only string sentinels are recorded — those are the values we can reliably detect
 * when they reappear inside a resolved token tree and substitute with their
 * semantic name.
 */
export type ReverseMap = Map<string, string>;

/**
 * Allocates unique, type-valid sentinel color hex strings.
 *
 * Colors are reserved in a high-red band (`#FF0001`, `#FF0002`, …) that is
 * extremely unlikely to collide with any real palette value. The allocator is
 * stateful so every leaf gets a distinct value within a single sentinel theme.
 */
export class SentinelAllocator {
  private colorCounter = 0;
  private readonly reverseMap: ReverseMap = new Map();

  /**
   * Allocate the next unique sentinel color hex for the given semantic path and
   * record the reverse mapping.
   */
  allocateColor(semanticPath: string): string {
    this.colorCounter += 1;
    // Reserve the high-red band: #FF0001, #FF0002, ... up to #FFFFFF.
    const hex = `#FF${this.colorCounter.toString(16).toUpperCase().padStart(4, '0')}`;
    this.reverseMap.set(hex, semanticPath);
    return hex;
  }

  /**
   * The accumulated sentinel-value -> semantic-path reverse map.
   */
  getReverseMap(): ReverseMap {
    return this.reverseMap;
  }
}
