import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, OrbitControls, Lightformer, MeshReflectorMaterial } from '@react-three/drei';
import { EffectComposer, N8AO, Bloom, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import {
  ACESFilmicToneMapping,
  Box3,
  Color,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  SRGBColorSpace,
  Vector3,
} from 'three';
import type { ComponentRef } from 'react';
import type { Object3D } from 'three';
import type { Car } from '../data/cars';
import { readModel } from '../lib/models';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

type Props = {
  car: Car;
  color: string;
  lighting: 'studio' | 'day';
  autoRotate: boolean;
  angle: number;
  quality: 'auto' | 'high' | 'low';
  onReady: () => void;
  onProgress?: (value: number) => void;
  zoom?: number;
};
function visibleBounds(root: Object3D) {
  const bounds = new Box3();
  root.traverseVisible((node) => {
    if (
      node instanceof Mesh &&
      (Array.isArray(node.material) ? node.material : [node.material]).some(
        (material) => material.opacity > 0.01,
      )
    )
      bounds.expandByObject(node);
  });
  return bounds;
}
function Vehicle({ car, color }: { car: Car; color: string }) {
  const gltf = readModel(car);
  const target = useMemo(() => new Color(color), [color]);
  const invalidate = useThree((s) => s.invalidate);
  const object = useMemo(() => {
    const root = gltf.scene.clone(true);
    const materials = new Map<string, MeshStandardMaterial>();
    root.traverse((node) => {
      if (!(node instanceof Mesh)) return;
      node.castShadow = true;
      node.receiveShadow = true;
      const prepare = (original: MeshStandardMaterial) => {
        const redLens = /red_glass|^rrghost_glass_b$/i.test(original.name);
        const rearLed = car.id === 'senna' && /taillight/i.test(node.name);
        const lampLens =
          /(?:head|tail|rear|front).*light.*glass|(?:head|tail).*glass|glass.*light/i.test(
            node.name,
          ) ||
          redLens ||
          (car.id === 'challenger' && original.name === 'Material__296') ||
          (car.id === 'senna' &&
            original.name === 'senna_glass' &&
            !/windshield|doorglass|trunklid|dash/i.test(node.name)) ||
          (car.id === 'porsche' &&
            original.name === 'GLASS_7' &&
            new Box3().setFromObject(node).getSize(new Vector3()).y < 11);
        const materialKey =
          original.uuid + (lampLens ? ':lens' : rearLed ? ':rear-led' : ':surface');
        if (materials.has(materialKey)) return materials.get(materialKey)!;
        let mat: MeshStandardMaterial;
        if (car.paintMaterials.includes(original.name)) {
          const paint = new MeshPhysicalMaterial();
          MeshStandardMaterial.prototype.copy.call(paint, original);
          paint.name = original.name;
          paint.map = null;
          paint.metalnessMap = null;
          paint.roughnessMap = null;
          paint.emissiveMap = null;
          paint.emissive.set('#000000');
          paint.vertexColors = false;
          if (/crbn|carbon/i.test(original.name)) paint.normalMap = null;
          paint.color.set(car.colors[0].hex);
          paint.metalness = 0.52;
          paint.roughness = 0.29;
          paint.clearcoat = 1;
          paint.clearcoatRoughness = 0.14;
          paint.envMapIntensity = 1;
          mat = paint;
        } else {
          mat = original.clone();
          if (mat instanceof MeshPhysicalMaterial) {
            mat.clearcoat = Math.min(1, Math.max(0, mat.clearcoat));
            mat.clearcoatRoughness = Math.max(0.08, mat.clearcoatRoughness);
          }
          const name = mat.name.toLowerCase();
          if (/tire|tyre|pneu/.test(name) || car.rubberMaterials?.includes(original.name)) {
            mat.color.set('#1e2020');
            mat.metalness = 0;
            mat.roughness = 0.88;
          }
          const isGlass =
            (/glass|window/.test(name) && !/red|tail|light/.test(name)) ||
            car.glassMaterials?.includes(original.name) ||
            (car.id === 'revuelto' &&
              ['Material.074', 'Material.086', 'Material.087'].includes(original.name));
          if (lampLens) {
            mat = new MeshPhysicalMaterial({
              name: original.name,
              color: redLens ? '#840611' : '#dfe7ed',
              metalness: 0,
              roughness: 0.08,
              transparent: true,
              opacity: redLens ? 0.4 : 0.12,
              depthWrite: false,
              envMapIntensity: 0.25,
              clearcoat: 1,
              clearcoatRoughness: 0.09,
              emissive: redLens ? '#df0820' : '#000000',
              emissiveIntensity: redLens ? 0.55 : 0,
            });
          } else if (isGlass) {
            mat = new MeshPhysicalMaterial({
              name: original.name,
              color: '#121c23',
              metalness: 0,
              roughness: 0.17,
              clearcoat: 0.35,
              clearcoatRoughness: 0.18,
              envMapIntensity: 0.32,
              transparent: true,
              opacity: 0.88,
              depthWrite: false,
              transmission: 0.08,
              thickness: 0.06,
              ior: 1.5,
            });
          }
          if (/chrome|mirror/.test(name)) {
            mat.metalness = 1;
            mat.roughness = 0.18;
          }
          if (/leather|seat|interior/.test(name)) {
            mat.color.set('#252a29');
            mat.metalness = 0;
            mat.roughness = Math.max(0.55, mat.roughness);
          }
          if (/crbn|carbon/.test(name)) {
            mat.color.set('#151a1c');
            mat.metalness = 0.08;
            mat.roughness = 0.35;
            mat.envMapIntensity = 0.7;
          }
          if (car.id === 'senna' && /raceparts|blacksenna/.test(name)) {
            mat.color.set('#14191a');
            mat.metalness = 0.2;
            mat.roughness = 0.38;
            mat.envMapIntensity = 0.6;
          }
          if (car.id === 'senna' && name === 'euansenna_headlight' && rearLed) {
            mat.color.set('#76020b');
            mat.emissive.set('#ee0820');
            mat.emissiveIntensity = 0.8;
            mat.metalness = 0.05;
            mat.roughness = 0.2;
          }
          if (car.id === 'mustang') {
            if (/glossblack|roll/.test(name)) {
              mat.color.set('#151917');
              mat.metalness = 0.25;
              mat.roughness = 0.3;
            }
            if (name === 'rearlight') {
              mat.color.set('#690209');
              mat.emissive.set('#e50919');
              mat.emissiveIntensity = 0.65;
              mat.metalness = 0.05;
              mat.roughness = 0.24;
            } else if (name === 'light') {
              mat.color.set('#aabdc6');
              mat.emissive.set('#d9e8f4');
              mat.emissiveIntensity = 0.28;
              mat.metalness = 0.1;
              mat.roughness = 0.19;
            }
            if (name === 'plate') {
              mat.color.set('#41474b');
              mat.metalness = 1;
              mat.roughness = 0.33;
              mat.envMapIntensity = 0.5;
            }
            if (name === 'lambert1') {
              mat.color.set('#303635');
              mat.metalness = 0.8;
              mat.roughness = 0.25;
            }
          }
          if (car.id === 'gtr') {
            if (name === 'r35_highbeam') {
              mat.color.set('#e3ebf1');
              mat.emissive.set('#c3e0fa');
              mat.emissiveMap = mat.map;
              mat.emissiveIntensity = 0.85;
              mat.metalness = 0.3;
              mat.roughness = 0.18;
            }
            if (name === 'r35_taillight_2017') {
              mat.color.set('#9d0612');
              mat.emissive.set('#ef0924');
              mat.emissiveMap = mat.map;
              mat.emissiveIntensity = 0.85;
              mat.metalness = 0.05;
              mat.roughness = 0.22;
            }
          }
          if (/LightA_Material1$|^LIGHTS_5$|^Mesheslight51Mtl$/.test(original.name) && mat.map) {
            mat.emissive.set('#ffffff');
            mat.emissiveMap = mat.map;
            mat.emissiveIntensity = 0.45;
            mat.metalness = 0.15;
            mat.roughness = 0.24;
          }
          if (car.id === 'amg' && original.name === 'マテリアル.007') {
            mat.color.set('#6b0209');
            mat.emissive.set('#df0a20');
            mat.emissiveIntensity = 0.65;
            mat.metalness = 0.05;
            mat.roughness = 0.2;
          }
          if (car.id === 'ghost' && /rrghost_(headlight|taillight|taillight_b)$/.test(name)) {
            mat.color.set(name.includes('taillight') ? '#6e020b' : '#b4c6cf');
            mat.emissive.set(name.includes('taillight') ? '#cf051c' : '#c8dfed');
            mat.emissiveIntensity = 0.5;
            mat.metalness = 0.1;
            mat.roughness = 0.2;
          }
          mat.emissiveIntensity = Math.min(mat.emissiveIntensity, 1.6);
        }
        materials.set(materialKey, mat);
        return mat;
      };
      node.material = Array.isArray(node.material)
        ? node.material.map(prepare)
        : prepare(node.material);
      if (car.id === 'mustang' && /exhaust/i.test(node.name)) {
        const exhaust = new MeshStandardMaterial({
          name: 'APEX brushed exhaust steel',
          color: '#30363a',
          metalness: 1,
          roughness: 0.32,
          envMapIntensity: 0.4,
        });
        node.material = exhaust;
      }
      if (
        car.id === 'revuelto' &&
        (Array.isArray(node.material) ? node.material : [node.material]).some((material) =>
          car.paintMaterials.includes(material.name),
        )
      ) {
        node.geometry = toCreasedNormals(node.geometry, Math.PI / 4);
        node.userData.apexOwnsGeometry = true;
      }
    });
    root.rotation.y += car.modelYaw || 0;
    root.updateMatrixWorld(true);
    let box = visibleBounds(root);
    let size = box.getSize(new Vector3());
    if (size.x > size.z * 1.3) root.rotation.y += Math.PI / 2;
    root.updateMatrixWorld(true);
    size = visibleBounds(root).getSize(new Vector3());
    root.scale.multiplyScalar(4.85 / Math.max(size.x, size.y, size.z));
    root.updateMatrixWorld(true);
    box = visibleBounds(root);
    const center = box.getCenter(new Vector3());
    root.position.x -= center.x;
    root.position.z -= center.z;
    root.position.y -= box.min.y;
    root.updateMatrixWorld(true);
    return root;
  }, [gltf.scene, car]);
  const paint = useMemo(() => {
    const result = new Set<MeshStandardMaterial>();
    object.traverse((node) => {
      if (node instanceof Mesh)
        for (const mat of Array.isArray(node.material) ? node.material : [node.material])
          if (car.paintMaterials.includes(mat.name)) result.add(mat as MeshStandardMaterial);
    });
    return [...result];
  }, [object, car]);
  useEffect(() => {
    invalidate();
  }, [target, invalidate]);
  useEffect(() => {
    paint.forEach((m) => m.color.copy(target));
    invalidate();
  }, [object, invalidate, paint]);
  // Only cloned materials belong to this instance; the loader owns cached geometry/textures.
  useEffect(
    () => () => {
      const disposed = new Set<MeshStandardMaterial>();
      object.traverse((node) => {
        if (node instanceof Mesh) {
          if (node.userData.apexOwnsGeometry) node.geometry.dispose();
          for (const mat of Array.isArray(node.material) ? node.material : [node.material])
            if (!disposed.has(mat)) {
              mat.dispose();
              disposed.add(mat);
            }
        }
      });
    },
    [object],
  );
  useFrame((state, delta) => {
    let changing = false;
    for (const mat of paint)
      if (
        Math.abs(mat.color.r - target.r) +
          Math.abs(mat.color.g - target.g) +
          Math.abs(mat.color.b - target.b) >
        0.001
      ) {
        mat.color.lerp(target, 1 - Math.exp(-Math.min(delta, 0.1) * 8));
        changing = true;
      }
    if (changing) state.invalidate();
  });
  return (
    <group position={[0, 0.135, 0]}>
      <primitive object={object} dispose={null} />
    </group>
  );
}
const cameraAngles = [
  new Vector3(5.8, 1.9, 6.4),
  new Vector3(0, 1.35, 8.5),
  new Vector3(8.5, 1.35, 0),
  new Vector3(-5.8, 1.9, -6.4),
];
function CameraRig({
  angle,
  autoRotate,
  zoom,
}: {
  angle: number;
  autoRotate: boolean;
  zoom: number;
}) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const { camera, invalidate, size } = useThree();
  const desired = useRef(new Vector3());
  const moving = useRef(true);
  const initial = useRef(true);
  useEffect(() => {
    const mobile = size.width < 760;
    desired.current.copy(cameraAngles[angle % 4]).multiplyScalar((mobile ? 1.38 : 1) / zoom);
    if (initial.current) {
      camera.position.copy(desired.current);
      initial.current = false;
    }
    controls.current?.target.set(0, 0.68, 0);
    moving.current = true;
    invalidate();
  }, [angle, zoom, size.width, camera, invalidate]);
  useFrame((state, delta) => {
    if (moving.current) {
      camera.position.lerp(desired.current, 1 - Math.exp(-Math.min(delta, 0.1) * 7));
      controls.current?.update();
      if (camera.position.distanceTo(desired.current) < 0.01) moving.current = false;
      state.invalidate();
    }
    if (autoRotate) state.invalidate();
  });
  useEffect(() => {
    invalidate();
  }, [autoRotate, invalidate]);
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      target={[0, 0.68, 0]}
      enablePan={false}
      minDistance={4.5}
      maxDistance={16}
      minPolarAngle={Math.PI / 2.7}
      maxPolarAngle={Math.PI / 2 - 0.025}
      autoRotate={autoRotate}
      autoRotateSpeed={0.5}
      enableDamping
      dampingFactor={0.065}
      onStart={() => {
        moving.current = false;
      }}
    />
  );
}
function SceneReadiness({
  onReady,
  onProgress,
}: {
  onReady: () => void;
  onProgress?: (value: number) => void;
}) {
  const { gl, scene, camera, invalidate } = useThree();
  const frames = useRef(0);
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    onProgress?.(40);
    invalidate();
    return () => {
      active.current = false;
    };
  }, [onProgress, invalidate]);
  useFrame(() => {
    frames.current++;
    if (frames.current < 4) invalidate();
    if (frames.current === 3) {
      onProgress?.(80);
      gl.compileAsync(scene, camera).then(() => {
        if (active.current) {
          onProgress?.(100);
          requestAnimationFrame(() => {
            if (active.current) onReady();
          });
        }
      });
    }
  });
  return null;
}
export default function CarScene({
  car,
  color,
  lighting,
  autoRotate,
  angle,
  quality,
  onReady,
  onProgress,
  zoom = 1,
}: Props) {
  const low = quality === 'low';
  const day = lighting === 'day';
  return (
    <Canvas
      frameloop="demand"
      shadows
      camera={{ position: [6.7, 1.85, 7], fov: 31, near: 0.1, far: 100 }}
      dpr={low ? 1 : quality === 'high' ? 2 : [1, 1.5]}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = SRGBColorSpace;
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <color attach="background" args={[day ? '#f2f3f0' : '#101312']} />
      <fog attach="fog" args={[day ? '#f2f3f0' : '#101312', 13, 36]} />
      <ambientLight intensity={0.32} />
      <directionalLight
        castShadow
        position={[3, 7, 5]}
        intensity={2.6}
        color={day ? '#ffffff' : '#f1f4ff'}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.00015}
        shadow-normalBias={0.02}
        shadow-radius={4}
      />
      <directionalLight
        position={[-4, 3, -3]}
        intensity={1.2}
        color={day ? '#ffffff' : '#d4e1ff'}
      />
      <Suspense fallback={null}>
        <Vehicle car={car} color={color} />
        <Environment key={lighting} resolution={low ? 256 : 512} frames={1}>
          <Lightformer
            form="rect"
            intensity={3.5}
            color={'#ffffff'}
            position={[0, 5, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[9, 3, 1]}
          />
          <Lightformer
            form="rect"
            intensity={2.8}
            color={day ? '#ffffff' : '#dce5ff'}
            position={[-4, 3, 0]}
            rotation={[0, Math.PI / 2, 0]}
            scale={[7, 1.1, 1]}
          />
          <Lightformer
            form="rect"
            intensity={day ? 3.2 : 2.4}
            color={'#ffffff'}
            position={[4, 2, -2]}
            rotation={[0, -Math.PI / 2, 0]}
            scale={[8, 2, 1]}
          />
          <Lightformer
            form="rect"
            intensity={1.5}
            position={[0, 2, 7]}
            rotation={[0, Math.PI, 0]}
            scale={[5, 0.6, 1]}
          />
        </Environment>
        <mesh position={[0, 0.065, 0]} receiveShadow>
          <cylinderGeometry args={[2.85, 2.9, 0.13, 128]} />
          <meshStandardMaterial
            color={day ? '#989e96' : '#252b28'}
            metalness={0.85}
            roughness={0.3}
          />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.132, 0]} receiveShadow>
          <circleGeometry args={[2.85, 128]} />
          <MeshReflectorMaterial
            resolution={low ? 512 : 2048}
            blur={[240, 100]}
            mixBlur={1}
            mixStrength={0.6}
            roughness={0.5}
            depthScale={0.5}
            minDepthThreshold={0.8}
            maxDepthThreshold={1.5}
            metalness={0.6}
            mirror={0.35}
            color={day ? '#c3c6c0' : '#0a0d0b'}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.13, 0]}>
          <torusGeometry args={[2.845, 0.009, 8, 160]} />
          <meshStandardMaterial color="#b0b9b2" metalness={1} roughness={0.23} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.006, 0]} receiveShadow>
          <planeGeometry args={[160, 160]} />
          <meshStandardMaterial
            color={day ? '#b5b8b2' : '#040505'}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
        <SceneReadiness onReady={onReady} onProgress={onProgress} />
      </Suspense>
      <CameraRig angle={angle} autoRotate={autoRotate} zoom={zoom} />
      <EffectComposer multisampling={8}>
        <N8AO aoRadius={0.3} intensity={1.5} distanceFalloff={1} quality="high" />
        <Bloom luminanceThreshold={2} intensity={0.15} mipmapBlur />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </Canvas>
  );
}
