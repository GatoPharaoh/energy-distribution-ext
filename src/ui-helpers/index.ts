import { svg, TemplateResult } from "lit";
import { ColourOptions, EntitiesOptions, SingleValueNodeConfig } from "@/config";
import { ColourMode, CssClass } from "@/enums";
import { STYLE_ENERGY_NON_FOSSIL_COLOR, STYLE_PRIMARY_TEXT_COLOR } from "@/const";

//================================================================================================================================================================================//

export const renderLine = (id: string, path: string, cssClass: string | undefined = undefined): TemplateResult => {
  return svg`<path id="${id}" class="${cssClass || id}" d="${path}" vector-effect="non-scaling-stroke"/>`;
};

//================================================================================================================================================================================//

export const renderDot = (size: number, cssClass: string, duration: number, reverseDirection: boolean = false, pathRef: string | undefined = undefined): TemplateResult => {
  return svg`
      <circle r="${size}" class="${cssClass}" vector-effect="non-scaling-stroke">
        <animateMotion dur="${duration}s" repeatCount="indefinite" keyPoints="${reverseDirection ? "1; 0" : "0; 1"}" keyTimes="0; 1" calcMode="linear">
          <mpath xlink: href = "#${pathRef ?? cssClass}"/>
        </animateMotion>
      </circle>
      `;
};

//================================================================================================================================================================================//

export function setSingleValueNodeStyles(config: SingleValueNodeConfig, cssClass: CssClass, style: CSSStyleDeclaration): void {
  const energyColour: string = `var(--energy-${cssClass}-color)`;
  const customColour: string | undefined = convertColourListToHex(config?.[EntitiesOptions.Colours]?.[ColourOptions.Custom_Colour]);
  const circleColour: string = config?.[EntitiesOptions.Colours]?.[ColourOptions.Circle] === ColourMode.Custom && customColour ? customColour : energyColour;
  let textColour: string;
  let iconColour: string;

  switch (config?.[EntitiesOptions.Colours]?.[ColourOptions.Value]) {
    case ColourMode.Default:
      textColour = energyColour;
      break;

    case ColourMode.Circle:
      textColour = circleColour;
      break;

    case ColourMode.Custom:
      textColour = customColour ?? STYLE_PRIMARY_TEXT_COLOR;
      break;

    default:
      textColour = STYLE_PRIMARY_TEXT_COLOR;
      break;
  }

  switch (config?.[EntitiesOptions.Colours]?.[ColourOptions.Icon]) {
    case ColourMode.Default:
      iconColour = energyColour;
      break;

    case ColourMode.Circle:
      iconColour = circleColour;
      break;

    case ColourMode.Custom:
      iconColour = customColour ?? STYLE_PRIMARY_TEXT_COLOR;
      break;

    default:
      iconColour = cssClass === CssClass.LowCarbon ? STYLE_ENERGY_NON_FOSSIL_COLOR : STYLE_PRIMARY_TEXT_COLOR;
      break;
  }

  style.setProperty(`--text-${cssClass}-color`, textColour);
  style.setProperty(`--icon-${cssClass}-color`, iconColour);
  style.setProperty(`--circle-${cssClass}-color`, circleColour);
}

//================================================================================================================================================================================//

const convertColourListToHex = (colourList: number[] | undefined = []): string | undefined => {
  if (colourList.length !== 3) {
    return undefined;
  }

  return "#".concat(colourList.map(x => x.toString(16).padStart(2, "0")).join(""));
};

//================================================================================================================================================================================//
