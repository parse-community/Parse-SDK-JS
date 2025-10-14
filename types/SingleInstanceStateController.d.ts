import type { Op } from "./ParseOp";
import type ParseObject from "./ParseObject";
import type { AttributeMap, ObjectCache, OpsMap, State } from "./ObjectStateMutations";
export declare function getState(obj: ParseObject): State | null;
export declare function initializeState(obj: ParseObject, initial?: State): State;
export declare function removeState(obj: ParseObject): State | null;
export declare function getServerData(obj: ParseObject): AttributeMap;
export declare function setServerData(obj: ParseObject, attributes: AttributeMap): void;
export declare function getPendingOps(obj: ParseObject): OpsMap[];
export declare function setPendingOp(obj: ParseObject, attr: string, op?: Op): void;
export declare function pushPendingState(obj: ParseObject): void;
export declare function popPendingState(obj: ParseObject): OpsMap;
export declare function mergeFirstPendingState(obj: ParseObject): void;
export declare function getObjectCache(obj: ParseObject): ObjectCache;
export declare function estimateAttribute(obj: ParseObject, attr: string): any;
export declare function estimateAttributes(obj: ParseObject): AttributeMap;
export declare function commitServerChanges(obj: ParseObject, changes: AttributeMap): void;
export declare function enqueueTask(obj: ParseObject, task: () => Promise<any>): Promise<void>;
export declare function clearAllState(): void;
export declare function duplicateState(source: {
    id: string;
}, dest: {
    id: string;
}): void;
