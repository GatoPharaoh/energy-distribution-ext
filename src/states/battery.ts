import { BatteryConfig, ColoursConfig, NodeOptions } from "@/config";
import { Colours, State } from "./state";
import { localize } from "@/localize/localize";
import { HomeAssistant } from "custom-card-helpers";
import { EnergySource } from "@/hass";
import { DEFAULT_BATTERY_CONFIG, getConfigObjects } from "@/config/config";
import { ELECTRIC_ENTITY_CLASSES, EnergyDirection } from "@/enums";

export class BatteryState extends State {
  public readonly colours: Colours;

  state: {
    import: number;
    export: number;
    fromSolar: number;
    fromGrid: number;
  };

  protected get defaultName(): string {
    return localize("EditorPages.battery");
  }

  protected get defaultIcon(): string {
    return "mdi:battery-high";
  }

  public constructor(hass: HomeAssistant, config: BatteryConfig, energySources: EnergySource[]) {
    super(
      hass,
      [config, DEFAULT_BATTERY_CONFIG],
      ELECTRIC_ENTITY_CLASSES,
      BatteryState._getHassImportEntities(energySources),
      BatteryState._getHassExportEntities(energySources)
    );

    this.state = {
      import: 0,
      export: 0,
      fromSolar: 0,
      fromGrid: 0
    };

    const coloursConfig: ColoursConfig[] = getConfigObjects([config, DEFAULT_BATTERY_CONFIG], NodeOptions.Colours);
    this.colours = new Colours(coloursConfig, EnergyDirection.Both, this.state, "var(--energy-battery-out-color)", "var(--energy-battery-in-color)");
  }

  private static _getHassImportEntities = (energySources: EnergySource[]): string[] => {
    return energySources.filter(source => source.type === "battery").filter(source => source.stat_energy_from).map(source => source.stat_energy_from!);
  }

  private static _getHassExportEntities = (energySources: EnergySource[]): string[] => {
    return energySources.filter(source => source.type === "battery").filter(source => source.stat_energy_to).map(source => source.stat_energy_to!);
  }
}
