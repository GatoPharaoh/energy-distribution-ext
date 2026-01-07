import { localize } from "@/localize/localize";
import { SolarConfig } from "@/config";
import { SingleValueState } from "./state";
import { HomeAssistant } from "custom-card-helpers";
import { ELECTRIC_ENTITY_CLASSES } from "@/const";
import { EnergySource } from "@/hass";

export class SolarState extends SingleValueState {
  config?: SolarConfig;

  public constructor(hass: HomeAssistant, config: SolarConfig | undefined, energySources: EnergySource[]) {
    super(
      hass,
      config,
      SolarState._getHassEntities(energySources),
      localize("editor.solar"),
      "mdi:solar-power",
      ELECTRIC_ENTITY_CLASSES
    );

    this.config = config;
  }

  private static _getHassEntities = (energySources: EnergySource[]): string[] => {
    return energySources.filter(source => source.type === "solar").map(source => source.stat_energy_from!) || [];
  }
}
