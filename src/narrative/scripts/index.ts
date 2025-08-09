// Narrative scripts facade: re-export the existing rule-based script engine
// This aligns architecture under `src/narrative` without moving files yet.

export * from '../../video/scripts/adapters';
export * from '../../video/scripts/templates';
export * from '../../video/scripts/types';

// Normalize ScriptGenerator export shape for consumers
import * as SGMod from '../../video/scripts/ScriptGenerator';
export const ScriptGenerator = ((SGMod as any).default?.ScriptGenerator ?? (SGMod as any).ScriptGenerator) as new (...args: any[]) => any;


