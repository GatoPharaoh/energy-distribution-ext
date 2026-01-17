import { DeviceConfig, DeviceOptions, ColourOptions, EditorPages, EnergyFlowCardExtConfig } from "@/config";
import { HomeAssistant } from "custom-card-helpers";
import { Node} from "./node";
import { DEFAULT_DEVICE_CONFIG, getConfigValue } from "@/config/config";
import { CssClass, ELECTRIC_ENTITY_CLASSES, EnergyDirection, EnergyType, GAS_ENTITY_CLASSES, SIUnitPrefixes, VolumeUnits } from "@/enums";
import { BiDiState, States } from ".";
import { Colours } from "./colours";
import { html, LitElement, nothing, TemplateResult } from "lit";

//================================================================================================================================================================================//

export class DeviceNode extends Node<DeviceConfig> {
  public readonly colours: Colours;
  public readonly cssClass: CssClass;
  public readonly state: BiDiState;
  public readonly type: EnergyType;
  public readonly direction: EnergyDirection;
  public exportIcon: string = "";
  public importIcon: string = "";

  protected get defaultName(): string {
    return this._defaultName;
  }
  private _defaultName: string;

  protected get defaultIcon(): string {
    return this._defaultIcon;
  }
  private _defaultIcon: string;

  private _index: number;

  //================================================================================================================================================================================//

  public constructor(hass: HomeAssistant, cardConfig: EnergyFlowCardExtConfig, index: number) {
    super(
      hass,
      cardConfig,
      EditorPages.Devices,
      index,
      getConfigValue([(getConfigValue(cardConfig, EditorPages.Devices) as DeviceConfig[])[index], DEFAULT_DEVICE_CONFIG], DeviceOptions.Energy_Type) === EnergyType.Gas ? GAS_ENTITY_CLASSES : ELECTRIC_ENTITY_CLASSES
    );

    this.cssClass = `${CssClass.Device}-${index}` as CssClass;
    this._index = index;

    this.state = {
      import: 0,
      export: 0
    };

    this._defaultName = getConfigValue(this.nodeConfigs, DeviceOptions.Name);
    this._defaultIcon = getConfigValue(this.nodeConfigs, DeviceOptions.Icon);

    this.type = getConfigValue(this.nodeConfigs, DeviceOptions.Energy_Type);
    this.direction = getConfigValue(this.nodeConfigs, DeviceOptions.Energy_Direction);

    this.colours = new Colours(
      this.coloursConfigs,
      this.direction,
      this.state,
      getConfigValue(this.coloursConfigs, ColourOptions.Flow_Import_Colour),
      getConfigValue(this.coloursConfigs, ColourOptions.Flow_Export_Colour)
    );
  }

  //================================================================================================================================================================================//

  public readonly render = (target: LitElement, style: CSSStyleDeclaration, circleSize: number, states?: States, overrideElectricPrefix?: SIUnitPrefixes, overrideGasPrefix?: SIUnitPrefixes): TemplateResult => {
    let importValue: number | undefined | null;
    let exportValue: number | undefined | null;
    const inactiveCss: string = !states || (importValue === 0 && exportValue === 0) ? this.inactiveFlowsCss : CssClass.None;
    const importCss: string = "import-" + this.cssClass + " " + (!states || importValue === 0 ? inactiveCss : CssClass.None);
    const exportCss: string = "export-" + this.cssClass + " " + (!states || exportValue === 0 ? inactiveCss : CssClass.None);
    const secondaryCss: string = this.cssClass + " " + inactiveCss;
    const prefix: SIUnitPrefixes | undefined = this.type === EnergyType.Electric ? overrideElectricPrefix : overrideGasPrefix;

    this.setCssVariables(style);

    let units: string;

    if (this.type === EnergyType.Gas) {
      if (this.volumeUnits !== VolumeUnits.Same_As_Electric) {
        importValue = this.firstImportEntity ? states?.devicesGasVolume[this._index]?.import : null;
        exportValue = this.firstExportEntity ? states?.devicesGasVolume[this._index]?.export : null;
        units = this.volumeUnits;
      } else {
        importValue = this.firstImportEntity ? states?.devicesGas[this._index]?.import : null;
        exportValue = this.firstExportEntity ? states?.devicesGas[this._index]?.export : null;
        units = this.energyUnits;
      }
    } else {
      importValue = this.firstImportEntity ? states?.devicesElectric[this._index]?.import : null;
      exportValue = this.firstExportEntity ? states?.devicesElectric[this._index]?.export : null;
      units = this.energyUnits;
    }

    return html`
      <div class="circle ${inactiveCss}">
        ${this.renderSecondarySpan(target, this.secondary, states?.devicesSecondary[this._index], secondaryCss)}
        <ha-icon class="entity-icon ${inactiveCss}" .icon=${this.icon}></ha-icon>
        ${this.direction !== EnergyDirection.Source_Only ? this.renderEnergyStateSpan(target, exportCss, units, this.firstExportEntity, this.direction === EnergyDirection.Both ? this.exportIcon : undefined, exportValue, prefix) : nothing}
        ${this.direction !== EnergyDirection.Consumer_only ? this.renderEnergyStateSpan(target, importCss, units, this.firstImportEntity, this.direction === EnergyDirection.Both ? this.importIcon : undefined, importValue, prefix) : nothing}
      </div>
    `;
  }

  //================================================================================================================================================================================//
}
