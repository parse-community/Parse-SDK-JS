export function getState(obj: ParseObject): State | null;
export function initializeState(obj: ParseObject, initial?: State): State;
export function removeState(obj: ParseObject): State | null;
export function getServerData(obj: ParseObject): AttributeMap;
export function setServerData(obj: ParseObject, attributes: AttributeMap): void;
export function getPendingOps(obj: ParseObject): Array<OpsMap>;
export function setPendingOp(obj: ParseObject, attr: string, op: Op | null): void;
export function pushPendingState(obj: ParseObject): void;
export function popPendingState(obj: ParseObject): OpsMap;
export function mergeFirstPendingState(obj: ParseObject): void;
export function getObjectCache(obj: ParseObject): ObjectCache;
export function estimateAttribute(obj: ParseObject, attr: string): mixed;
export function estimateAttributes(obj: ParseObject): AttributeMap;
export function commitServerChanges(obj: ParseObject, changes: AttributeMap): void;
export function enqueueTask(obj: ParseObject, task: () => Promise): Promise<any>;
export function duplicateState(source: ParseObject, dest: ParseObject): void;
export function clearAllState(): void;
import ParseObject from './ParseObject';
import { State } from './ObjectStateMutations';
import { AttributeMap } from './ObjectStateMutations';
import { OpsMap } from './ObjectStateMutations';
import { Op } from './ParseOp';
import { ObjectCache } from './ObjectStateMutations';
