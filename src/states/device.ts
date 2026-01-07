import { DeviceConfig, OverridesOptions } from "@/config";
import { HomeAssistant } from "custom-card-helpers";
import { localize } from "@/localize/localize";
import { SingleValueState } from "./state";
import { ELECTRIC_ENTITY_CLASSES } from "@/const";

export class DeviceState extends SingleValueState {
  config?: DeviceConfig;

  public constructor(hass: HomeAssistant, config: DeviceConfig | undefined) {
    super(
      hass,
      config,
      [],
      config?.[OverridesOptions.Name] || localize("common.new_device"),
      config?.[OverridesOptions.Icon] || "mdi:devices",
      ELECTRIC_ENTITY_CLASSES
    );

    this.config = config;
  }
}
