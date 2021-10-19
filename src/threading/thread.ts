import { BLZ_Worker, WorkerMessage } from "./worker";

export interface ThreadTask {
  task: "chunk-generation" | "chunk-geometry";
  // priority: number;
  data: ArrayBuffer | Uint8Array | Uint16Array | Uint32Array | Float32Array | Float64Array;
}

export default class Thread {
  private worker: BLZ_Worker;
  private inUse = false;
  private queue: ThreadTask[] = [];
  private maxQueueSize = 5; // maximum size a thread's queue can be before main thread must be used

  private lastTryTime = 0;
  private retryTimeout = 100;

  constructor() {
    this.setupWorker();
  }

  private setupWorker() {
    this.worker = new Worker(
      new URL(process.env.NODE_ENV === "development" ? "worker.js" : "worker.ts", import.meta.url),
      { type: "module" }
    );
    this.worker.onmessage = (e) => this.handleMessage(e.data);
    this.worker.postMessage({ task: "get-status" });
  }

  private handleMessage(msg: WorkerMessage) {
    console.log(msg);
  }

  addTask(task: ThreadTask) {
    if (this.inUse && this.queue.length < this.maxQueueSize) {
      this.queue.push(task);
      return true;
    } else if (!this.inUse) {
      let chosen = task;
      if (this.queue.length > 0) {
        this.queue.push(task);
        chosen = this.queue.shift();
      }

      this.worker.postMessage(task);

      return true;
    }

    return false;
  }

  getInUse() {
    return this.inUse;
  }

  isFree() {
    return this.inUse || this.queue.length < this.maxQueueSize;
  }

  queueSize() {
    return this.queue.length;
  }
}
