type Task = {
  task: () => Promise<void>;
  _completion: any;
};
declare class TaskQueue {
  queue: Array<Task>;
  constructor();
  enqueue(task: () => Promise<void>): Promise<void>;
  _dequeue(): void;
}
export default TaskQueue;
