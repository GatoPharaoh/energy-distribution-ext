import { EditorPages, PowerOutageOptions, EnergyFlowCardExtConfig, EntityOptions } from '@/config';
import { dualValueNodeSchema, nodeConfigSchema } from '.';

export function gridSchema(config: EnergyFlowCardExtConfig | undefined): any[] {
  return nodeConfigSchema(config, config?.[EditorPages.Grid], dualValueNodeSchema(config, config?.[EditorPages.Grid]))
    .concat(
      {
        name: [PowerOutageOptions.Power_Outage],
        type: 'expandable',
        schema: [
          {
            name: EntityOptions.Entity_Id,
            selector: { entity: {} },
          },
          {
            type: 'grid',
            schema: [
              { name: [PowerOutageOptions.Alert_State], selector: { text: {} } },
              { name: [PowerOutageOptions.Alert_Icon], selector: { icon: {} } }
            ]
          },
        ]
      }
    );
}
