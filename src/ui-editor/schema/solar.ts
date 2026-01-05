import { EditorPages, EnergyFlowCardExtConfig } from '@/config';
import { nodeConfigSchema, singleValueNodeSchema } from '.';
import { ELECTRIC_ENTITY_CLASSES } from '@/const';

export function solarSchema(config: EnergyFlowCardExtConfig | undefined): any[] {
  return nodeConfigSchema(config, config?.[EditorPages.Solar], singleValueNodeSchema(config, config?.[EditorPages.Solar], ELECTRIC_ENTITY_CLASSES, true));
}
