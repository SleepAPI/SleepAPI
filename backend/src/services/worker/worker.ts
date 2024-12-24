import { Worker } from 'worker_threads';

export async function runWorkerFile(workerFile: string, params: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(workerFile, {
      workerData: {
        params
      }
    });

    worker.on('message', (message) => {
      if (message.error) {
        reject(new Error(message.error));
      } else {
        resolve(message);
      }
    });

    worker.on('error', (err) => {
      reject(err);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}
