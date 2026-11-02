import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {MeshoptDecoder} from 'meshoptimizer';
import draco from 'draco3dgltf';
import {writeFile} from 'node:fs/promises';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':await draco.createDecoderModule(),'meshopt.decoder':MeshoptDecoder});
for(const id of process.argv.slice(2)){
 const d=await io.read(`public/assets/models/hd/${id}.glb`);
 for (const m of d.getRoot().listMaterials()) {
  if ((id==='audi' && ['Car_Body','Paint','Glass'].includes(m.getName())) || (id==='senna' && /carbon|raceparts|blacksenna|sennapaint/i.test(m.getName()))) {
   const tex=m.getBaseColorTexture();
   if(tex) await writeFile(`docs/qa/${id}-${m.getName().replace(/[^a-z0-9]/gi,'-')}.${tex.getMimeType().split('/')[1]}`,tex.getImage());
   console.log(JSON.stringify({id,name:m.getName(),color:m.getBaseColorFactor(),metal:m.getMetallicFactor(),rough:m.getRoughnessFactor(),map:tex?.getName()}));
  }
 }
 const rows=d.getRoot().listMaterials().map(m=>({name:m.getName(),alpha:m.getAlphaMode(),color:m.getBaseColorFactor().map(n=>Math.round(n*100)/100),metal:m.getMetallicFactor(),rough:m.getRoughnessFactor(),textures:!!m.getBaseColorTexture(),primitives:m.listParents().filter(x=>x.propertyType==='Primitive').map(p=>({tri:(p.getIndices()?.getCount()||p.getAttribute('POSITION')?.getCount())/3,mesh:p.listParents().map(x=>x.getName())}))}));
 console.log(JSON.stringify({id,materials:rows},null,1));
}
