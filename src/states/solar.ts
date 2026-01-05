import { localize } from "@/localize/localize";
import { SolarConfig } from "@/config";
import { SingleValueState } from "./state";
import { HomeAssistant } from "custom-card-helpers";
import { ELECTRIC_ENTITY_CLASSES } from "@/const";

export class SolarState extends SingleValueState {
  config?: SolarConfig;

  public constructor(hass: HomeAssistant, config: SolarConfig | undefined) {
    super(
      hass,
      config,
      localize("editor.solar"),
      "mdi:solar-power",
      ELECTRIC_ENTITY_CLASSES
    );

    this.config = config;
  }
}
