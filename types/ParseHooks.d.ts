export type HookDeclaration = {
    functionName: string;
    url: string;
} | {
    className: string;
    triggerName: string;
    url: string;
};
export type HookDeleteArg = {
    functionName: string;
} | {
    className: string;
    triggerName: string;
};
export declare function getFunctions(): Promise<any>;
export declare function getTriggers(): Promise<any>;
export declare function getFunction(name: string): Promise<any>;
export declare function getTrigger(className: string, triggerName: string): Promise<any>;
export declare function createFunction(functionName: string, url: string): Promise<any>;
export declare function createTrigger(className: string, triggerName: string, url: string): Promise<any>;
export declare function create(hook: HookDeclaration): Promise<any>;
export declare function updateFunction(functionName: string, url: string): Promise<any>;
export declare function updateTrigger(className: string, triggerName: string, url: string): Promise<any>;
export declare function update(hook: HookDeclaration): Promise<any>;
export declare function removeFunction(functionName: string): Promise<any>;
export declare function removeTrigger(className: string, triggerName: string): Promise<any>;
export declare function remove(hook: HookDeleteArg): Promise<any>;
