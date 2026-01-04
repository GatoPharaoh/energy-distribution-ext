import { HomeAssistant, round } from "custom-card-helpers";
import { HassEntity, UnsubscribeFunc } from "home-assistant-js-websocket";
import { EnergyCollection, EnergyData, Statistics, StatisticValue } from "@/hass";
import { AppearanceOptions, EditorPages, EnergyFlowCardExtConfig, EnergyUnitsOptions, EntitiesOptions, FlowsOptions, GlobalOptions, SecondaryInfoOptions } from "@/config";
import { GridState } from "./grid";
import { BatteryState } from "./battery";
import { GasState } from "./gas";
import { HomeState } from "./home";
import { LowCarbonState } from "./low-carbon";
import { SolarState } from "./solar";
import { DeviceState } from "./device";
import { addDays, addHours, differenceInDays, endOfDay, getHours, isFirstDayOfMonth, isLastDayOfMonth, startOfDay } from "date-fns";
import { clampEnumValue, DefaultValues, DisplayMode, ElectricUnits, EnergyUnitPrefixes, EntityMode, GasUnits } from "@/enums";
import { logDebug } from "@/logging";
import { getEnergyDataCollection } from "@/energy";
import { ENERGY_DATA_TIMEOUT } from "@/const";
import { ValueState } from "./state";
import { Flows, States } from ".";

const CALORIES_TO_JOULES: number = 4.184;
const WATTHOURS_TO_CALORIES: number = 860.42065;
const WATTHOURS_TO_JOULES: number = 3600;

interface ConversionFunctions {
  [ElectricUnits.Calories]: (value: number, gcv: number) => number;
  [ElectricUnits.Joules]: (value: number, gcv: number) => number;
  [ElectricUnits.WattHours]: (value: number, gcv: number) => number;
  [GasUnits.CCF]: (value: number, gcv: number) => number;
  [GasUnits.Cubic_Feet]: (value: number, gcv: number) => number;
  [GasUnits.Cubic_Metres]: (value: number, gcv: number) => number;
  [GasUnits.Litres]: (value: number, gcv: number) => number;
  [GasUnits.MCF]: (value: number, gcv: number) => number;
}

const UNIT_CONVERSIONS: {
  [ElectricUnits.Calories]: ConversionFunctions;
  [ElectricUnits.Joules]: ConversionFunctions;
  [ElectricUnits.WattHours]: ConversionFunctions;
  [GasUnits.CCF]: ConversionFunctions;
  [GasUnits.Cubic_Feet]: ConversionFunctions;
  [GasUnits.Cubic_Metres]: ConversionFunctions;
  [GasUnits.Litres]: ConversionFunctions;
  [GasUnits.MCF]: ConversionFunctions;
} = {
  [ElectricUnits.Calories]: {
    [ElectricUnits.Calories]: value => value,
    [ElectricUnits.Joules]: value => value * CALORIES_TO_JOULES,
    [ElectricUnits.WattHours]: value => value / WATTHOURS_TO_CALORIES,
    [GasUnits.CCF]: (value, gcf) => value,
    [GasUnits.Cubic_Feet]: (value, gcf) => value,
    [GasUnits.Cubic_Metres]: (value, gcf) => value,
    [GasUnits.Litres]: (value, gcf) => value,
    [GasUnits.MCF]: (value, gcf) => value
  },
  [ElectricUnits.Joules]: {
    [ElectricUnits.Calories]: value => value / CALORIES_TO_JOULES,
    [ElectricUnits.Joules]: value => value,
    [ElectricUnits.WattHours]: value => value / WATTHOURS_TO_JOULES,
    [GasUnits.CCF]: (value, gcf) => value,
    [GasUnits.Cubic_Feet]: (value, gcf) => value,
    [GasUnits.Cubic_Metres]: (value, gcf) => value,
    [GasUnits.Litres]: (value, gcf) => value,
    [GasUnits.MCF]: (value, gcf) => value
  },
  [ElectricUnits.WattHours]: {
    [ElectricUnits.Calories]: value => value * WATTHOURS_TO_CALORIES,
    [ElectricUnits.Joules]: value => value * WATTHOURS_TO_JOULES,
    [ElectricUnits.WattHours]: value => value,
    [GasUnits.CCF]: (value, gcf) => value,
    [GasUnits.Cubic_Feet]: (value, gcf) => value,
    [GasUnits.Cubic_Metres]: (value, gcf) => value,
    [GasUnits.Litres]: (value, gcf) => value,
    [GasUnits.MCF]: (value, gcf) => value
  },
  [GasUnits.CCF]: {
    [ElectricUnits.Calories]: (value, gcf) => value,
    [ElectricUnits.Joules]: (value, gcf) => value,
    [ElectricUnits.WattHours]: (value, gcf) => value,
    [GasUnits.CCF]: value => value,
    [GasUnits.Cubic_Feet]: value => value,
    [GasUnits.Cubic_Metres]: value => value,
    [GasUnits.Litres]: value => value,
    [GasUnits.MCF]: value => value
  },
  [GasUnits.Cubic_Feet]: {
    [ElectricUnits.Calories]: (value, gcf) => value,
    [ElectricUnits.Joules]: (value, gcf) => value,
    [ElectricUnits.WattHours]: (value, gcf) => value,
    [GasUnits.CCF]: value => value,
    [GasUnits.Cubic_Feet]: value => value,
    [GasUnits.Cubic_Metres]: value => value,
    [GasUnits.Litres]: value => value,
    [GasUnits.MCF]: value => value
  },
  [GasUnits.Cubic_Metres]: {
    [ElectricUnits.Calories]: (value, gcf) => value,
    [ElectricUnits.Joules]: (value, gcf) => value,
    [ElectricUnits.WattHours]: (value, gcf) => value,
    [GasUnits.CCF]: value => value,
    [GasUnits.Cubic_Feet]: value => value,
    [GasUnits.Cubic_Metres]: value => value,
    [GasUnits.Litres]: value => value,
    [GasUnits.MCF]: value => value
  },
  [GasUnits.Litres]: {
    [ElectricUnits.Calories]: (value, gcf) => value,
    [ElectricUnits.Joules]: (value, gcf) => value,
    [ElectricUnits.WattHours]: (value, gcf) => value,
    [GasUnits.CCF]: value => value,
    [GasUnits.Cubic_Feet]: value => value,
    [GasUnits.Cubic_Metres]: value => value,
    [GasUnits.Litres]: value => value,
    [GasUnits.MCF]: value => value
  },
  [GasUnits.MCF]: {
    [ElectricUnits.Calories]: value => value,
    [ElectricUnits.Joules]: value => value,
    [ElectricUnits.WattHours]: value => value,
    [GasUnits.CCF]: value => value,
    [GasUnits.Cubic_Feet]: value => value,
    [GasUnits.Cubic_Metres]: value => value,
    [GasUnits.Litres]: value => value,
    [GasUnits.MCF]: value => value
  }
};

