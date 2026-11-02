import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import type { Car } from '../data/cars';

const draco = new DRACOLoader()
  .setDecoderPath(`${import.meta.env.BASE_URL}assets/draco/`)
  .setWorkerLimit(4);
const loader = new GLTFLoader().setDRACOLoader(draco).setMeshoptDecoder(MeshoptDecoder);
type Entry = { promise: Promise<GLTF>; value?: GLTF; error?: unknown; progress: number };
const cache = new Map<string, Entry>();
export function prepareModel(car: Car, onProgress?: (fraction: number) => void): Promise<GLTF> {
  const current = cache.get(car.modelFile);
  if (current) {
    onProgress?.(current.progress);
    return current.promise.then((model) => {
      onProgress?.(1);
      return model;
    });
  }
  const entry = { progress: 0 } as Entry;
  entry.promise = new Promise<GLTF>((resolve, reject) => {
    loader.load(
      `${import.meta.env.BASE_URL}assets/models/${car.modelFile}`,
      (value) => {
        entry.value = value;
        entry.progress = 1;
        onProgress?.(1);
        resolve(value);
      },
      (event) => {
        // Reserve the final 15% for parsing, texture decoding and geometry decoding.
        entry.progress = event.total ? Math.min(0.85, (event.loaded / event.total) * 0.85) : 0.2;
        onProgress?.(entry.progress);
      },
      (error) => {
        entry.error = error;
        reject(error);
      },
    );
  });
  cache.set(car.modelFile, entry);
  return entry.promise;
}
export function readModel(car: Car): GLTF {
  const entry = cache.get(car.modelFile);
  if (entry?.error) throw entry.error;
  if (entry?.value) return entry.value;
  throw prepareModel(car);
}
