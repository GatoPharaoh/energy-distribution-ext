export interface BiDiState {
  import: number;
  export: number;
}

export interface Flows {
  solarToHome: number;
  solarToGrid: number;
  solarToBattery: number;
  gridToHome: number;
  gridToBattery: number;
  batteryToHome: number;
  batteryToGrid: number;
}

export interface States {
  largestElectricValue: number;
  largestGasValue: number;
  batteryImport: number;
  batteryExport: number;
  batterySecondary: number;
  gasImport: number;
  gasImportVolume: number;
  gasSecondary: number;
  gridImport: number;
  gridExport: number;
  gridSecondary: number;
  highCarbon: number;
  homeElectric: number;
  homeGas: number;
  homeGasVolume: number;
  homeSecondary: number;
  lowCarbon: number;
  lowCarbonPercentage: number;
  lowCarbonSecondary: number;
  solarImport: number;
  solarSecondary: number;
  devices: BiDiState[];
  devicesSecondary: number[];
  flows: Flows;
}
