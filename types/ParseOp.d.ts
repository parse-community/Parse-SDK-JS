import type ParseObject from './ParseObject';
import ParseRelation from './ParseRelation';
export declare function opFromJSON(json: {
    [key: string]: any;
}): Op | null;
export declare class Op {
    applyTo(value: any): any;
    mergeWith(previous: Op): Op | void;
    toJSON(offline?: boolean): any;
}
export declare class SetOp extends Op {
    _value: any;
    constructor(value: any);
    applyTo(): any;
    mergeWith(): SetOp;
    toJSON(offline?: boolean): any;
}
export declare class UnsetOp extends Op {
    applyTo(): any;
    mergeWith(): UnsetOp;
    toJSON(): {
        __op: string;
    };
}
export declare class IncrementOp extends Op {
    _amount: number;
    constructor(amount: number);
    applyTo(value: any): number;
    mergeWith(previous: Op): Op;
    toJSON(): {
        __op: string;
        amount: number;
    };
}
export declare class AddOp extends Op {
    _value: Array<any>;
    constructor(value: any | Array<any>);
    applyTo(value: any): Array<any>;
    mergeWith(previous: Op): Op;
    toJSON(): {
        __op: string;
        objects: any;
    };
}
export declare class AddUniqueOp extends Op {
    _value: Array<any>;
    constructor(value: any | Array<any>);
    applyTo(value: any | Array<any>): Array<any>;
    mergeWith(previous: Op): Op;
    toJSON(): {
        __op: string;
        objects: any;
    };
}
export declare class RemoveOp extends Op {
    _value: Array<any>;
    constructor(value: any | Array<any>);
    applyTo(value: any | Array<any>): Array<any>;
    mergeWith(previous: Op): Op;
    toJSON(): {
        __op: string;
        objects: any;
    };
}
export declare class RelationOp extends Op {
    _targetClassName: string | null;
    relationsToAdd: Array<string>;
    relationsToRemove: Array<string>;
    constructor(adds: Array<ParseObject | string>, removes: Array<ParseObject | string>);
    _extractId(obj: string | ParseObject): string;
    applyTo(value: any, parent?: ParseObject, key?: string): ParseRelation;
    mergeWith(previous: Op): Op;
    toJSON(): {
        __op?: string;
        objects?: any;
        ops?: any;
    };
}