export class EntityStates {
  public hass: HomeAssistant;

  public get isDatePickerPresent(): boolean {
    return this._energyData;
  }

  public battery: BatteryState;
  public gas: GasState;
  public grid: GridState;
  public home: HomeState;
  public lowCarbon: LowCarbonState;
  public solar: SolarState;
  public devices: DeviceState[];

  private _energyData;
  private _displayMode: DisplayMode;
  private _primaryEntityIds: string[] = [];
  private _secondaryEntityIds: string[] = [];
  private _primaryStatistics?: Statistics;
  private _secondaryStatistics?: Statistics;
  private _entityModes: Map<string, EntityMode> = new Map();
  private _error?: Error;
  private _co2data?: Record<string, number>;
  private _electricUnits: string;
  private _gasUnits: string;
  private _gasCalorificValue: number;

  //================================================================================================================================================================================//

  public constructor(hass: HomeAssistant, config: EnergyFlowCardExtConfig) {
    this.hass = hass;
    this._displayMode = config?.[GlobalOptions.Display_Mode]!;
    this.battery = new BatteryState(hass, config?.[EditorPages.Battery]);
    this.gas = new GasState(hass, config?.[EditorPages.Gas]);
    this.grid = new GridState(hass, config?.[EditorPages.Grid]);
    this.home = new HomeState(hass, config?.[EditorPages.Home]);
    this.lowCarbon = new LowCarbonState(hass, config?.[EditorPages.Low_Carbon]);
    this.solar = new SolarState(hass, config?.[EditorPages.Solar]);
    this.devices = config?.[EditorPages.Devices]?.flatMap(device => new DeviceState(hass, device)) || [];

    this._electricUnits = clampEnumValue(config?.[EditorPages.Appearance]?.[AppearanceOptions.Energy_Units]?.[EnergyUnitsOptions.Electric_Units], ElectricUnits, ElectricUnits.WattHours);
    this._gasUnits = clampEnumValue(config?.[EditorPages.Appearance]?.[AppearanceOptions.Energy_Units]?.[EnergyUnitsOptions.Gas_Units], GasUnits, GasUnits.Same_As_Electric);

    if (this._gasUnits === GasUnits.Same_As_Electric) {
      this._gasUnits = this._electricUnits;
    }

    this._gasCalorificValue = config?.[EditorPages.Appearance]?.[AppearanceOptions.Energy_Units]?.[EnergyUnitsOptions.Gas_Calorific_Value] ?? DefaultValues.Gas_Calorific_Value;

    this._populateEntityArrays();
    this._inferEntityModes();
  }

