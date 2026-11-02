import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {MeshoptDecoder} from 'meshoptimizer';
import draco from 'draco3dgltf';
import {readFileSync,writeFileSync} from 'node:fs';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':await draco.createDecoderModule(),'meshopt.decoder':MeshoptDecoder});
const result=[];
for(const car of JSON.parse(readFileSync('src/data/vehicles.json','utf8'))){
 const d=await io.read('public/assets/models/'+car.modelFile);
 const rows=d.getRoot().listMaterials().map(m=>({name:m.getName(),color:m.getBaseColorFactor(),emissive:m.getEmissiveFactor(),alpha:m.getAlphaMode(),map:!!m.getBaseColorTexture(),emissiveMap:!!m.getEmissiveTexture(),parts:m.listParents().filter(p=>p.propertyType==='Primitive').flatMap(p=>p.listParents().map(x=>x.getName()))})).filter(m=>/head|tail|light|glass|lens/i.test(m.name+' '+m.parts.join(' ')));
 result.push({id:car.id,materials:rows});
 console.log(JSON.stringify({id:car.id,mats:rows.map(m=>({name:m.name,alpha:m.color[3],color:m.color.slice(0,3).map(n=>+n.toFixed(2)),emissive:m.emissive,map:m.map,parts:m.parts.length}))}));
}
writeFileSync('docs/light-material-audit.json',JSON.stringify(result,null,2));
