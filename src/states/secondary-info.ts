import { isValidSecondaryEntity, SecondaryInfoConfig, SecondaryInfoOptions } from "@/config";
import { HomeAssistant } from "custom-card-helpers";
import { DEFAULT_SECONDARY_INFO_CONFIG, getConfigValue } from "@/config/config";

export class SecondaryInfoState {
  config: SecondaryInfoConfig[];
  state: number;

  public get isPresent(): boolean {
    return this._entity !== undefined;
  }

  public get entity(): string | undefined {
    return this._entity
  }
  private _entity?: string;

  public get configEntity(): string | undefined {
    return this._configEntity
  }
  private _configEntity?: string;

  public get icon(): string | undefined {
    return this._icon;
  }
  private _icon?: string;

  public constructor(hass: HomeAssistant, config: SecondaryInfoConfig) {
    this.config = [config, DEFAULT_SECONDARY_INFO_CONFIG];
    this.state = 0;
    this._configEntity = getConfigValue(config, SecondaryInfoOptions.Entity_Id);
    this._entity = isValidSecondaryEntity(hass, this._configEntity) ? this._configEntity : undefined;
    this._icon = getConfigValue([config, DEFAULT_SECONDARY_INFO_CONFIG], SecondaryInfoOptions.Icon);
  }
}
