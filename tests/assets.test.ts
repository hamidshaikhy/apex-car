import { beforeAll, describe, expect, it } from 'vitest';
import { stat } from 'node:fs/promises';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import draco from 'draco3dgltf';
import vehicles from '../src/data/vehicles.json';
let io: NodeIO;
beforeAll(async () => {
  io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
    'draco3d.decoder': await draco.createDecoderModule(),
    'meshopt.decoder': MeshoptDecoder,
  });
});
const expectedTriangles: Record<string, number> = {
  revuelto: 402370,
  mustang: 349291,
  amg: 930262,
  bmw: 206593,
  senna: 407593,
  gtr: 279787,
  porsche: 116367,
  audi: 295882,
  challenger: 652216,
  tourbillon: 368061,
  one77: 188540,
  ghost: 765829,
};
describe('Full-detail showroom models', () => {
  for (const car of vehicles) {
    it(`${car.name}: decodes all original triangles and has independently recolorable body paint`, async () => {
      const file = `public/assets/models/${car.modelFile}`;
      expect((await stat(file)).size).toBeLessThan(60_000_000);
      const model = await io.read(file);
      let paintPrimitives = 0,
        triangles = 0;
      for (const mesh of model.getRoot().listMeshes())
        for (const primitive of mesh.listPrimitives()) {
          triangles +=
            (primitive.getIndices()?.getCount() || primitive.getAttribute('POSITION')!.getCount()) /
            3;
          if (car.paintMaterials.includes(primitive.getMaterial()?.getName() || ''))
            paintPrimitives++;
          expect(primitive.getAttribute('POSITION')!.getArray()!.length).toBeGreaterThan(0);
        }
      expect(paintPrimitives).toBeGreaterThan(0);
      expect(triangles).toBe(expectedTriangles[car.id]);
    }, 30000);
  }
});
describe('Collection integrity', () => {
  it('new campaign images and local Draco decoders are bundled', async () => {
    for (const car of vehicles)
      expect((await stat(`public/${car.image}`)).size).toBeGreaterThan(100_000);
    for (const decoder of ['draco_decoder.wasm', 'draco_wasm_wrapper.js'])
      expect((await stat(`public/assets/draco/${decoder}`)).size).toBeGreaterThan(10_000);
  });
  it('specifications retain their trim identities, sources and measurement bases', () => {
    for (const car of vehicles) {
      expect(car.sources.length).toBeGreaterThan(0);
      expect(car.specNote.length).toBeGreaterThan(60);
      expect(car.colors).toHaveLength(3);
      expect(new Set(car.colors.map((color) => color.name)).size).toBe(3);
      expect(new Set(car.colors.map((color) => color.hex)).size).toBe(3);
      expect(car.weight.length).toBeGreaterThan(5);
      expect(car.name).toMatch(/[A-Za-z]/);
      expect(JSON.stringify(car)).not.toMatch(/[۰-۹٠-٩]/);
      expect(car.sources.every((s) => s.url.startsWith('https://'))).toBe(true);
    }
    expect(vehicles).toHaveLength(12);
    expect(vehicles.find((c) => c.id === 'mustang')!.acceleration.label).toMatch(/60.*mph/i);
    expect(vehicles.find((c) => c.id === 'amg')!.model).toBe('AMG GT S');
    expect(vehicles.find((c) => c.id === 'bmw')!.model).toBe('M4 Competition');
  });
});
