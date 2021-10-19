import Thread, { ThreadTask } from "./thread";

export default class ThreadPool {
  cores = navigator.hardwareConcurrency || 2; // number of physical cores on machine
  threads: Thread[] = [];
  poolQueue: ThreadTask[] = []; // used when all thread queues are full

  constructor() {
    for (let i = 0; i < this.cores; i++) {
      this.threads.push(new Thread());
    }
  }

  requestThread(task: ThreadTask): void {
    let openThread = this.threads[0];
    for (const t of this.threads) {
      if (t.isFree() && t.queueSize() < openThread.queueSize()) {
        openThread = t;
      }
    }

    if (openThread) {
      openThread.addTask(task);
    } else {
      this.poolQueue.push(task);
    }
  }
}
