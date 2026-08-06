// src/lib/withTimeout.ts
export class TimeoutError extends Error {
  constructor(ms: number) {
    super(`Operasi melebihi batas ${ms}ms`);
    this.name = "TimeoutError";
  }
}

// Balapkan promise asli vs timer. Siapa selesai duluan, itu yang menang.
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new TimeoutError(ms)), ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}
