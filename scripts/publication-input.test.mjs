import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {validatePublication} from './publication-input.mjs';
const base=()=>({id:'11111111-1111-4111-8111-111111111111',pending:true,snapshot:{version:1,entries:[{kind:'news',key:'admin-11111111-1111-4111-8111-111111111111',deleted:false,new:true,texts:{fr:{title:'TEST',description:'Fixture uniquement'},en:{title:'',description:''}}}],media:{}}});
test('publication minimale et texte échappé par React conservés comme données',async()=>{
 const input=base();input.snapshot.entries[0].texts.fr.title='<script>TEST</script>';
 const result=await validatePublication(input);assert.equal(result.entries[0].texts.fr.title,'<script>TEST</script>');
});
test('champs privés, chemins, doublons et médias non associés refusés',async()=>{
 for(const mutate of [x=>x.snapshot.accounts=[],x=>x.snapshot.entries[0].source_note='secret',x=>x.snapshot.entries[0].key='../../outside',x=>x.snapshot.entries.push(x.snapshot.entries[0]),x=>x.snapshot.entries[0].texts.fr.password='secret',x=>x.snapshot.media.fake='secret',x=>x.snapshot.entries[0].texts.fr.title=null]){
 const input=base();mutate(input);await assert.rejects(validatePublication(input));}
});
test('photo WebP vérifiée, hash et dimensions falsifiés refusés',async()=>{
 const bytes=await sharp({create:{width:12,height:12,channels:3,background:'#194b30'}}).webp().toBuffer();
 const hash=createHash('sha256').update(bytes).digest('hex');
 const input=base();input.snapshot.media[hash]=bytes.toString('base64');input.snapshot.entries[0].photo={sha256:hash,width:12,height:12,alt:{fr:'TEST',en:'TEST'}};
 assert.equal((await validatePublication(input)).photos.size,1);
 input.snapshot.entries[0].photo.width=13;await assert.rejects(validatePublication(input));
 input.snapshot.entries[0].photo.width=12;input.snapshot.media[hash]=Buffer.from('fake').toString('base64');await assert.rejects(validatePublication(input));
});

test('vidéo réelle nettoyée : contrat PHP/Node, hash, dimensions, conteneur et droits de publication',async()=>{
 const {execFileSync}=await import('node:child_process');
 const bytes=execFileSync('backoffice/.local-tools/php',['-r',String.raw`require 'backoffice/vendor/autoload.php'; echo (new App\Services\PrepareVideo)->inspect(file_get_contents('public/videos/geca-projets-20261015-1.mp4'))['bytes'];`],{maxBuffer:21*1024*1024});
 const hash=createHash('sha256').update(bytes).digest('hex');
 const fixture=()=>{const input=base();input.snapshot.media[hash]=bytes.toString('base64');input.snapshot.entries[0].video={sha256:hash,width:832,height:464};return input;};
 assert.equal((await validatePublication(fixture())).videos.size,1);
 for(const mutate of [x=>x.snapshot.entries[0].video.width=833,x=>x.snapshot.entries[0].video.sha256='a'.repeat(64),x=>x.snapshot.entries[0].video.path='../../private',x=>{x.snapshot.entries[0].kind='team';x.snapshot.entries[0].texts={fr:{name:'TEST',role:'TEST'}};}]) {
   const input=fixture();mutate(input);await assert.rejects(validatePublication(input));
 }
 for(const raw of [bytes.subarray(0,bytes.length-20),Buffer.from('<?php echo "secret";')]){
   const input=fixture(), badHash=createHash('sha256').update(raw).digest('hex');input.snapshot.media={[badHash]:raw.toString('base64')};input.snapshot.entries[0].video.sha256=badHash;await assert.rejects(validatePublication(input));
 }
 const input=base();input.snapshot.entries[0].video=null;assert.equal((await validatePublication(input)).videos.size,0);
});
