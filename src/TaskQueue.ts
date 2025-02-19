import { resolvingPromise } from './promiseUtils';

type Task = {
  task: () => Promise<void>;
  _completion: any;
};

class TaskQueue {
  queue: Array<Task>;

  constructor() {
    this.queue = [];
  }

  enqueue(task: () => Promise<void>): Promise<void> {
    const taskComplete = resolvingPromise<void>();
    this.queue.push({
      task: task,
      _completion: taskComplete,
    });
    if (this.queue.length === 1) {
      task().then(
        () => {
          this._dequeue();
          taskComplete.resolve();
        },
        error => {
          this._dequeue();
          taskComplete.reject(error);
        }
      );
    }
    return taskComplete;
  }

  _dequeue() {
    this.queue.shift();
    if (this.queue.length) {
      const next = this.queue[0];
      next.task().then(
        () => {
          this._dequeue();
          next._completion.resolve();
        },
        error => {
          this._dequeue();
          next._completion.reject(error);
        }
      );
    }
  }
}

export default TaskQueue;
