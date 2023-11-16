export function getState(obj: ObjectIdentifier): State | null;
export function initializeState(obj: ObjectIdentifier, initial?: State): State;
export function removeState(obj: ObjectIdentifier): State | null;
export function getServerData(obj: ObjectIdentifier): AttributeMap;
export function setServerData(obj: ObjectIdentifier, attributes: AttributeMap): void;
export function getPendingOps(obj: ObjectIdentifier): Array<OpsMap>;
export function setPendingOp(obj: ObjectIdentifier, attr: string, op: Op | null): void;
export function pushPendingState(obj: ObjectIdentifier): void;
export function popPendingState(obj: ObjectIdentifier): OpsMap;
export function mergeFirstPendingState(obj: ObjectIdentifier): void;
export function getObjectCache(obj: ObjectIdentifier): ObjectCache;
export function estimateAttribute(obj: ObjectIdentifier, attr: string): mixed;
export function estimateAttributes(obj: ObjectIdentifier): AttributeMap;
export function commitServerChanges(obj: ObjectIdentifier, changes: AttributeMap): void;
export function enqueueTask(obj: ObjectIdentifier, task: () => Promise): Promise<any>;
export function clearAllState(): void;
export function duplicateState(source: {
    id: string;
}, dest: {
    id: string;
}): void;
type ObjectIdentifier = {
    className: string;
    id: string;
};
import { State } from './ObjectStateMutations';
import { AttributeMap } from './ObjectStateMutations';
import { OpsMap } from './ObjectStateMutations';
import { Op } from './ParseOp';
import { ObjectCache } from './ObjectStateMutations';
export {};
