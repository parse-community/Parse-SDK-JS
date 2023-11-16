// @ts-nocheck
export function opFromJSON(json: {
    [key: string]: any;
}): Op | null;
export class Op {
    applyTo(value: mixed): mixed;
    mergeWith(previous: Op): Op | null;
    toJSON(): mixed;
}
export class SetOp extends Op {
    constructor(value: mixed);
    _value: mixed;
    applyTo(): mixed;
    mergeWith(): SetOp;
    toJSON(offline?: boolean): any;
}
export class UnsetOp extends Op {
    applyTo(): any;
    mergeWith(): UnsetOp;
    toJSON(): {
        __op: string;
    };
}
export class IncrementOp extends Op {
    constructor(amount: number);
    _amount: number;
    applyTo(value: mixed): number;
    toJSON(): {
        __op: string;
        amount: number;
    };
}
export class AddOp extends Op {
    constructor(value: mixed | Array<mixed>);
    _value: Array<mixed>;
    applyTo(value: mixed): Array<mixed>;
    toJSON(): {
        __op: string;
        objects: mixed;
    };
}
export class AddUniqueOp extends Op {
    constructor(value: mixed | Array<mixed>);
    _value: Array<mixed>;
    applyTo(value: mixed | Array<mixed>): Array<mixed>;
    toJSON(): {
        __op: string;
        objects: mixed;
    };
}
export class RemoveOp extends Op {
    constructor(value: mixed | Array<mixed>);
    _value: Array<mixed>;
    applyTo(value: mixed | Array<mixed>): Array<mixed>;
    toJSON(): {
        __op: string;
        objects: mixed;
    };
}
export class RelationOp extends Op {
    constructor(adds: Array<ParseObject | string>, removes: Array<ParseObject | string>);
    _targetClassName: string | null;
    relationsToAdd: Array<string>;
    relationsToRemove: Array<string>;
    _extractId(obj: string | ParseObject): string;
    applyTo(value: mixed, object?: {
        className: string;
        id: string | null;
    }, key?: string): ParseRelation | null;
    toJSON(): {
        __op?: string;
        objects?: mixed;
        ops?: mixed;
    };
}
import ParseObject from './ParseObject';
import ParseRelation from './ParseRelation';
