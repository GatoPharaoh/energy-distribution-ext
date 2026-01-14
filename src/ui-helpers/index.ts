import { GlobalOptions, HomeConfig, HomeOptions } from "@/config";
import { GasSourcesMode } from "@/enums";
import { States } from "@/states";
import { getConfigValue } from "@/config/config";

export interface Segment {
  state: number;
  colour: string;
}

export interface SegmentGroup {
  segments: Segment[];
  inactiveColour: string;
}

export interface FlowLine {
  colourLine: string;
  colourDot?: string;
  cssLine?: string;
  path: string;
  active: boolean;
  animDuration: number;
}

export interface AnimationDurations {
  batteryToGrid: number;
  batteryToHome: number;
  gridToHome: number;
  gridToBattery: number;
  solarToBattery: number;
  solarToGrid: number;
  solarToHome: number;
  lowCarbon: number;
  gas: number;

  // TODO: devices
}

export interface PathScaleFactors {
  horizLine: number;
  vertLine: number;
  curvedLine: number;
  topRowLine: number;

  // TODO: devices
}

export function getGasSourcesMode(configs: HomeConfig[], states: States): GasSourcesMode {
  const gasSourcesMode: GasSourcesMode = getConfigValue(configs, [GlobalOptions.Options, HomeOptions.Gas_Sources]);
  const gasThreshold: number = getConfigValue(configs, [GlobalOptions.Options, HomeOptions.Gas_Sources_Threshold]);

  return gasSourcesMode === GasSourcesMode.Automatic
    ? 100 * states.homeGas / states.homeElectric + states.homeGas < gasThreshold
      ? GasSourcesMode.Add_To_Total
      : GasSourcesMode.Show_Separately
    : gasSourcesMode;
};
