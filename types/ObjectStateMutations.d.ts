import TaskQueue from './TaskQueue';
import type { Op } from './ParseOp';
import type ParseObject from './ParseObject';
export type AttributeMap = Record<string, any>;
export type OpsMap = Record<string, Op>;
export type ObjectCache = Record<string, string>;
export interface State {
    serverData: AttributeMap;
    pendingOps: OpsMap[];
    objectCache: ObjectCache;
    tasks: TaskQueue;
    existed: boolean;
}
export declare function defaultState(): State;
export declare function setServerData(serverData: AttributeMap, attributes: AttributeMap): void;
export declare function setPendingOp(pendingOps: OpsMap[], attr: string, op?: Op): void;
export declare function pushPendingState(pendingOps: OpsMap[]): void;
export declare function popPendingState(pendingOps: OpsMap[]): OpsMap;
export declare function mergeFirstPendingState(pendingOps: OpsMap[]): void;
export declare function estimateAttribute(serverData: AttributeMap, pendingOps: OpsMap[], object: ParseObject, attr: string): any;
export declare function estimateAttributes(serverData: AttributeMap, pendingOps: OpsMap[], object: ParseObject): AttributeMap;
export declare function commitServerChanges(serverData: AttributeMap, objectCache: ObjectCache, changes: AttributeMap): void;
