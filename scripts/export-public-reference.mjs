import {readFile,writeFile,mkdtemp,rm,copyFile} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createRequire} from 'node:module';
import ts from 'typescript';

// Référentiel du code public avant application des publications : jamais des brouillons.
export async function publicReference(work) {
 const dir=await mkdtemp(join(tmpdir(),'geca-reference-'));
 try{
  for(const name of ['site','publication']){
   const source=await readFile(join(work,'src/content',name+'.ts'),'utf8');
   await writeFile(join(dir,name+'.js'),ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText);
  }
  for(const name of ['home-video.json','project-videos.json'])await copyFile(join(work,'src/content',name),join(dir,name));
  await writeFile(join(dir,'publication.json'),'{"id":null,"entries":[]}');
  const site=createRequire(import.meta.url)(join(dir,'site.js'));
  const entries=[];const images={};const variants=JSON.parse(await readFile(join(work,'src/content/image-variants.json'),'utf8'));
  const pick=(value,fields)=>Object.fromEntries(fields.map(field=>[field,value[field]??'']));
  for(const fr of site.getPortfolioProjects('fr')){
   const en=site.getPortfolioProjects('en').find(x=>x.slug===fr.slug);const fields=['title','description','zone','period','partner'];
   entries.push({kind:'projects',key:fr.slug,payload:{fr:pick(fr,fields),en:pick(en,fields),status:fr.status,photo:{fr:fr.photo??null,en:en.photo??null}}});
  }
  for(const fr of site.getNewsEntries('fr')){
   const en=site.getNewsEntries('en').find(x=>x.id===fr.id);const fields=['title','description','period'];
   entries.push({kind:'news',key:fr.id,payload:{fr:pick(fr,fields),en:pick(en,fields),photo:{fr:fr.photo??null,en:en.photo??null},...(fr.id.startsWith('projet-')?{linked_project:fr.id.slice(7)}:{})}});
  }
  for(const member of site.teamMembers)entries.push({kind:'team',key:member.id,payload:{fr:{name:member.name,role:member.role.fr},en:{name:member.name,role:member.role.en},photo:member.photo??null}});
  for(const {payload} of entries)for(const photo of [payload.photo,payload.photo?.fr,payload.photo?.en])if(photo?.src && variants[photo.src])images[photo.src]=variants[photo.src];
  return {entries,images};
 }finally{await rm(dir,{recursive:true,force:true});}
}
