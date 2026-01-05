import { EditorPages, EnergyFlowCardExtConfig } from '@/config';
import { nodeConfigSchema, singleValueNodeSchema } from '.';
import { GAS_ENTITY_CLASSES } from '@/const';

export function gasSchema(config: EnergyFlowCardExtConfig | undefined): any[] {
  return nodeConfigSchema(config, config?.[EditorPages.Gas], singleValueNodeSchema(config, config?.[EditorPages.Gas], GAS_ENTITY_CLASSES));
}
