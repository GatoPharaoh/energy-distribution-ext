import { GasConfig } from "@/config";
import { SingleValueState } from "./state";
import { localize } from "@/localize/localize";
import { HomeAssistant } from "custom-card-helpers";
import { GAS_ENTITY_CLASSES } from "@/const";

export class GasState extends SingleValueState {
  config?: GasConfig;

  public constructor(hass: HomeAssistant, config: GasConfig | undefined) {
    super(
      hass,
      config,
      localize("editor.gas"),
      "mdi:fire",
      GAS_ENTITY_CLASSES
    );

    this.config = config;
  }
}
