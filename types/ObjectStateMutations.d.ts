import TaskQueue from './TaskQueue';
import type { Op } from './ParseOp';
import type ParseObject from './ParseObject';
export type AttributeMap = {
    [attr: string]: any;
};
export type OpsMap = {
    [attr: string]: Op;
};
export type ObjectCache = {
    [attr: string]: string;
};
export type State = {
    serverData: AttributeMap;
    pendingOps: Array<OpsMap>;
    objectCache: ObjectCache;
    tasks: TaskQueue;
    existed: boolean;
};
export declare function defaultState(): State;
export declare function setServerData(serverData: AttributeMap, attributes: AttributeMap): void;
export declare function setPendingOp(pendingOps: Array<OpsMap>, attr: string, op?: Op): void;
export declare function pushPendingState(pendingOps: Array<OpsMap>): void;
export declare function popPendingState(pendingOps: Array<OpsMap>): OpsMap;
export declare function mergeFirstPendingState(pendingOps: Array<OpsMap>): void;
export declare function estimateAttribute(serverData: AttributeMap, pendingOps: Array<OpsMap>, object: ParseObject, attr: string): any;
export declare function estimateAttributes(serverData: AttributeMap, pendingOps: Array<OpsMap>, object: ParseObject): AttributeMap;
export declare function commitServerChanges(serverData: AttributeMap, objectCache: ObjectCache, changes: AttributeMap): void;
