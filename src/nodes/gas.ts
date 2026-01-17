import { EditorPages, EnergyFlowCardExtConfig, GasConfig } from "@/config";
import { Node } from "./node";
import { localize } from "@/localize/localize";
import { HomeAssistant } from "custom-card-helpers";
import { CssClass, EnergyDirection, GAS_ENTITY_CLASSES, SIUnitPrefixes, VolumeUnits } from "@/enums";
import { EnergySource } from "@/hass";
import { html, LitElement, TemplateResult } from "lit";
import { States } from ".";
import { Colours } from "./colours";

//================================================================================================================================================================================//

export class GasNode extends Node<GasConfig> {
  public readonly colours: Colours;
  public readonly cssClass: CssClass = CssClass.Gas;

  protected readonly defaultName: string = localize("EditorPages.gas");
  protected readonly defaultIcon: string = "mdi:fire";

  //================================================================================================================================================================================//

  public constructor(hass: HomeAssistant, cardConfig: EnergyFlowCardExtConfig, energySources: EnergySource[]) {
    super(
      hass,
      cardConfig,
      EditorPages.Gas,
      undefined,
      GAS_ENTITY_CLASSES,
      GasNode._getHassEntities(energySources)
    );

    this.colours = new Colours(this.coloursConfigs, EnergyDirection.Source_Only, undefined, "var(--energy-gas-color)");
  }

  //================================================================================================================================================================================//

  public readonly render = (target: LitElement, style: CSSStyleDeclaration, circleSize: number, states?: States, _?, overrideGasPrefix?: SIUnitPrefixes): TemplateResult => {
    let units: string;
    let primaryState: number | undefined;

    if (this.volumeUnits === VolumeUnits.Same_As_Electric) {
      primaryState = states?.gasImport;
      units = this.energyUnits;
    } else {
      primaryState = states?.gasImportVolume;
      units = this.volumeUnits;
    }

    const inactiveCss: CssClass = !states || primaryState === 0 ? this.inactiveFlowsCss : CssClass.None;
    const valueCss: string = CssClass.Gas + " " + inactiveCss;

    this.setCssVariables(style);

    return html`
      <div class="circle ${inactiveCss}">
        ${this.renderSecondarySpan(target, this.secondary, states?.gasSecondary, valueCss)}
        <ha-icon class="entity-icon ${inactiveCss}" .icon=${this.icon}></ha-icon>
        ${this.renderEnergyStateSpan(target, valueCss, units, this.firstImportEntity, undefined, primaryState, overrideGasPrefix)}
      </div>
    `;
  }

  //================================================================================================================================================================================//

  private static _getHassEntities = (energySources: EnergySource[]): string[] => {
    return energySources.filter(source => source.type === "gas").map(source => source.stat_energy_from!);
  }

  //================================================================================================================================================================================//
}
