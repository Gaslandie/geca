import { readFile, writeFile } from 'node:fs/promises';
import { mkdir } from 'node:fs/promises';
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
  check(Object.values(media).every(value=>typeof value==='string') && Object.values(media).reduce((sum,value)=>sum+value.length,0)<=34*1024*1024);
  const fields={projects:['title','description','zone','period','partner'],news:['title','description','period'],team:['name','role']};
  const seen=new Set(), used=new Set(), photos=new Map(), videos=new Map();
  for(const entry of entries) {
    keys(entry,['kind','key','deleted','new','texts','photo','video']);
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
    if(Object.hasOwn(entry,'video'))check(entry.kind !== 'team');
    if(entry.video !== undefined && entry.video !== null) {
      check(entry.kind !== 'team');
      const v=entry.video;keys(v,['sha256','width','height']);
      check(/^[a-f0-9]{64}$/.test(v.sha256) && Number.isInteger(v.width) && Number.isInteger(v.height) && v.width>0 && v.height>0 && v.width<=3840 && v.height<=3840);
      check(typeof media[v.sha256]==='string' && media[v.sha256].length<=27962028);
      const bytes=Buffer.from(media[v.sha256],'base64');
      check(bytes.length<=20*1024*1024 && bytes.toString('base64')===media[v.sha256] && digest(bytes)===v.sha256);
      validateMp4(bytes,v);
      used.add(v.sha256);videos.set(v.sha256,bytes);
    }
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
  return {id:input.id,entries,photos,videos};
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
  await mkdir(join(work,'public/videos'),{recursive:true});
  for(const [hash,bytes] of publication.videos)await writeFile(join(work,`public/videos/publication-${hash}.mp4`),bytes);
  await writeFile(variantsPath,JSON.stringify(variants));
  await writeFile(join(work,'src/content/publication.json'),JSON.stringify({id:publication.id,entries:publication.entries}));
  return publication.id;
}

function validateMp4(bytes,video) {
  let count=0, dimensions=null, avc=false;
  const top={};
  function walk(start,end,depth=0) {
    check(depth<=10);
    for(let offset=start;offset<end;) {
      check(++count<=20000 && end-offset>=8);
      const size=bytes.readUInt32BE(offset), type=bytes.toString('latin1',offset+4,offset+8);
      check(size>=8 && size<=end-offset);
      if(depth===0) {
        check(['ftyp','moov','mdat','free','wide','skip','uuid'].includes(type));top[type]=(top[type]??0)+1;
        if(offset===0)check(type==='ftyp' && size>=16 && ['isom','iso2','mp41','mp42','avc1'].includes(bytes.toString('latin1',8,12)));
      }
      check(!['udta','meta','uuid','skip'].includes(type));
      if(type==='free')check(bytes.subarray(offset+8,offset+size).every(value=>value===0));
      if(['moov','trak','mdia','minf','stbl','dinf','edts'].includes(type))walk(offset+8,offset+size,depth+1);
      if(type==='tkhd') {
        check(size>=92);const width=bytes.readUInt32BE(offset+size-8)>>>16,height=bytes.readUInt32BE(offset+size-4)>>>16;
        if(width && height){check(!dimensions && width<=3840 && height<=3840);dimensions={width,height};}
      }
      if(type==='stsd') {
        check(size>=32 && bytes.readUInt32BE(offset+12)===1 && bytes.readUInt32BE(offset+16)===size-16);
        const codec=bytes.toString('latin1',offset+20,offset+24);check(['avc1','mp4a'].includes(codec));
        if(codec==='avc1'){check(size-16>=86 && bytes.subarray(offset+16,offset+size).includes(Buffer.from('avcC')));avc=true;}
      }
      if(type==='dref')check(size===28 && bytes.subarray(offset+12,offset+28).equals(Buffer.from('000000010000000c75726c2000000001','hex')));
      offset+=size;
    }
  }
  walk(0,bytes.length);
  check(top.ftyp===1 && top.moov===1 && top.mdat>=1 && avc && dimensions?.width===video.width && dimensions?.height===video.height);
}
