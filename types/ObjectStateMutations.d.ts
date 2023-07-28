// @ts-nocheck
export function defaultState(): State;
export function setServerData(serverData: AttributeMap, attributes: AttributeMap): void;
export function setPendingOp(pendingOps: Array<OpsMap>, attr: string, op: Op | null): void;
export function pushPendingState(pendingOps: Array<OpsMap>): void;
export function popPendingState(pendingOps: Array<OpsMap>): OpsMap;
export function mergeFirstPendingState(pendingOps: Array<OpsMap>): void;
export function estimateAttribute(serverData: AttributeMap, pendingOps: Array<OpsMap>, className: string, id: string | null, attr: string): mixed;
export function estimateAttributes(serverData: AttributeMap, pendingOps: Array<OpsMap>, className: string, id: string | null): AttributeMap;
export function commitServerChanges(serverData: AttributeMap, objectCache: ObjectCache, changes: AttributeMap): void;
type AttributeMap = {
    [attr: string]: any;
};
type OpsMap = {
    [attr: string]: Op;
};
type ObjectCache = {
    [attr: string]: string;
};
type State = {
    serverData: AttributeMap;
    pendingOps: OpsMap[];
    objectCache: ObjectCache;
    tasks: TaskQueue;
    existed: boolean;
};
import { Op } from './ParseOp';
export {};
