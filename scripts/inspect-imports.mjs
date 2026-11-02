import { readFile } from 'node:fs/promises';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Box3,Mesh,Vector3,Raycaster } from 'three';
Object.assign(globalThis,{self:globalThis,createImageBitmap:async()=>({width:1,height:1,close(){}}),ProgressEvent:class{constructor(type,data){Object.assign(this,data);this.type=type;}}});
for(const id of ['senna','gtr','audi','challenger','tourbillon','one77','ghost','porsche']){
 const bytes=await readFile(`public/assets/models/hd/${id}.glb`);const {scene}=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 let box=new Box3().setFromObject(scene),size=box.getSize(new Vector3());if(size.x>size.z*1.3)scene.rotation.y+=Math.PI/2;
 scene.scale.multiplyScalar(4.85/Math.max(size.x,size.y,size.z));scene.updateMatrixWorld(true);box=new Box3().setFromObject(scene);const center=box.getCenter(new Vector3());scene.position.sub(new Vector3(center.x,box.min.y,center.z));scene.updateMatrixWorld(true);
 const hits=[];for(const z of [-1.5,0,1.5]){const ray=new Raycaster(new Vector3(0,6,z),new Vector3(0,-1,0));hits.push({z,mats:ray.intersectObject(scene,true).slice(0,2).map(hit=>hit.object.material.name)});}
 const lamps=[];scene.traverse(node=>{if(node instanceof Mesh&&/headlight/i.test(node.material?.name||'')){let b=new Box3().setFromObject(node);lamps.push({name:node.material.name,z:b.getCenter(new Vector3()).z});}});
 console.log(JSON.stringify({id,size:new Box3().setFromObject(scene).getSize(new Vector3()).toArray(),hits,lamps}));
}