  //================================================================================================================================================================================//

  public getStates(): States {
    const states: States = {
      largestElectricValue: 0,
      largestGasValue: 0,
      batteryImport: this.battery.state.import,
      batteryExport: this.battery.state.export,
      batterySecondary: this.battery.secondary.state,
      gasImport: this.gas.state.import,
      gasSecondary: this.gas.secondary.state,
      gridImport: this.grid.state.import,
      gridExport: this.grid.state.export,
      gridSecondary: this.grid.secondary.state,
      highCarbon: this.grid.state.highCarbon,
      homeElectric: 0,
      // TODO: gas-producing devices need adding to here
      homeGas: this.gas.state.import,
      homeSecondary: this.home.secondary.state,
      lowCarbon: 0,
      lowCarbonPercentage: 0,
      lowCarbonSecondary: this.lowCarbon.secondary.state,
      solarImport: this.solar.state.import,
      solarSecondary: this.solar.secondary.state,
      // TODO: devices
      devices: [],
      devicesSecondary: this.devices.map(device => device.secondary.state),
      flows: {
        batteryToGrid: this.grid.state.fromBattery,
        solarToGrid: this.grid.state.fromSolar,
        gridToBattery: this.battery.state.fromGrid,
        solarToBattery: this.battery.state.fromSolar,
        batteryToHome: this.home.state.fromBattery,
        gridToHome: this.home.state.fromGrid,
        solarToHome: this.home.state.fromSolar
      }
    };

    this._addStateDeltas(states);

    // TODO: electric-producing devices need adding here
    states.homeElectric = states.batteryImport + states.gridImport + states.solarImport - states.batteryExport - states.gridExport;
    states.lowCarbon = states.gridImport - states.highCarbon;
    states.lowCarbonPercentage = (states.lowCarbon / states.gridImport) * 100 || 0;

    // The net energy in the system is (imports-exports), but as the entities may not be updated in sync with each other it is possible that the flows to the home will
    // not add up to the same value.  When this happens, while we still want to return the net energy for display, we need to rescale the flows so that the animation and
    // circles will look sensible.
    const toHome: number = states.flows.batteryToHome + states.flows.gridToHome + states.flows.solarToHome;

    if (toHome > 0) {
      const scale: number = states.homeElectric / toHome;

      if (scale > 0) {
        states.flows.batteryToHome *= scale;
        states.flows.gridToHome *= scale;
        states.flows.solarToHome *= scale;
      }
    }

    // and similar for the exports
    const toGrid: number = states.flows.batteryToGrid + states.flows.solarToGrid;

    if (toGrid > 0) {
      const scale = states.gridExport / toGrid;

      if (scale > 0) {
        states.flows.batteryToGrid *= scale;
        states.flows.solarToGrid *= scale;
      }
    }

    const toBattery: number = states.flows.gridToBattery + states.flows.solarToBattery;

    if (toBattery > 0) {
      const scale = states.batteryExport / toBattery;

      if (scale > 0) {
        states.flows.gridToBattery *= scale;
        states.flows.solarToBattery *= scale;
      }
    }

    states.largestElectricValue = Math.max(
      states.batteryImport,
      states.batteryExport,
      states.gridImport,
      states.gridExport,
      states.homeElectric,
      states.lowCarbon,
      states.solarImport
    );

    // TODO: add gas-producing devices
    states.largestGasValue = states.gasImport;

    return states;
  }

  //================================================================================================================================================================================//

  public subscribe(config: EnergyFlowCardExtConfig): Promise<UnsubscribeFunc> {
    const start: number = Date.now();

    const getEnergyDataCollectionPoll = (
      resolve: (value: EnergyCollection | PromiseLike<EnergyCollection>) => void,
      reject: (reason?: any) => void
    ) => {
      const energyCollection = getEnergyDataCollection(this.hass);

      if (energyCollection) {
        resolve(energyCollection);
      } else if (Date.now() - start > ENERGY_DATA_TIMEOUT) {
        console.debug(getEnergyDataCollection(this.hass));
        reject(new Error("No energy data received."));
      } else {
        setTimeout(() => getEnergyDataCollectionPoll(resolve, reject), 100);
      }
    };

    setTimeout(
      () => {
        if (!this._error && !this._primaryStatistics && !this._secondaryStatistics) {
          this._error = new Error("No energy data received.");
        }
      },
      ENERGY_DATA_TIMEOUT * 2);

    return new Promise<EnergyCollection>(getEnergyDataCollectionPoll)
      .catch(err => this._error = err)
      .then(async (collection: EnergyCollection) => {
        return collection.subscribe(async (data: EnergyData) => {
          this._energyData = data;

          let periodStart: Date;
          let periodEnd: Date;

          if (config?.[GlobalOptions.Display_Mode] === DisplayMode.Today) {
            periodEnd = new Date();
            periodStart = startOfDay(periodEnd);
          } else {
            periodStart = data.start;
            periodEnd = data.end ?? new Date();
          }

          const dayDiff: number = differenceInDays(periodEnd, periodStart);

          const period = config?.[EditorPages.Appearance]?.[AppearanceOptions.Flows]?.[FlowsOptions.Use_Hourly_Stats] ? 'hour' :
            isFirstDayOfMonth(periodStart) && isLastDayOfMonth(periodEnd) && dayDiff > 35 ? 'month' : dayDiff > 2 ? 'day' : 'hour';

          this._loadStatistics(periodStart, periodEnd, period);
        });
      });
  }

