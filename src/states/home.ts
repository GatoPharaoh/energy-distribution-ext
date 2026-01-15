import { localize } from "@/localize/localize";
import { ColoursConfig, HomeConfig, NodeOptions } from "@/config";
import { Colours, State } from "./state";
import { HomeAssistant } from "custom-card-helpers";
import { DEFAULT_HOME_CONFIG, getConfigObjects } from "@/config/config";
import { CssClass, EnergyDirection } from "@/enums";

export class HomeState extends State {
  public readonly colours: Colours;
  public readonly cssClass: CssClass = CssClass.Home;

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

    const coloursConfig: ColoursConfig[] = getConfigObjects([config, DEFAULT_HOME_CONFIG], NodeOptions.Colours);
    this.colours = new Colours(coloursConfig, EnergyDirection.Consumer);
  }
}
