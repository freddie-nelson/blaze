import { BLZ_Worker, WorkerMessage } from "./worker";

export type ThreadTaskData =
  | ArrayBuffer
  | Uint8Array
  | Uint16Array
  | Uint32Array
  | Float32Array
  | Float64Array;

export interface ThreadTaskDataObject {
  [index: string]: ThreadTaskData | ThreadTaskData[] | ThreadTaskDataObject;
}

export interface ThreadTask {
  task: "chunk-generation" | "init-chunk-generator" | "chunk-geometry" | "init-geometry-generator";
  // priority: number;
  data: ThreadTaskData | ThreadTaskData[] | ThreadTaskDataObject;
  cb?: (data?: any) => void;
}

export default class Thread {
  private worker: BLZ_Worker;
  private inUse = false;
  private currentTask: ThreadTask;
  private queue: ThreadTask[] = [];
  private maxQueueSize = 10; // maximum size a thread's queue can be before main thread must be used
  private id: string;
  private cleanRate = 100; // rate at which the queue is checked for hanging tasks that need to be executed in ms

  constructor(id: string) {
    this.id = id;

    this.setupWorker();
    this.clean();
  }

  private setupWorker() {
    this.worker = new Worker(
      new URL(process.env.NODE_ENV === "development" ? "worker.js" : "worker.ts", import.meta.url),
      { type: "module" }
    );
    this.worker.onmessage = (e) => this.handleMessage(e.data);
    this.worker.onerror = (e) => this.log(e);
    this.worker.onmessageerror = (e) => this.log(e);
  }

  private handleMessage(msg: WorkerMessage) {
    // this.log(msg);
    switch (msg.task) {
      case "completed":
        if (this.currentTask.cb) this.currentTask.cb(msg.data);
        this.nextTask();
        break;
      default:
        break;
    }
  }

  /**
   * Attempts to run or queue the task on the thread
   *
   * @param task
   * @param skipQueue if true then the max queue size is ignored and the task is prepended to the front of the queue
   * @returns true when the task is ran or queued, false otherwise
   */
  addTask(task: ThreadTask, skipQueue: boolean = false) {
    if (skipQueue) {
      if (this.inUse) this.queue.unshift(task);
      else {
        this.sendTask(task);
      }
      return true;
    }

    if (this.inUse && this.queue.length < this.maxQueueSize) {
      this.queue.push(task);
      return true;
    } else if (!this.inUse) {
      let chosen = task;
      if (this.queue.length > 0) {
        this.queue.push(task);
        chosen = this.queue.shift();
      }

      this.sendTask(chosen);

      return true;
    }

    return false;
  }

  private sendTask(task: ThreadTask) {
    this.currentTask = task;
    this.inUse = true;
    this.worker.postMessage({ task: task.task, data: task.data });
  }

  private nextTask() {
    if (this.queue.length === 0) {
      this.inUse = false;
      return;
    }

    this.sendTask(this.queue.shift());
  }

  private clean() {
    if (!this.inUse && this.queue.length > 0) {
      this.sendTask(this.queue.shift());
    }

    setTimeout(() => this.clean(), this.cleanRate);
  }

  getInUse() {
    return this.inUse;
  }

  /**
   * A thread is free when it is not in use or the queue size is below the thread's maximum queue size
   *
   * @returns true/false depending on if the thread is free
   */
  isFree() {
    return !this.inUse || this.queue.length < this.maxQueueSize;
  }

  queueSize() {
    return this.queue.length;
  }

  private log(...params: any) {
    console.log(`[${this.id}]:`, ...params);
  }
}
