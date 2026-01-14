import { localize } from "@/localize/localize";
import { HomeConfig } from "@/config";
import { Colours, State } from "./state";
import { HomeAssistant } from "custom-card-helpers";
import { DEFAULT_HOME_CONFIG } from "@/config/config";

export class HomeState extends State {
  state: {
    fromSolar: number;
    fromGrid: number;
    fromBattery: number;
  };

  protected get defaultName(): string {
    return localize("EditorPages.home");
  }

  protected get defaultIcon(): string {
    return "mdi:home";
  }

  public constructor(hass: HomeAssistant, config: HomeConfig) {
    super(hass, [config, DEFAULT_HOME_CONFIG]);

    this.state = {
      fromSolar: 0,
      fromGrid: 0,
      fromBattery: 0
    };
  }
}
