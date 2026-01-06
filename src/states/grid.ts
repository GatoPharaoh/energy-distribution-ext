import { localize } from "@/localize/localize";
import { EntityOptions, GridConfig, PowerOutageConfig, PowerOutageOptions } from "@/config";
import { DualValueState } from "./state";
import { HomeAssistant } from "custom-card-helpers";
import { getConfigValue } from "@/config/config";

export class GridState extends DualValueState {
  config?: GridConfig;

  state: {
    import: number;
    export: number;
    highCarbon: number;
    fromBattery: number;
    fromSolar: number;
  };

  powerOutage: {
    isPresent: boolean;
    isOutage: boolean;
    icon: string;
    state: string;
    entity_id: string;
  };

  public constructor(hass: HomeAssistant, config: GridConfig | undefined) {
    super(
      hass,
      config,
      localize("editor.grid"),
      "mdi:transmission-tower"
    );

    this.config = config;

    this.state = {
      import: 0,
      export: 0,
      highCarbon: 0,
      fromBattery: 0,
      fromSolar: 0
    };

    const powerOutageConfig: PowerOutageConfig | undefined = config?.[PowerOutageOptions.Power_Outage];

    this.powerOutage = {
      isPresent: powerOutageConfig?.[EntityOptions.Entity_Id] !== undefined,
      isOutage: false,
      icon: getConfigValue([powerOutageConfig], [PowerOutageOptions.Alert_Icon]) || "mdi:transmission-tower-off",
      state: getConfigValue([powerOutageConfig], [PowerOutageOptions.Alert_State]),
      entity_id: getConfigValue([powerOutageConfig], [EntityOptions.Entity_Id])
    };
  }
}
