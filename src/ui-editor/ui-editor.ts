import { LitElement, css, html, nothing, TemplateResult, CSSResultGroup } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { fireEvent, HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import { assert } from 'superstruct';
import { EditorPages, EnergyFlowCardExtConfig, EntitiesOptions, EntityOptions, HomeConfig, isValidPrimaryEntity, isValidSecondaryEntity } from '@/config';
import { appearanceSchema, generalConfigSchema } from './schema';
import { localize } from '@/localize/localize';
import { gridSchema } from './schema/grid';
import { solarSchema } from './schema/solar';
import { batterySchema } from './schema/battery';
import { lowCarbonSchema } from './schema/low-carbon';
import { homeSchema } from './schema/home';
import { gasSchema } from './schema/gas';
import "./components/page-header";
import "./components/devices-editor";
import { CARD_NAME } from '@/const';
import { cardConfigStruct } from '@/config/validation';
import { computeHelperCallback, computeLabelCallback } from '.';
import { mdiChevronRight, mdiCheckCircle, mdiAlert, mdiAlertOctagon } from '@mdi/js';
import { getDefaultLowCarbonConfig, cleanupConfig, getDefaultAppearanceConfig, getDefaultGridConfig, getDefaultGasConfig, getDefaultSolarConfig, getDefaultBatteryConfig, getDefaultHomeConfig, getCo2SignalEntity } from '@/config/config';

export const EDITOR_ELEMENT_NAME = CARD_NAME + "-editor";

function getStatusIcon(hass: HomeAssistant, config: any): string | undefined {
  let primaryEntityCount: number = 0;
  let secondaryEntityCount: number = 0;
  let validEntityCount: number = 0;
  let invalidEntityCount: number = 0;

  if (config?.[EntitiesOptions.Entities]?.[EntityOptions.Entity_Ids]) {
    config?.[EntitiesOptions.Entities]?.[EntityOptions.Entity_Ids].forEach(entityId => {
      primaryEntityCount++;

      if (isValidPrimaryEntity(hass, entityId)) {
        validEntityCount++;
      } else {
        invalidEntityCount++;
      }
    });
  }

  if (config?.[EntitiesOptions.Import_Entities]?.[EntityOptions.Entity_Ids]) {
    config?.[EntitiesOptions.Import_Entities]?.[EntityOptions.Entity_Ids].forEach(entityId => {
      primaryEntityCount++;

      if (isValidPrimaryEntity(hass, entityId)) {
        validEntityCount++;
      } else {
        invalidEntityCount++;
      }
    });
  }

  if (config?.[EntitiesOptions.Export_Entities]?.[EntityOptions.Entity_Ids]) {
    config?.[EntitiesOptions.Export_Entities]?.[EntityOptions.Entity_Ids].forEach(entityId => {
      primaryEntityCount++;

      if (isValidPrimaryEntity(hass, entityId)) {
        validEntityCount++;
      } else {
        invalidEntityCount++;
      }
    });
  }

  if (config?.[EntitiesOptions.Secondary_Info]?.[EntityOptions.Entity_Id]) {
    secondaryEntityCount++;

    if (isValidSecondaryEntity(hass, config?.[EntitiesOptions.Secondary_Info]?.[EntityOptions.Entity_Id])) {
      validEntityCount++;
    }
  }

  if (primaryEntityCount === 0 && secondaryEntityCount === 0) {
    return undefined;
  }

  if (primaryEntityCount > 0 && invalidEntityCount === primaryEntityCount) {
    return mdiAlertOctagon;
  }

  if (validEntityCount === primaryEntityCount + secondaryEntityCount) {
    return mdiCheckCircle;
  }

  return mdiAlert;
}

const CONFIG_PAGES: {
  page: EditorPages;
  icon: string;
  schema?;
  createConfig?;
  statusIcon?;
}[] = [
    {
      page: EditorPages.Appearance,
      icon: "mdi:cog",
      schema: appearanceSchema,
      createConfig: getDefaultAppearanceConfig,
      statusIcon: () => false
    },
    {
      page: EditorPages.Grid,
      icon: "mdi:transmission-tower",
      schema: gridSchema,
      createConfig: getDefaultGridConfig,
      statusIcon: (config: EnergyFlowCardExtConfig, hass: HomeAssistant) => getStatusIcon(hass, config?.[EditorPages.Grid])
    },
    {
      page: EditorPages.Gas,
      icon: "mdi:fire",
      schema: gasSchema,
      createConfig: getDefaultGasConfig,
      statusIcon: (config: EnergyFlowCardExtConfig, hass: HomeAssistant) => getStatusIcon(hass, config?.[EditorPages.Gas])
    },
    {
      page: EditorPages.Solar,
      icon: "mdi:solar-power",
      schema: solarSchema,
      createConfig: getDefaultSolarConfig,
      statusIcon: (config: EnergyFlowCardExtConfig, hass: HomeAssistant) => getStatusIcon(hass, config?.[EditorPages.Solar])
    },
    {
      page: EditorPages.Battery,
      icon: "mdi:battery-high",
      schema: batterySchema,
      createConfig: getDefaultBatteryConfig,
      statusIcon: (config: EnergyFlowCardExtConfig, hass: HomeAssistant) => getStatusIcon(hass, config?.[EditorPages.Battery])
    },
    {
      page: EditorPages.Low_Carbon,
      icon: "mdi:leaf",
      schema: lowCarbonSchema,
      createConfig: getDefaultLowCarbonConfig,
      statusIcon: (config: EnergyFlowCardExtConfig, hass: HomeAssistant) => getStatusIcon(hass, config?.[EditorPages.Low_Carbon]) || (getCo2SignalEntity(hass) !== undefined ? mdiCheckCircle : undefined)
    },
    {
      page: EditorPages.Home,
      icon: "mdi:home",
      schema: homeSchema,
      createConfig: getDefaultHomeConfig,
      statusIcon: (config: HomeConfig, hass: HomeAssistant) => getStatusIcon(hass, config?.[EditorPages.Home])
    },
    {
      page: EditorPages.Devices,
      icon: "mdi:devices",
      createConfig: () => { },
      // TODO get the icon for each Device and take the worst-case for display
      statusIcon: (config: EnergyFlowCardExtConfig, hass: HomeAssistant) => config?.[EditorPages.Devices]?.map(device => device[EntitiesOptions.Entities]?.[EntityOptions.Entity_Ids]?.length).find(length => length) ? mdiCheckCircle : undefined
    }
  ];

@customElement(EDITOR_ELEMENT_NAME)
export class EnergyFlowCardExtEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config?: EnergyFlowCardExtConfig;
  @state() private _currentConfigPage: EditorPages | null = null;

  public async setConfig(config: EnergyFlowCardExtConfig): Promise<void> {
    assert(config, cardConfigStruct);
    this._config = config;
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) {
      return nothing;
    }

    const config: EnergyFlowCardExtConfig = this._config;

    if (this._currentConfigPage) {
      const currentPage: string = this._currentConfigPage;
      const schema = CONFIG_PAGES.find(page => page.page === currentPage)?.schema;
      const icon: string | undefined = CONFIG_PAGES.find((page) => page.page === currentPage)?.icon;

      if (!config[currentPage]) {
        config[currentPage] = CONFIG_PAGES.find(page => page.page === currentPage)?.createConfig(this.hass);
      }

      const configForPage: any = config[currentPage];

      return html`
        <energy-flow-card-ext-page-header @go-back=${this._goBack} icon="${icon}" label=${localize(`editor.${currentPage}`)}></energy-flow-card-ext-page-header>
        ${this._currentConfigPage === EditorPages.Devices
          ? html`
            <energy-flow-card-ext-devices-editor
              .hass=${this.hass}
              .config=${this._config}
              @config-changed=${this._valueChanged}
            ></energy-flow-card-ext-devices-editor>
          `
          : html`
            <ha-form
              .hass=${this.hass}
              .data=${configForPage}
              .schema=${schema(config, configForPage)}
              .computeLabel=${computeLabelCallback}
              .computeHelper=${computeHelperCallback}
              .error=${this._validateConfig(config)}
              @value-changed=${this._valueChanged}
            ></ha-form>
          `
        }
      `;
    }

    return html`
      <div class="card-config">
        <ha-form
          .hass=${this.hass}
          .data=${config}
          .schema=${generalConfigSchema(config)}
          .computeLabel=${computeLabelCallback}
          .computeHelper=${computeHelperCallback}
          @value-changed=${this._valueChanged}
        ></ha-form>
        ${this._renderPageLinks()}
      </div>
    `;
  }

  private _openPage(page: EditorPages): void {
    this._currentConfigPage = page;
  }

  private _goBack(): void {
    this._currentConfigPage = null;
  }

  private _renderPageLinks = (): TemplateResult[] => {
    return CONFIG_PAGES.map(page => this._renderPageLink(page.page, page.icon, page.statusIcon(this._config, this.hass)));
  };

  private _renderPageLink = (page: EditorPages, icon: string, statusIcon: string | undefined): TemplateResult => {
    if (!page) {
      return html``;
    }

    const statusIconClass: string = statusIcon === mdiCheckCircle ? "page-checkmark" : statusIcon === mdiAlert ? "page-alert" : "page-error";

    return html`
      <ha-control-button class="page-link" @click=${() => this._openPage(page)}>
        <ha-icon class="page-icon" .icon=${icon}></ha-icon>
        <div class="page-label">
          ${localize(`editor.${page}`)}
          ${statusIcon ? html`<ha-svg-icon class="${statusIconClass}" .path=${statusIcon}></ha-svg-icon>` : ``}
        </div>
        <ha-svg-icon .path=${mdiChevronRight}></ha-svg-icon>
      </ha-control-button>
    `;
  };

  private _valueChanged(ev: any): void {
    if (!this._config || !this.hass) {
      return;
    }

    let config = ev.detail.value || "";

    if (this._currentConfigPage) {
      config = {
        ...this._config,
        [this._currentConfigPage]: config
      };
    }

    fireEvent(this, 'config-changed', { config: cleanupConfig(this.hass, config) });
  }

  private _validateConfig(config: EnergyFlowCardExtConfig): {} {
    const errors: object = {};

    if (this._currentConfigPage) {
      switch (this._currentConfigPage) {
        case EditorPages.Battery:
        case EditorPages.Grid:
          this._validatePrimaryEntities(EntitiesOptions.Import_Entities, config?.[this._currentConfigPage]?.[EntitiesOptions.Import_Entities]?.[EntityOptions.Entity_Ids], errors);
          this._validatePrimaryEntities(EntitiesOptions.Export_Entities, config?.[this._currentConfigPage]?.[EntitiesOptions.Export_Entities]?.[EntityOptions.Entity_Ids], errors);
          break;

        case EditorPages.Gas:
        case EditorPages.Solar:
          this._validatePrimaryEntities(EntitiesOptions.Entities, config?.[this._currentConfigPage]?.[EntitiesOptions.Entities]?.[EntityOptions.Entity_Ids], errors);
          break;

        // TODO: devices

      }

      this._validateSecondaryEntity(EntitiesOptions.Secondary_Info, config?.[this._currentConfigPage]?.[EntitiesOptions.Secondary_Info]?.[EntityOptions.Entity_Id], errors);
    }

    return errors;
  }

  private _validatePrimaryEntities(label: string, entityIds: string[] = [], errors: object): void {
    delete errors[label];

    let error: string = "";

    entityIds.forEach(entityId => {
      if (!entityId || entityId === "") {
        error += localize("editor.missing_entity") + "\n";
      } else if (!isValidPrimaryEntity(this.hass, entityId)) {
        error += "'" + (this.hass.states[entityId]?.attributes?.friendly_name || entityId) + "' " + localize("editor.invalid_primary_entity") + "\n";
      }
    });

    if (error) {
      errors[label] = error;
    }
  }

  private _validateSecondaryEntity(label: string, entityId: string, errors: object): void {
    delete errors[label];

    if (entityId === undefined) {
      return;
    }

    if (!entityId || entityId === "") {
      errors[label] = localize("editor.missing_entity");
    } else if (!isValidSecondaryEntity(this.hass, entityId)) {
      errors[label] = "'" + (this.hass.states[entityId]?.attributes?.friendly_name || entityId) + "' " + localize("editor.invalid_secondary_entity");
    }
  }

  static get styles(): CSSResultGroup {
    return [
      css`
        ha-form {
          width: 100%;
        }

        .card-config {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .page-link {
          width: 100%;
          min-height: 4rem;
          cursor: pointer;
        }

        .page-icon {
          margin-right: 1rem;
          --mdc-icon-size: 2rem;
        }

        .page-label {
          width: 100%;
          font-size: 1.2rem;
          text-align: left;
        }

        .page-checkmark {
          padding-left: 1rem;
          color: green;
        }

        .page-alert {
          padding-left: 1rem;
          color: orange;
        }

        .page-error {
          padding-left: 1rem;
          color: red;
        }
      `
    ];
  }
}
