export interface ScenarioImport {
  module: string;
  namespace?: boolean;
  exports?: string[];
}

export interface Scenario {
  name: string;
  module?: string;
  namespace?: boolean;
  exports?: string[];
  imports?: ScenarioImport[];
  forbiddenInputPatterns?: string[];
  requiredInputPatterns?: string[];
}

export interface ScenarioConfig {
  platforms: string[];
  scenarios: Scenario[];
}

export interface BaselineResult {
  platform: string;
  scenario: string;
  rawBytes: number;
  gzipBytes: number;
  moduleCount: number;
  metafileInputCount: number;
  workspaceModules: Record<string, number>;
  workspaceBytes: Record<string, number>;
}

export interface Measurement extends BaselineResult {
  metafile: string;
}

export type Comparison =
  | { status: 'new'; currentCost: number; currentModuleCost: number }
  | {
      status: 'compared';
      currentCost: number;
      currentModuleCost: number;
      costDelta: number;
      moduleCostDelta: number;
      baselineCost?: number;
      costPercent?: number;
      gzipCostDelta?: number;
    };

export interface ScenarioComparison {
  platform: string;
  scenario: string;
  comparison: Comparison;
}
