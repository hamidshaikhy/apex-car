import {readFile} from 'node:fs/promises';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {Box3,Mesh,Vector3} from 'three';
Object.assign(globalThis,{self:globalThis,createImageBitmap:async()=>({width:1,height:1,close(){}}),ProgressEvent:class{constructor(type,data){Object.assign(this,data);this.type=type;}}});
for(const id of process.argv.slice(2)){
 const raw=await readFile(`public/assets/models/hd/${id}.glb`);const {scene}=await new GLTFLoader().parseAsync(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength),'');
 const rows=[];scene.traverse(n=>{if(n instanceof Mesh){const b=new Box3().setFromObject(n);rows.push({name:n.name,mat:n.material.name,alpha:n.material.opacity,size:b.getSize(new Vector3()).toArray().map(x=>+x.toFixed(2)),center:b.getCenter(new Vector3()).toArray().map(x=>+x.toFixed(2))});}});
 rows.sort((a,b)=>Math.max(...b.size)-Math.max(...a.size));console.log(JSON.stringify({id,overall:new Box3().setFromObject(scene).getSize(new Vector3()).toArray(),rows:['one77','tourbillon'].includes(id) ? rows.filter(r=>/red_glass|Window_Material/.test(r.mat)):rows.slice(0,18)},null,1));
}