  //================================================================================================================================================================================//

  private _addStateDeltas(states: States): void {
    if (this._displayMode === DisplayMode.History) {
      return;
    }

    let periodStart: Date;
    let periodEnd: Date;

    if (this._displayMode === DisplayMode.Today) {
      periodStart = startOfDay(new Date());
      periodEnd = endOfDay(periodStart);
    } else {
      periodStart = this._energyData!.start;
      periodEnd = this._energyData!.end!;
    }

    const solarImportDelta: number = this._getStateDelta(periodStart, periodEnd, this._primaryStatistics, this.solar.mainEntities, this._electricUnits);
    const batteryImportDelta: number = this._getStateDelta(periodStart, periodEnd, this._primaryStatistics, this.battery.mainEntities, this._electricUnits);
    const batteryExportDelta: number = this._getStateDelta(periodStart, periodEnd, this._primaryStatistics, this.battery.returnEntities, this._electricUnits);
    const gridImportDelta: number = this._getStateDelta(periodStart, periodEnd, this._primaryStatistics, this.grid.mainEntities, this._electricUnits);
    const gridExportDelta: number = this._getStateDelta(periodStart, periodEnd, this._primaryStatistics, this.grid.returnEntities, this._electricUnits);
    const flowDeltas: Flows = this._calculateFlows(solarImportDelta, batteryImportDelta, batteryExportDelta, gridImportDelta, gridExportDelta);

    states.batteryImport += batteryImportDelta;
    states.batteryExport += batteryExportDelta;
    states.gridImport += gridImportDelta;
    states.gridExport += gridExportDelta;
    states.solarImport += solarImportDelta;
    // TODO: devices

    states.flows.batteryToGrid += flowDeltas.batteryToGrid;
    states.flows.solarToGrid += flowDeltas.solarToGrid;
    states.flows.gridToBattery += flowDeltas.gridToBattery;
    states.flows.solarToBattery += flowDeltas.solarToBattery;
    states.flows.batteryToHome += flowDeltas.batteryToHome;
    states.flows.gridToHome += flowDeltas.gridToHome;
    states.flows.solarToHome += flowDeltas.solarToHome;

    states.gasImport += this._getStateDelta(periodStart, periodEnd, this._primaryStatistics, this.gas.mainEntities, this._gasUnits);

    const highCarbonDelta: number = this.lowCarbon.isPresent ? gridImportDelta * Number(this.hass.states[this.lowCarbon.firstImportEntity!].state) / 100 : 0;
    states.highCarbon += highCarbonDelta;

    states.batterySecondary += this._getStateDelta(periodStart, periodEnd, this._secondaryStatistics, this.battery.secondary.mainEntities, this._electricUnits);
    states.gasSecondary += this._getStateDelta(periodStart, periodEnd, this._secondaryStatistics, this.gas.secondary.mainEntities, this._gasUnits);
    states.gridSecondary += this._getStateDelta(periodStart, periodEnd, this._secondaryStatistics, this.grid.secondary.mainEntities, this._electricUnits);
    states.homeSecondary += this._getStateDelta(periodStart, periodEnd, this._secondaryStatistics, this.home.secondary.mainEntities, this._electricUnits);
    states.lowCarbonSecondary += this._getStateDelta(periodStart, periodEnd, this._secondaryStatistics, this.lowCarbon.secondary.mainEntities, this._electricUnits);
    states.solarSecondary += this._getStateDelta(periodStart, periodEnd, this._secondaryStatistics, this.solar.secondary.mainEntities, this._electricUnits);
    this.devices.forEach((device, index) => states.devicesSecondary[index] += this._getStateDelta(periodStart, periodEnd, this._secondaryStatistics, device.secondary.mainEntities, this._electricUnits));
  }

  //================================================================================================================================================================================//

