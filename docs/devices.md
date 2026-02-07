#### Devices options section
| Name | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | `New Device` | The name for the device |
| `icon` | `string` | `mdi:devices` | The icon for the device |
| `energy_type` | `electric | gas` | **required** | The type of the device |
| `energy_direction` | `consumer | producer | both` | **required** | Whether the device acts as a consumer of energy/power, a producer or both |
| `import_entities` | | | [Entities settings section](#entities-settings-section) (`energy` mode only) |
| `export_entities` | | | [Entities settings section](#entities-settings-section) (`energy` mode only) |
| `power_entities` | | | [Entities settings section](#entities-settings-section) (`power` mode only) |
| `colours` | | | [Device colours section](#device-colours-section) |
| `secondary_info` | | | [Secondary-info settings section](secondary-info.md) |
