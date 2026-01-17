import { localize } from "@/localize/localize";
import { ColourOptions, EditorPages, EnergyFlowCardExtConfig, SolarConfig } from "@/config";
import { Node } from "./node";
import { HomeAssistant } from "custom-card-helpers";
import { ColourMode, CssClass, ELECTRIC_ENTITY_CLASSES, EnergyDirection, SIUnitPrefixes } from "@/enums";
import { EnergySource } from "@/hass";
import { Colours } from "./colours";
import { html, LitElement, nothing, TemplateResult } from "lit";
import { Flows, States } from ".";
import { getConfigValue } from "@/config/config";
import { SegmentGroup } from "@/ui-helpers";

//================================================================================================================================================================================//

export class SolarNode extends Node<SolarConfig> {
  public readonly colours: Colours;
  public readonly cssClass: CssClass = CssClass.Solar;

  protected readonly defaultName: string = localize("EditorPages.solar");
  protected readonly defaultIcon: string = "mdi:solar-power";

  private _circleMode: ColourMode;

  //================================================================================================================================================================================//

  public constructor(hass: HomeAssistant, cardConfig: EnergyFlowCardExtConfig, energySources: EnergySource[]) {
    super(
      hass,
      cardConfig,
      EditorPages.Solar,
      undefined,
      ELECTRIC_ENTITY_CLASSES,
      SolarNode._getHassEntities(energySources)
    );

    this.colours = new Colours(this.coloursConfigs, EnergyDirection.Source_Only, undefined, "var(--energy-solar-color)");
    this._circleMode = getConfigValue(this.coloursConfigs, ColourOptions.Circle);
  }

  //================================================================================================================================================================================//

  public readonly render = (target: LitElement, style: CSSStyleDeclaration, circleSize: number, states?: States, overridePrefix?: SIUnitPrefixes): TemplateResult => {
    const segmentGroups: SegmentGroup[] = [];

    if (states) {
      const flows: Flows = states.flows;

      if (this._circleMode === ColourMode.Dynamic) {
        segmentGroups.push(
          {
            inactiveCss: CssClass.Solar,
            segments: [
              {
                state: flows.solarToBattery,
                cssClass: CssClass.Battery_Export
              },
              {
                state: flows.solarToGrid,
                cssClass: CssClass.Grid_Export
              },
              {
                state: flows.solarToHome,
                cssClass: CssClass.Solar
              }
            ]
          }
        );
      }
    }

    const primaryState: number | undefined = states && states.solarImport;
    const inactiveCss: CssClass = primaryState === 0 ? this.inactiveFlowsCss : CssClass.None;
    const valueCss: string = CssClass.Solar + " " + inactiveCss;
    const borderCss: CssClass = this._circleMode === ColourMode.Dynamic ? CssClass.Hidden_Circle : CssClass.None;

    this.setCssVariables(style);

    return html`
      <div class="circle ${borderCss} ${inactiveCss}">
        ${this._circleMode === ColourMode.Dynamic ? this.renderSegmentedCircle(segmentGroups, circleSize, 0, this.showSegmentGaps) : nothing}
        ${this.renderSecondarySpan(target, this.secondary, states?.solarSecondary, valueCss)}
        <ha-icon class="entity-icon ${inactiveCss}" .icon=${this.icon}></ha-icon>
        ${this.renderEnergyStateSpan(target, valueCss, this.energyUnits, this.firstImportEntity, undefined, primaryState, overridePrefix)}
      </div>
    `;
  }

  //================================================================================================================================================================================//

  private static _getHassEntities = (energySources: EnergySource[]): string[] => {
    return energySources.filter(source => source.type === "solar").map(source => source.stat_energy_from!);
  }

  //================================================================================================================================================================================//
}