  private _getStateDelta(periodStart: Date, periodEnd: Date, statistics: Statistics | undefined, entityIds: string[] | undefined = [], requestedUnits: string): number {
    if (!statistics || !entityIds.length) {
      return 0;
    }

    let deltaSum: number = 0;

    entityIds.forEach(entityId => {
      const stateObj: HassEntity = this.hass.states[entityId];

      if (stateObj) {
        const lastChanged: number = Date.parse(stateObj.last_changed);

        if (lastChanged >= periodStart.getTime() && lastChanged <= periodEnd.getTime()) {
          const entityStats: StatisticValue[] = statistics[entityId];
          const state: number = Number(stateObj.state);

          if (entityStats && entityStats.length !== 0) {
            const units = stateObj.attributes.unit_of_measurement;
            deltaSum += this._toBaseUnits(state - (entityStats[entityStats.length - 1].state ?? 0), units, requestedUnits);
          }
        }
      }
    });

    return deltaSum;
  }

  //================================================================================================================================================================================//

  private async _loadStatistics(periodStart: Date, periodEnd: Date, period: '5minute' | 'hour' | 'day' | 'week' | 'month') {
    const [previousPrimaryData, primaryData]: Statistics[] = await Promise.all([
      this._fetchStatistics(addHours(periodStart, -1), periodStart, this._primaryEntityIds, 'hour'),
      this._fetchStatistics(periodStart, periodEnd, this._primaryEntityIds, period)
    ]);

    logDebug("Received primary stats for period [" + periodStart + " - " + periodEnd + "] @ " + new Date());

    if (this.lowCarbon.isPresent) {
      this._co2data = await this._fetchCo2Data(periodStart, periodEnd, period);
    }

    this._validateStatistics(this._primaryEntityIds, primaryData, previousPrimaryData, periodStart, periodEnd);
    this._primaryStatistics = primaryData;
    this._calculatePrimaryStatistics();

    if (this._secondaryEntityIds.length !== 0) {
      const [previousSecondaryData, secondaryData]: Statistics[] = await Promise.all([
        this._fetchStatistics(addHours(periodStart, -1), periodStart, this._secondaryEntityIds, 'hour'),
        this._fetchStatistics(periodStart, periodEnd, this._secondaryEntityIds, 'day')
      ]);

      logDebug("Received secondary stats for period [" + periodStart + " - " + periodEnd + "] @ " + new Date());
      this._validateStatistics(this._secondaryEntityIds, secondaryData, previousSecondaryData, periodStart, periodEnd);
      this._secondaryStatistics = secondaryData;
      this._calculateSecondaryStatistics();
    }
  }

  //================================================================================================================================================================================//

  private async _inferEntityModes(): Promise<void> {
    const statistics: Statistics = await this._fetchStatistics(addDays(startOfDay(new Date()), -1), null, [...this._primaryEntityIds, ...this._secondaryEntityIds], 'day');

    for (const entity in statistics) {
      if (statistics[entity].length !== 0) {
        const firstStat: StatisticValue = statistics[entity][0];
        let mode;

        if (this._isMisconfiguredResettingSensor(firstStat)) {
          mode = EntityMode.Misconfigured_Resetting;
        } else if (this._isTotalisingSensor(firstStat)) {
          mode = EntityMode.Totalising;
        } else {
          mode = EntityMode.Resetting;
        }

        logDebug(entity + " is a " + mode + " sensor (change=" + firstStat.change + ", state=" + firstStat.state + ")");
        this._entityModes.set(entity, mode);
      } else {
        this._entityModes.set(entity, EntityMode.Totalising);
      }
    }
  };

  //================================================================================================================================================================================//

  private _isMisconfiguredResettingSensor(stat: StatisticValue): boolean {
    const change: number = round(stat.change || 0, 6);
    const state: number = round(stat.state || 0, 6);
    return change > state || change < 0;
  }

  //================================================================================================================================================================================//

  private _isTotalisingSensor(stat: StatisticValue): boolean {
    const change: number = round(stat.change || 0, 6);
    const state: number = round(stat.state || 0, 6);
    return change >= 0 && change < state;
  }

  //================================================================================================================================================================================//

