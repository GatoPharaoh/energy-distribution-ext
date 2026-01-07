import { EntityOptions, filterSecondaryEntity, SecondaryInfoConfig, SecondaryInfoOptions } from "@/config";
import { HomeAssistant } from "custom-card-helpers";
import { State } from ".";
import { getConfigValue } from "@/config/config";

export class SecondaryInfoState extends State {
  config?: SecondaryInfoConfig;
  state: number;
  units?: string;

  public constructor(hass: HomeAssistant, config: SecondaryInfoConfig | undefined) {
    super(config, filterSecondaryEntity(hass, getConfigValue([config], [EntityOptions.Entity_Id])), getConfigValue([config], [SecondaryInfoOptions.Icon]) || "");
    this.config = config;
    this.state = 0;

    const entityId: string = getConfigValue([config], [EntityOptions.Entity_Id]);

    if (entityId) {
      this.rawEntities.push(entityId);
    }
  }
}
