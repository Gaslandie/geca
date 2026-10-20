import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const check = (ok) => { if (!ok) throw new Error('Copie de publication invalide.'); };
const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const keys = (value, allowed) => check(object(value) && Object.keys(value).every(key => allowed.includes(key)));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
export async function validatePublication(input) {
  keys(input, ['id', 'hash', 'pending', 'snapshot']);
  check(input.id === null || /^[a-f0-9-]{36}$/.test(input.id));
  keys(input.snapshot, ['version', 'entries', 'media']);
  const {entries,media}=input.snapshot;
  check(input.snapshot.version===1 && Array.isArray(entries) && entries.length<=300 && (object(media) || Array.isArray(media) && media.length===0));
  const fields={projects:['title','description','zone','period','partner'],news:['title','description','period'],team:['name','role']};
  const seen=new Set(), used=new Set(), photos=new Map();
  for(const entry of entries) {
    keys(entry,['kind','key','deleted','new','texts','photo']);
    check(Object.hasOwn(fields,entry.kind) && typeof entry.key==='string' && /^[a-z0-9][a-z0-9-]{0,99}$/.test(entry.key) && typeof entry.deleted==='boolean');
    const key=`${entry.kind}/${entry.key}`;check(!seen.has(key));seen.add(key);
    if(entry.deleted){check(Object.keys(entry).length===3);continue;}
    check(typeof entry.new==='boolean' && entry.new===entry.key.startsWith('admin-'));
    check(object(entry.texts) || Array.isArray(entry.texts) && entry.texts.length===0);
    if(Array.isArray(entry.texts))entry.texts={};
    keys(entry.texts,['fr','en']);
    for(const values of Object.values(entry.texts)) {
      keys(values,fields[entry.kind]);
      for(const [field,value] of Object.entries(values))check(typeof value==='string' && value.length<=(field==='description'?40000:3000) && !value.includes('\u0000'));
    }
    if(entry.new)for(const field of entry.kind==='team'?['name','role']:['title','description'])check(entry.texts.fr?.[field]?.trim());
    if(entry.photo) {
      const p=entry.photo;keys(p,['sha256','width','height','alt']);keys(p.alt,['fr','en']);
      check(/^[a-f0-9]{64}$/.test(p.sha256) && Number.isInteger(p.width) && Number.isInteger(p.height) && p.width>0 && p.height>0 && p.width<=1280 && p.height<=1280);
      check(['fr','en'].every(locale=>typeof p.alt[locale]==='string' && p.alt[locale].length<=2000));
      check(typeof media[p.sha256]==='string' && media[p.sha256].length<=350000);
      const bytes=Buffer.from(media[p.sha256],'base64');
      check(bytes.toString('base64')===media[p.sha256] && digest(bytes)===p.sha256 && bytes.toString('ascii',0,4)==='RIFF' && bytes.readUInt32LE(4)+8===bytes.length);
      const meta=await sharp(bytes,{limitInputPixels:1280*1280}).metadata();
      check(meta.format==='webp' && meta.width===p.width && meta.height===p.height && !meta.exif && !meta.xmp && !meta.icc && (meta.pages??1)===1);
      used.add(p.sha256);photos.set(p.sha256,bytes);
    }
  }
  check(Object.keys(media).every(hash=>used.has(hash)));
  return {id:input.id,entries,photos};
}

export async function applyPublication(inputPath, work) {
  if(!inputPath)return null;
  const raw=await readFile(inputPath);check(raw.length<=80*1024*1024);
  const publication=await validatePublication(JSON.parse(raw));
  const variantsPath=join(work,'src/content/image-variants.json');
  const variants=JSON.parse(await readFile(variantsPath,'utf8'));
  for(const entry of publication.entries)if(entry.photo){
    const {sha256,width,height}=entry.photo;
    const src=`/images/optimized/publication-${sha256}.webp`;
    await writeFile(join(work,'public',src.slice(1)),publication.photos.get(sha256));
    variants[src]=[{src,width,height}];
  }
  await writeFile(variantsPath,JSON.stringify(variants));
  await writeFile(join(work,'src/content/publication.json'),JSON.stringify({id:publication.id,entries:publication.entries}));
  return publication.id;
}