  private _calculatePrimaryStatistics(): void {
    if (!this._primaryStatistics) {
      return;
    }

    const combinedStats: Map<number, Map<string, number>> = new Map();

    if (this.grid.isPresent) {
      this._addFlowStats(this._primaryStatistics, combinedStats, this.grid.mainEntities, this._electricUnits);
      this._addFlowStats(this._primaryStatistics, combinedStats, this.grid.returnEntities, this._electricUnits);
    }

    if (this.battery.isPresent) {
      this._addFlowStats(this._primaryStatistics, combinedStats, this.battery.mainEntities, this._electricUnits);
      this._addFlowStats(this._primaryStatistics, combinedStats, this.battery.returnEntities, this._electricUnits);
    }

    if (this.solar.isPresent) {
      this._addFlowStats(this._primaryStatistics, combinedStats, this.solar.mainEntities, this._electricUnits);
    }

    let solarToHome: number = 0;
    let gridToHome: number = 0;
    let gridToBattery: number = 0;
    let batteryToGrid: number = 0;
    let batteryToHome: number = 0;
    let solarToBattery: number = 0;
    let solarToGrid: number = 0;
    let solarProduction: number = 0;
    let gridImport: number = 0;
    let gridExport: number = 0;
    let batteryImport: number = 0;
    let batteryExport: number = 0;

    combinedStats.forEach(entry => {
      const sp: number = this._getFlowEntityStates(entry, this.solar.mainEntities);
      const bi: number = this._getFlowEntityStates(entry, this.battery.mainEntities);
      const be: number = this._getFlowEntityStates(entry, this.battery.returnEntities);
      const gi: number = this._getFlowEntityStates(entry, this.grid.mainEntities);
      const ge: number = this._getFlowEntityStates(entry, this.grid.returnEntities);
      solarProduction += sp;
      gridImport += gi;
      gridExport += ge;
      batteryImport += bi;
      batteryExport += be;

      const flows: Flows = this._calculateFlows(sp, bi, be, gi, ge);
      solarToHome += flows.solarToHome;
      gridToHome += flows.gridToHome;
      gridToBattery += flows.gridToBattery;
      batteryToGrid += flows.batteryToGrid;
      batteryToHome += flows.batteryToHome;
      solarToBattery += flows.solarToBattery;
      solarToGrid += flows.solarToGrid;
    });

    if (this.grid.isPresent) {
      if (this.grid.powerOutage.isOutage) {
        this.grid.state.import = 0;
        this.grid.state.export = 0;
        this.grid.state.fromBattery = 0;
        this.grid.state.fromSolar = 0;
        this.grid.state.highCarbon = 0;
        this.home.state.fromGrid = 0;
      } else {
        this.grid.state.import = gridImport;
        this.grid.state.export = gridExport;

        if (this.battery.isPresent) {
          this.grid.state.fromBattery = batteryToGrid;
        }

        if (this.solar.isPresent) {
          this.grid.state.fromSolar = solarToGrid;
        }

        if (this.lowCarbon.isPresent && this._co2data) {
          this.grid.state.highCarbon = this._toBaseUnits(Object.values(this._co2data).reduce((sum, a) => sum + a, 0), EnergyUnitPrefixes.Kilo + ElectricUnits.WattHours, this._electricUnits);
        } else {
          this.grid.state.highCarbon = this.grid.state.import;
        }

        this.home.state.fromGrid = gridToHome;
      }
    } else {
      this.home.state.fromGrid = 0;
    }

    if (this.battery.isPresent) {
      this.battery.state.import = batteryImport;
      this.battery.state.export = batteryExport;

      if (this.grid.isPresent) {
        this.battery.state.fromGrid = gridToBattery;
      }

      if (this.solar.isPresent) {
        this.battery.state.fromSolar = solarToBattery;
      }

      this.home.state.fromBattery = batteryToHome;
    } else {
      this.home.state.fromBattery = 0;
    }

    if (this.solar.isPresent) {
      this.solar.state.import = solarProduction;
      this.home.state.fromSolar = solarToHome;
    } else {
      this.home.state.fromSolar = 0;
    }

    if (this.gas.isPresent) {
      this.gas.state.import = this._getDirectEntityStates(this.gas.config, this.gas.mainEntities, this._gasUnits);
    } else {
      this.gas.state.import = 0;
    }
  }

  //================================================================================================================================================================================//

  private _calculateSecondaryStatistics(): void {
    if (!this._secondaryStatistics) {
      return;
    }

    this._setSecondaryStatistic(this.battery);
    this._setSecondaryStatistic(this.gas);
    this._setSecondaryStatistic(this.grid);
    this._setSecondaryStatistic(this.home);
    this._setSecondaryStatistic(this.lowCarbon);
    this._setSecondaryStatistic(this.solar);
    this.devices.forEach(device => this._setSecondaryStatistic(device));
  }

  //================================================================================================================================================================================//

  private _setSecondaryStatistic(state: ValueState): void {
    if (!state.secondary.isPresent) {
      return;
    }

    state.secondary.state = this._getEntityStates(this._secondaryStatistics!, state.secondary.firstImportEntity!, state.secondary.config?.[EntitiesOptions.Entities]?.[SecondaryInfoOptions.Units]);
  }

  //================================================================================================================================================================================//

  private _addFlowStats(statistics: Statistics, combinedStats: Map<number, Map<string, number>>, entityIds: string[] | undefined = [], requestedUnits: string): void {
    if (!entityIds.length) {
      return;
    }

    entityIds.forEach(entityId => {
      const entityStats: Map<number, number> = this._getEntityStatistics(this.hass, statistics, entityId, requestedUnits);

      entityStats.forEach((value, timestamp) => {
        let entry: Map<string, number> | undefined = combinedStats.get(timestamp);

        if (!entry) {
          entry = new Map();
        }

        entry.set(entityId, value);
        combinedStats.set(timestamp, entry);
      });
    });
  }

