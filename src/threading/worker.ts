export interface WorkerMessage {
  task: "chunk-generation" | "chunk-geometry" | "get-status" | "drop-task";
  data?: any;
}

export interface BLZ_Worker extends Worker {
  postMessage: (data: WorkerMessage) => void;
  onmessage: (e: { data: WorkerMessage }) => void;
}

const ctx: BLZ_Worker = <any>self;

class BlazeWorker {
  private busy = false;

  constructor() {}

  handleTask(task: WorkerMessage) {
    if (this.busy) {
      ctx.postMessage({ task: "drop-task" });
      return;
    }

    console.log(task);
  }

  handleMessage(msg: WorkerMessage) {
    switch (msg.task) {
      case "get-status":
        const status = this.busy ? "busy" : "free";
        ctx.postMessage({ task: msg.task, data: status });
        break;
      case "chunk-generation":
      case "chunk-geometry":
        if (msg.data) this.handleTask(msg);
        else ctx.postMessage({ task: "drop-task" });
        break;
      default:
        break;
    }
  }
}

const worker = new BlazeWorker();
ctx.onmessage = (e) => {
  worker.handleMessage(e.data as WorkerMessage);
};
