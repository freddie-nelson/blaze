import GeometryGenerator from "../chunk/geometry";
import { Neighbours } from "../voxel";
import { ThreadTaskData, ThreadTaskDataObject } from "./thread";

export interface WorkerMessage {
  task:
    | "chunk-generation"
    | "init-chunk-generator"
    | "chunk-geometry"
    | "init-geometry-generator"
    | "completed";
  data?: ThreadTaskData | ThreadTaskData[] | ThreadTaskDataObject;
}

export interface BLZ_Worker extends Worker {
  postMessage: (data: WorkerMessage) => void;
  onmessage: (e: { data: WorkerMessage }) => void;
}

const ctx: BLZ_Worker = <any>self;

class BlazeWorker {
  geometryGenerator: GeometryGenerator;

  constructor() {}

  handleTask(task: WorkerMessage) {
    let data;
    switch (task.task) {
      case "init-geometry-generator":
        this.geometryGenerator = new GeometryGenerator({
          chunkSize: (task.data as Uint16Array)[0],
          chunkHeight: (task.data as Uint16Array)[1],
        });
        break;
      case "chunk-geometry":
        if (this.geometryGenerator) data = this.chunkGeometry(task.data as any);
        else
          throw new Error(
            "Worker: 'init-geometry-generator' must be executed at least once on a worker before 'chunk-geometry' can be executed."
          );
        break;
    }

    ctx.postMessage({ task: "completed", data });
  }

  handleMessage(msg: WorkerMessage) {
    switch (msg.task) {
      case "init-chunk-generator":
      case "init-geometry-generator":
      case "chunk-generation":
      case "chunk-geometry":
        if (msg.data) this.handleTask(msg);
        else throw new Error("Worker: Message must include data for chunk-generation and chunk-geometry.");
        break;
      default:
        break;
    }
  }

  chunkGeometry(data: { chunk: Uint8Array; neighbours: Neighbours<Uint8Array> }) {
    return this.geometryGenerator.convertGeoToTypedArrs(
      this.geometryGenerator.generateChunkGeometry(data.chunk, data.neighbours)
    );
  }
}

const worker = new BlazeWorker();
ctx.onmessage = (e) => {
  worker.handleMessage(e.data as WorkerMessage);
};
