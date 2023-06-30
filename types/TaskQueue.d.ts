/**
 * @flow
 */
import { resolvingPromise } from './promiseUtils';
type Task = {
    task: () => Promise<any>;
    _completion: resolvingPromise<Task>;
};
declare class TaskQueue {
    queue: Task[];
    constructor();
    enqueue(task: () => Promise<any>): Promise<any>;
    _dequeue(): void;
}
export default TaskQueue;