  //================================================================================================================================================================================//

  private _getFlowEntityStates(entry: Map<string, number>, entityIds: string[] | undefined = []): number {
    if (!entityIds.length) {
      return 0;
    }

    let stateSum: number = 0;

    entityIds.forEach(entityId =>
      stateSum += entry.get(entityId) ?? 0
    );

    return stateSum;
  }

  //================================================================================================================================================================================//

  private _getDirectEntityStates(config: any, entityIds: string[] | undefined = [], requestedUnits: string): number {
    const configUnits: string | undefined = config?.[EntitiesOptions.Entities]?.[SecondaryInfoOptions.Units];
    let stateSum: number = 0;

    entityIds.forEach(entityId => {
      stateSum += this._getEntityStates(this._primaryStatistics!, entityId, configUnits || this.hass.states[entityId].attributes.unit_of_measurement, requestedUnits);
    });

    return stateSum;
  }

  //================================================================================================================================================================================//

  private _getEntityStates(statistics: Statistics, entityId: string, units: string | undefined, requestedUnits: string | undefined = undefined): number {
    const entityStats: StatisticValue[] = statistics[entityId];

    if (entityStats.length > 0) {
      const state: number = entityStats.map(stat => stat.change || 0).reduce((result, change) => result + change, 0) || 0;
      return this._toBaseUnits(state, units || this.hass.states[entityId].attributes.unit_of_measurement, requestedUnits);
    }

    return 0;
  }

  //================================================================================================================================================================================//

  private _calculateFlows(fromSolar: number, fromBattery: number, toBattery: number, fromGrid: number, toGrid: number): Flows {
    const energyIn: number = fromGrid + fromSolar + fromBattery;
    const energyOut: number = toGrid + toBattery;
    let remaining: number = Math.max(0, energyIn - energyOut);
    let solarToHome: number;
    let gridToHome: number;
    let gridToBattery: number;
    let batteryToGrid: number;
    let batteryToHome: number;
    let solarToBattery: number;
    let solarToGrid: number;

    const excess: number = Math.max(0, Math.min(toBattery, fromGrid - remaining));
    gridToBattery = excess;
    toBattery -= excess;
    fromGrid -= excess;

    solarToBattery = Math.min(fromSolar, toBattery);
    toBattery -= solarToBattery;
    fromSolar -= solarToBattery;

    solarToGrid = Math.min(fromSolar, toGrid);
    toGrid -= solarToGrid;
    fromSolar -= solarToGrid;

    batteryToGrid = Math.min(fromBattery, toGrid);
    fromBattery -= batteryToGrid;

    const gridToBattery2: number = Math.min(fromGrid, toBattery);
    gridToBattery += gridToBattery2;
    fromGrid -= gridToBattery2;

    solarToHome = Math.min(remaining, fromSolar);
    remaining -= solarToHome;

    batteryToHome = Math.min(fromBattery, remaining);
    remaining -= batteryToHome;

    gridToHome = Math.min(remaining, fromGrid);

    return {
      solarToHome: solarToHome,
      solarToBattery: solarToBattery,
      solarToGrid: solarToGrid,
      gridToHome: gridToHome,
      gridToBattery: gridToBattery,
      batteryToHome: batteryToHome,
      batteryToGrid: batteryToGrid
    };
  }

  //================================================================================================================================================================================//

  private _populateEntityArrays(): void {
    this._primaryEntityIds = [];
    this._secondaryEntityIds = [];

    [this.battery, this.gas, this.grid, this.home, this.lowCarbon, this.solar, ...this.devices].forEach(state => {
      this._primaryEntityIds.push(...state.mainEntities);

      if (state["returnEntities"]) {
        this._primaryEntityIds.push(...state["returnEntities"]);
      }

      this._secondaryEntityIds.push(...state.secondary.mainEntities);
    });
  }

  //================================================================================================================================================================================//

