import { svg, TemplateResult } from "lit";
import { ColourOptions, EntitiesOptions, SingleValueNodeConfig, SolarConfig } from "@/config";
import { ColourMode } from "@/enums";

//================================================================================================================================================================================//

export const renderLine = (id: string, path: string, cssClass: string | undefined = undefined): TemplateResult => {
  return svg`
      <path id="${id}" class="${cssClass || id}" d="${path}" vector-effect="non-scaling-stroke"/>
      `;
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

export function setSingleValueNodeStyles(config: SingleValueNodeConfig, name: string, style: CSSStyleDeclaration): void {
  const customColour: string | undefined = convertColourListToHex(config?.[EntitiesOptions.Colours]?.[ColourOptions.Custom_Colour]);
  const circleColour: string = config?.[EntitiesOptions.Colours]?.[ColourOptions.Circle] === ColourMode.Custom && customColour ? customColour : `var(--energy-${name}-color)`;
  let textColour: string;
  let iconColour: string;

  switch (config?.[EntitiesOptions.Colours]?.[ColourOptions.Value]) {
    case ColourMode.Default:
      textColour = `var(--energy-${name}-color)`;
      break;

    case ColourMode.Circle:
      textColour = circleColour;
      break;

    case ColourMode.Custom:
      textColour = customColour ?? "var(--primary-text-color)";
      break;

    default:
      textColour = "var(--primary-text-color)";
      break;
  }

  switch (config?.[EntitiesOptions.Colours]?.[ColourOptions.Icon]) {
    case ColourMode.Default:
      iconColour = `var(--energy-${name}-color)`;
      break;

    case ColourMode.Circle:
      iconColour = circleColour;
      break;

    case ColourMode.Custom:
      iconColour = customColour ?? "var(--primary-text-color)";
      break;

    default:
      iconColour = name === "non-fossil" ? "var(--energy-non-fossil-color)" : "var(--primary-text-color)";
      break;
  }

  style.setProperty(`--text-${name}-color`, textColour);
  style.setProperty(`--icon-${name}-color`, iconColour);
  style.setProperty(`--circle-${name}-color`, circleColour);
}

//================================================================================================================================================================================//

const convertColourListToHex = (colourList: number[] | undefined = []): string | undefined => {
  if (colourList.length !== 3) {
    return undefined;
  }

  return "#".concat(colourList.map(x => x.toString(16).padStart(2, "0")).join(""));
};

//================================================================================================================================================================================//
