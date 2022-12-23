export interface FontMetrics {
  readonly scaleFactors: ScaleFactors;
}

export type ScaleFactors = { [K in TextStyle]?: number };

export type TextStyle =
  | 'caption2'
  | 'caption1'
  | 'footnote'
  | 'subheadline'
  | 'callout'
  | 'body'
  | 'headline'
  | 'title3'
  | 'title2'
  | 'title1'
  | 'largeTitle';