  private _validateStatistics(entityIds: string[], currentStatistics: Statistics, previousStatistics: Statistics, periodStart: Date, periodEnd: Date): void {
    entityIds.forEach(entity => {
      let entityStats: StatisticValue[] = currentStatistics[entity];
      let idx: number = 0;

      if (!entityStats || entityStats.length == 0 || entityStats[0].start > periodStart.getTime()) {
        let dummyStat: StatisticValue;

        if (previousStatistics && previousStatistics[entity]?.length) {
          // This entry is the final stat prior to the period we are interested in.  It is only needed for the case where we need to calculate the
          // Live/Hybrid-mode state-delta at midnight on the current date (ie, before the first stat of the new day has been generated) so we do
          // not want to include its values in the stats calculations.
          const previousStat: StatisticValue = previousStatistics[entity][0];

          dummyStat = {
            ...previousStat,
            change: 0,
            state: this._entityModes.get(entity) === EntityMode.Totalising ? previousStat.state : 0,
            mean: 100
          };
        } else {
          dummyStat = {
            change: 0,
            state: 0,
            sum: 0,
            start: periodStart.getTime(),
            end: periodEnd.getTime(),
            min: 0,
            mean: 100,
            max: 0,
            last_reset: null,
            statistic_id: entity
          };
        }

        if (entityStats) {
          entityStats.unshift(dummyStat);
        } else {
          entityStats = new Array(dummyStat);
          currentStatistics[entity] = entityStats;
        }

        idx++;
      }

      if (entityStats.length > idx) {
        let lastState: number = 0;

        entityStats.forEach(stat => {
          if (getHours(stat.start) === 0) {
            if (this._entityModes.get(entity) === EntityMode.Misconfigured_Resetting) {
              // this is a 'resetting' sensor which has been misconfigured such that the first 'change' value following the reset is out of range
              stat.change = stat.state;
            }

            lastState = stat.state || 0;
          } else {
            // the 'change' values coming back from statistics are not always correct, so recalculate them from the state-diffs
            const state: number = stat.state || 0;
            const change: number = state - lastState;

            if (this._entityModes.get(entity) === EntityMode.Totalising) {
              stat.change = change;
            } else {
              stat.change = Math.max(0, change);
            }

            lastState = state;
          }
        });
      }
    });
  }

  //================================================================================================================================================================================//

  private _fetchStatistics(periodStart: Date, periodEnd?: Date | null, entityIds?: string[], period: '5minute' | 'hour' | 'day' | 'week' | 'month' = 'hour'): Promise<Statistics> {
    return this.hass.callWS<Statistics>({
      type: 'recorder/statistics_during_period',
      start_time: periodStart.toISOString(),
      end_time: periodEnd?.toISOString(),
      statistic_ids: entityIds,
      period: period
    });
  }

  //================================================================================================================================================================================//

  private _fetchCo2Data(periodStart: Date, periodEnd?: Date | null, period: '5minute' | 'hour' | 'day' | 'week' | 'month' = 'hour'): Promise<Record<string, number>> {
    return this.hass.callWS<Record<string, number>>({
      type: "energy/fossil_energy_consumption",
      start_time: periodStart.toISOString(),
      end_time: periodEnd?.toISOString(),
      energy_statistic_ids: this.grid.mainEntities,
      co2_statistic_id: this.lowCarbon.firstImportEntity,
      period
    });
  };

  //================================================================================================================================================================================//

  private _getEntityStatistics(hass: HomeAssistant, statistics: Statistics, entityId: string, requestedUnits: string): Map<number, number> {
    const entityStats: Map<number, number> = new Map();
    const stateObj: HassEntity = hass.states[entityId];

    if (stateObj) {
      const statisticsForEntity: StatisticValue[] = statistics[entityId];

      if (statisticsForEntity && statisticsForEntity.length != 0) {
        const units: string | undefined = stateObj.attributes.unit_of_measurement;

        statisticsForEntity.map(entry => {
          const state = this._toBaseUnits(entry.change || 0, units, requestedUnits);
          entityStats.set(entry.start, (entityStats.get(entry.start) || 0) + state);
        });
      }
    }

    return entityStats;
  };

  //================================================================================================================================================================================//

  private _toBaseUnits(value: number, units: string | undefined, requestedUnits: string | undefined = undefined): number {
    if (!units || !requestedUnits) {
      return value;
    }

    const baseUnits = this._getBaseUnits(units);
    const prefixes: string[] = Object.values(EnergyUnitPrefixes);
    let multiplier: number = 1;

    for (let n = 0; n < prefixes.length; n++, multiplier *= 1000) {
      if (units === prefixes[n] + baseUnits) {
        const fn: (value: number, gcf: number) => number = UNIT_CONVERSIONS[baseUnits][requestedUnits];
        return round(fn(value, this._gasCalorificValue) * multiplier, 0);
      }
    }

    return value;
  };

  //================================================================================================================================================================================//

  private _getBaseUnits(units: string): string {
    const prefixes: string[] = Object.values(EnergyUnitPrefixes);
    const supportedUnits: string[] = [
      ElectricUnits.Calories,
      ElectricUnits.Joules,
      ElectricUnits.WattHours
    ];

    for (let u = 0; u < supportedUnits.length; u++) {
      for (let p = 0; p < prefixes.length; p++) {
        if (units === prefixes[p] + supportedUnits[u]) {
          return supportedUnits[u];
        }
      }
    }

    return units;
  }

  //================================================================================================================================================================================//
}
