import { AppearanceOptions, ColourOptions, DeviceOptions, EditorPages, EnergyUnitsOptions, EntitiesOptions, EntityOptions, FlowsOptions, GlobalOptions, HomeOptions, LowCarbonOptions, OverridesOptions, PowerOutageOptions, SecondaryInfoOptions } from "@/config";
import { ColourMode, DisplayMode, EnergyDirection, EnergyType, EnergyUnits, GasSourcesMode, InactiveFlowsMode, LowCarbonDisplayMode, Scale, UnitPosition, UnitPrefixes, VolumeUnits } from "@/enums";
import { HELPTEXT_SUFFIX } from "@/const";

export default {
  "common": {
    "initialising": "Initializing...",
    "loading": "Loading data...",
    "no_date_picker": "This display mode requires a Date Selector to be present in this View",
    "invalid_configuration": "Invalid configuration",
    "unknown": "Unknown",
    "new_device": "New Device",
    "power_outage": "Power outage",
    "go_to_dashboard": "Go to the {title} dashboard"
  },
  "editor": {
    // fallback to avoid displaying the key when 'undefined' is passed by accident
    "undefined": "",

    // used by devices-editor
    "add_device": "Add Device",
    "remove_device": "Remove Device",
    "go_back": "Go Back",
    "previous": "Previous",
    "next": "Next",

    // used by ui-editor
    "missing_entity": "Entity must be specified",
    "invalid_primary_entity": "is not an energy sensor of type Total or Total_Increasing",
    "invalid_secondary_entity": "is not of type Total or Total_Increasing",

    // used on the main display
    "low_carbon": "Low-carbon",

    [LowCarbonOptions.Low_Carbon_Mode]: "Display as",

    [OverridesOptions.Name]: "Name",
    [OverridesOptions.Name + HELPTEXT_SUFFIX]: "Overrides the built-in name",
    [OverridesOptions.Icon]: "Icon",
    [OverridesOptions.Icon + HELPTEXT_SUFFIX]: "Overrides the built-in icon",

    [GlobalOptions.Title]: "Title",
    [GlobalOptions.Display_Mode]: "Display mode",
    [GlobalOptions.Display_Mode + HELPTEXT_SUFFIX]: "History and Hybrid modes require an energy-date-selection card to be present in the View",
    [GlobalOptions.Use_HASS_Config]: "Use the Energy Dashboard configuration",
    [GlobalOptions.Use_HASS_Config + HELPTEXT_SUFFIX]: "If enabled, the entities defined for the Energy Dashboard will be displayed",
    [GlobalOptions.Options]: "Options",

    [EditorPages.Appearance]: "Appearance",
    [EditorPages.Battery]: "Battery",
    [EditorPages.Devices]: "Devices",
    [EditorPages.Gas]: "Gas",
    [EditorPages.Grid]: "Grid",
    [EditorPages.Home]: "Home",
    [EditorPages.Low_Carbon]: "Low-Carbon Energy",
    [EditorPages.Solar]: "Solar",

    [AppearanceOptions.Dashboard_Link]: "Dashboard link",
    [AppearanceOptions.Dashboard_Link_Label]: "Dashboard link label",
    [AppearanceOptions.Show_Zero_States]: "Show zero states",
    [AppearanceOptions.Clickable_Entities]: "Clickable entities",
    [AppearanceOptions.Segment_Gaps]: "Show gaps between circle segments",
    [AppearanceOptions.Use_HASS_Style]: "Use HASS-style layout and colors",
    [AppearanceOptions.Flows]: "Flows",
    [AppearanceOptions.Energy_Units]: "Energy Units",

    [FlowsOptions.Use_Hourly_Stats]: "Use hourly statistics",
    [FlowsOptions.Use_Hourly_Stats + HELPTEXT_SUFFIX]: "Hourly statistics are more precise, but may take longer to calculate",
    [FlowsOptions.Inactive_Flows]: "Inactive flows",
    [FlowsOptions.Scale]: "Scale",
    [FlowsOptions.Animation]: "Animation",

    [EnergyUnitsOptions.Electric_Units]: "Electric units",
    [EnergyUnitsOptions.Electric_Unit_Prefixes]: "Electric unit prefixes",
    [EnergyUnitsOptions.Gas_Units]: "Gas units",
    [EnergyUnitsOptions.Gas_Unit_Prefixes]: "Gas unit prefixes",
    [EnergyUnitsOptions.Gas_Calorific_Value]: "Gas calorific value",
    [EnergyUnitsOptions.Gas_Calorific_Value + HELPTEXT_SUFFIX]: "This can be found on your gas statement and can change from time to time",
    [EnergyUnitsOptions.Prefix_Threshold]: "Prefix threshold",
    [EnergyUnitsOptions.Display_Precision_Under_10]: "Display precision (<10)",
    [EnergyUnitsOptions.Display_Precision_Under_100]: "Display precision (<100)",
    [EnergyUnitsOptions.Display_Precision_Default]: "Display precision (100+)",

    [EntityOptions.Entity_Id]: "",
    [EntityOptions.Entity_Ids]: "",

    [EntitiesOptions.Overrides]: "Overrides",
    [EntitiesOptions.Entities]: "Entities",
    [EntitiesOptions.Import_Entities]: "Import Entities",
    [EntitiesOptions.Export_Entities]: "Export Entities",
    [EntitiesOptions.Colours]: "Colors",
    [EntitiesOptions.Secondary_Info]: "Secondary Info",

    [PowerOutageOptions.Power_Outage]: "Power Outage",
    [PowerOutageOptions.Alert_State]: "State of alert",
    [PowerOutageOptions.Alert_State + HELPTEXT_SUFFIX]: "The entity state which indicates an outage",
    [PowerOutageOptions.Alert_Icon]: "Override icon",

    [HomeOptions.Gas_Sources]: "Show gas sources",
    [HomeOptions.Gas_Sources_Threshold]: "Threshold (%)",
    [HomeOptions.Gas_Sources_Threshold + HELPTEXT_SUFFIX]: "If gas usage is below this, add it to the total; otherwise display it separately",
    [HomeOptions.Subtract_Consumers]: "Subtract consuming devices from totals",

    [DeviceOptions.Energy_Type]: "Type",
    [DeviceOptions.Energy_Direction]: "Direction",
    [DeviceOptions.Name]: "Name",
    [DeviceOptions.Icon]: "Icon",

    [EnergyType.Electric]: "Electric",

    [ColourOptions.Circle_Colour]: "Circle color",
    [ColourOptions.Flow_Colour]: "Flow color",
    [ColourOptions.Flow_Export_Colour]: "Export color",
    [ColourOptions.Flow_Import_Colour]: "Import color",
    [ColourOptions.Icon_Colour]: "Icon color",
    [ColourOptions.Secondary_Colour]: "Secondary value color",
    [ColourOptions.Value_Colour]: "Value color",
    [ColourOptions.Value_Export_Colour]: "Export color",
    [ColourOptions.Value_Import_Colour]: "Import color",
    [ColourOptions.Circle]: "Circle",
    [ColourOptions.Flow]: "Flow",
    [ColourOptions.Flow_Export]: "Export flow",
    [ColourOptions.Flow_Import]: "Import flow",
    [ColourOptions.Icon]: "Icon",
    [ColourOptions.Secondary]: "Secondary value",
    [ColourOptions.Value]: "Value",
    [ColourOptions.Value_Export]: "Export value",
    [ColourOptions.Value_Import]: "Import value",

    [SecondaryInfoOptions.Icon]: "Icon",
    [SecondaryInfoOptions.Unit_Position]: "Show units",
    [SecondaryInfoOptions.Units]: "Override units",
    [SecondaryInfoOptions.Display_Precision]: "Override display precision",
  },
  "DisplayMode": {
    [DisplayMode.Today]: "Today",
    [DisplayMode.History]: "History",
    [DisplayMode.Hybrid]: "Hybrid"
  },
  "ColourMode": {
    [ColourMode.Do_Not_Colour]: "Do not color",
    [ColourMode.Flow]: "Same as flow",
    [ColourMode.Larger_Value]: "Larger value",
    [ColourMode.Largest_Value]: "Largest value",
    [ColourMode.Import]: "Import",
    [ColourMode.Export]: "Export",
    [ColourMode.Dynamic]: "Color dynamically",
    [ColourMode.Solar]: "Solar",
    [ColourMode.High_Carbon]: "High-carbon",
    [ColourMode.Low_Carbon]: "Low-carbon",
    [ColourMode.Battery]: "Battery",
    [ColourMode.Gas]: "Gas",
    [ColourMode.Custom]: "Custom",
    [ColourMode.Default]: "Default"
  },
  "LowCarbonDisplayMode": {
    [LowCarbonDisplayMode.Energy]: "Energy",
    [LowCarbonDisplayMode.Percentage]: "Percentage",
    [LowCarbonDisplayMode.Both]: "Both"
  },
  "InactiveFlowsMode": {
    [InactiveFlowsMode.Normal]: "Normal colors",
    [InactiveFlowsMode.Dimmed]: "Dimmed colors",
    [InactiveFlowsMode.Greyed]: "Greyed-out"
  },
  "UnitPrefixes": {
    [UnitPrefixes.Unified]: "Unified",
    [UnitPrefixes.Individual]: "Individual"
  },
  "UnitPosition": {
    [UnitPosition.After]: "After value",
    [UnitPosition.Before]: "Before value",
    [UnitPosition.After_Space]: "After value (with space)",
    [UnitPosition.Before_Space]: "Before value (with space)",
    [UnitPosition.Hidden]: "Hidden"
  },
  "GasSourcesMode": {
    [GasSourcesMode.Do_Not_Show]: "Do not show",
    [GasSourcesMode.Add_To_Total]: "Add to the total",
    [GasSourcesMode.Show_Separately]: "Show as separate total",
    [GasSourcesMode.Automatic]: "Automatic"
  },
  "EnergyType": {
    [EnergyType.Electric]: "Electric",
    [EnergyType.Gas]: "Gas"
  },
  "EnergyDirection": {
    [EnergyDirection.Source]: "Source",
    [EnergyDirection.Consumer]: "Consumer",
    [EnergyDirection.Both]: "Both"
  },
  "Scale": {
    [Scale.Linear]: "Linear",
    [Scale.Logarithmic]: "Logarithmic"
  },
  "EnergyUnits": {
    [EnergyUnits.WattHours]: "Watt hours",
    [EnergyUnits.Joules]: "Joules",
    [EnergyUnits.Calories]: "Calories"
  },
  "VolumeUnits": {
    [VolumeUnits.Same_As_Electric]: "Same as electric",
    [VolumeUnits.Cubic_Feet]: "Cubic feet",
    [VolumeUnits.Cubic_Metres]: "Cubic meters",
    [VolumeUnits.CCF]: "CCF",
    [VolumeUnits.MCF]: "MCF",
    [VolumeUnits.Litres]: "Liters"
  }
};
