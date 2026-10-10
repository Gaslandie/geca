import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { spawn, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

// Base, clé, comptes, photos, sessions et serveur jetables ; aucun envoi extérieur.
const cwd = fileURLToPath(new URL('..', import.meta.url));
const php = process.env.GECA_PHP || 'php';
const dir = await mkdtemp(`${tmpdir()}/geca-create-`);
const password = randomBytes(32).toString('hex');
const origin = 'http://127.0.0.1:8003';
const env = {...process.env, APP_ENV:'local', APP_DEBUG:'false', APP_KEY:`base64:${randomBytes(32).toString('base64')}`,
  APP_URL:origin, DB_CONNECTION:'sqlite', DB_DATABASE:`${dir}/test.sqlite`, DB_URL:'', CACHE_STORE:'database',
  SESSION_DRIVER:'database', SESSION_SECURE_COOKIE:'false', GECA_LOGIN_VERIFICATION:'authenticator',
  GECA_MEDIA_UPLOADS_ENABLED:'true', GECA_NEWSLETTER_MODE:'preview', MAIL_MAILER:'array',
  GECA_LOCAL_ACCESS_USER:'0', GECA_LOCAL_ACCESS_UNTIL:'0', GECA_PUBLIC_PATH:'null', GECA_TEST_PASSWORD:password,
  LARAVEL_STORAGE_PATH:`${dir}/storage`, APP_CONFIG_CACHE:`${dir}/config.php`, APP_ROUTES_CACHE:`${dir}/routes.php`, VIEW_COMPILED_PATH:`${dir}/views`,
  GECA_FIXTURE_PHOTO:`${dir}/photo-test.jpg`};
for (const path of ['app/private','framework/cache/data','framework/sessions','framework/views','logs']) await mkdir(`${env.LARAVEL_STORAGE_PATH}/${path}`,{recursive:true});
await mkdir(env.VIEW_COMPILED_PATH);
await writeFile(env.DB_DATABASE,'',{mode:0o600});
const bootstrap = String.raw`require 'vendor/autoload.php'; $app=require 'bootstrap/app.php'; $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap(); `;
function run(args, extra = {}) {
  const result=spawnSync(php,args,{cwd,env:{...env,...extra},encoding:'utf8'});
  assert.equal(result.status,0,`Commande fixture échouée : ${args[0]}`);
  return result.stdout;
}
run(['artisan','migrate','--no-interaction']);
run(['-r',bootstrap+String.raw`foreach(['create@example.test','nojs@example.test'] as $email) { $u=new App\Models\User; $u->name='Compte technique de test'; $u->email=$email; $u->password=getenv('GECA_TEST_PASSWORD'); $u->is_admin=true; $u->is_active=true; $u->session_version=1; $u->two_factor_secret=OTPHP\TOTP::generate()->getSecret(); $u->two_factor_confirmed_at=now(); $u->save(); } $im=imagecreatetruecolor(80,60); imagejpeg($im,getenv('GECA_FIXTURE_PHOTO'));`]);
const server=spawn(php,['-S','127.0.0.1:8003','-t','.',`${cwd}/vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php`],{cwd:`${cwd}/public`,env,stdio:'ignore'});
let browser;
async function login(page, email) {
  await page.goto(`${origin}/connexion`);
  await page.getByLabel('Adresse e-mail').fill(email);
  await page.getByLabel('Mot de passe',{exact:true}).fill(password);
  await page.getByRole('button',{name:'Se connecter',exact:true}).click();
  await page.waitForURL('**/connexion/double-verification');
  const code=run(['-r',bootstrap+String.raw`$u=App\Models\User::where('email',getenv('GECA_FIXTURE_EMAIL'))->firstOrFail(); echo OTPHP\TOTP::create($u->two_factor_secret)->now();`],{GECA_FIXTURE_EMAIL:email});
  await page.getByLabel('Code Authenticator à six chiffres').fill(code);
  await page.getByRole('button',{name:'Confirmer la connexion',exact:true}).click();
  await page.waitForURL('**/administration');
}
function snapshot(id) {
  return JSON.parse(run(['-r',bootstrap+String.raw`$entry=App\Models\ContentEntry::withTrashed()->findOrFail(getenv('GECA_FIXTURE_ID')); echo json_encode(['source'=>$entry->source_payload,'draft'=>$entry->draft_payload,'revision'=>$entry->revision,'deleted'=>$entry->trashed(),'actor'=>Illuminate\Support\Facades\DB::table('content_revisions')->where('content_entry_id',$entry->id)->orderByDesc('revision')->value('user_id')]);`],{GECA_FIXTURE_ID:String(id)}));
}
try {
  let ready=false;
  for(let n=0;n<50;n++) {try {if((await fetch(`${origin}/connexion`)).ok){ready=true;break;}}catch{} await new Promise(resolve=>setTimeout(resolve,100));}
  assert.ok(ready);
  browser=await chromium.launch({headless:true,executablePath:process.env.GECA_CHROME || '/usr/bin/google-chrome',args:['--no-sandbox']});
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  const page=await context.newPage();page.setDefaultTimeout(15000);
  await login(page,'create@example.test');
  for(const kind of ['projects','news','team']) {
    await page.goto(`${origin}/administration/${kind}`);
    await page.locator('.content-create-action a').click();await page.waitForURL(`**/${kind}/ajouter`);
    for(const width of [320,375,768,1440]) for(const font of ['', '200%']) {
      await page.setViewportSize({width,height:1000});
      await page.evaluate(font=>document.documentElement.style.fontSize=font,font);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    }
    await page.evaluate(()=>document.documentElement.style.fontSize='');
    await page.setViewportSize({width:375,height:1000});
    assert.deepEqual((await new AxeBuilder({page}).analyze()).violations,[]);
    if(kind==='projects') await page.screenshot({path:'/tmp/geca-content-create-mobile.png',fullPage:true});
    const first=kind==='team'?'name':'title';
    const second=kind==='team'?'role':'description';
    await page.locator(`#fr-${first}`).fill(`TEST ${kind}, base jetable`);
    await page.locator(`#fr-${second}`).fill('Texte technique de test, aucun fait GECA.');
    await page.locator('#source_note').fill('Données fictives de test sur base jetable, sans publication.');
    if(kind==='projects') {
      for(const field of ['zone','period','partner']) assert.equal(await page.locator(`#fr-${field}`).getAttribute('required'),null);
      await page.locator('.english-version summary').click();
      await page.locator('#en-title').fill('TEST only');
    }
    if(kind==='team') {
      await page.locator('#photo').setInputFiles(env.GECA_FIXTURE_PHOTO);
      await page.waitForFunction(()=>{const image=document.querySelector('[data-photo-preview-image]');return !image.hidden && image.complete && image.naturalWidth===80;});
    }
    const token=await page.locator('[name=creation_token]').inputValue();
    const csrf=await page.locator('main form [name=_token]').inputValue();
    assert.equal((await context.request.post(`${origin}/administration/${kind}`,{form:{creation_token:token},maxRedirects:0})).status(),419);
    await page.locator('main form .actions button[type=submit]').click();
    await page.waitForURL(`**/${kind}/*/modifier`);
    const id=Number(page.url().match(/\/(\d+)\/modifier$/)[1]);
    const created=snapshot(id);
    assert.equal(created.revision,1);assert.equal(created.actor,1);
    assert.ok(created.source.source_note.includes('base jetable'));
    if(kind==='projects') {assert.equal(created.draft.fr.partner,'');assert.equal(created.draft.en.title,'TEST only');}
    if(kind==='team') assert.ok(created.draft.photo_id);
    assert.equal((await context.request.post(`${origin}/administration/${kind}`,{form:{_token:csrf,creation_token:token},maxRedirects:0})).status(),302);
    assert.equal(Number(run(['-r',bootstrap+String.raw`echo App\Models\ContentEntry::count();`])),['projects','news','team'].indexOf(kind)+1);
    let previousPhoto;
    if(kind==='team') {
      previousPhoto=await page.locator('.entry-photo').getAttribute('src');
      const choose=async()=>{
        await page.locator('#photo').setInputFiles(env.GECA_FIXTURE_PHOTO);
        await page.waitForFunction(()=>{const image=document.querySelector('[data-photo-preview-image]');return !image.hidden && image.complete && image.naturalWidth===80;});
        assert.equal(await page.locator('[data-photo-current]').isVisible(),false);
        assert.equal(await page.locator('#photo-preview-status').textContent(),'Nouvelle photo — à enregistrer.');
        assert.equal(await page.locator('.entry-photo-fields img:visible').count(),1);
        assert.deepEqual(snapshot(id),created,'Le choix seul ne modifie ni brouillon ni historique');
      };
      await choose();
      const blob=await page.locator('[data-photo-preview-image]').getAttribute('src');
      await page.getByRole('button',{name:'Annuler le choix de la photo'}).click();
      assert.equal(await page.locator('#photo').inputValue(),'');
      assert.equal(await page.locator('[data-photo-current]').isVisible(),true);
      assert.equal(await page.locator('.entry-photo').getAttribute('src'),previousPhoto);
      assert.equal(await page.evaluate(async url=>{try {await fetch(url);return true;}catch{return false;}},blob),false);
      await choose();
      await page.locator('#photo').setInputFiles({name:'interdit.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg/>')});
      await page.waitForFunction(()=>document.getElementById('photo').getAttribute('aria-invalid')==='true');
      assert.equal(await page.locator('[data-photo-current]').isVisible(),true);
      assert.equal(await page.locator('[data-photo-preview-image]').isVisible(),false);
      assert.deepEqual(snapshot(id),created);
      await choose();
      for(const width of [320,375,768,1440]) for(const font of ['', '200%']) {
        await page.setViewportSize({width,height:1000});await page.evaluate(font=>document.documentElement.style.fontSize=font,font);
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
        assert.equal(await page.locator('.entry-photo-fields img:visible').count(),1);
      }
      await page.evaluate(()=>document.documentElement.style.fontSize='');
      assert.deepEqual((await new AxeBuilder({page}).analyze()).violations,[]);
      await page.locator('.entry-photo-fields').screenshot({path:'/tmp/geca-replace-photo-pending.png'});
    }
    await page.locator(`#fr-${first}`).fill(`TEST ${kind} corrigé`);
    await page.locator('#source_note').fill('Correction technique sur la base jetable.');
    await page.getByRole('button',{name:'Enregistrer les changements',exact:true}).click();await page.getByRole('status').waitFor();
    if(kind==='team') {
      assert.notEqual(await page.locator('.entry-photo').getAttribute('src'),previousPhoto);
      assert.equal(await page.locator('[data-photo-current]').isVisible(),true);
      assert.equal(await page.locator('[data-photo-preview-panel]').isVisible(),false);
      assert.equal((await context.request.get(previousPhoto)).status(),200,'Ancienne photo conservée dans l’historique privé');
    }
    await page.locator('.delete-link').click();await page.locator('[name=confirm]').check();
    await page.getByRole('button',{name:'Confirmer la suppression',exact:true}).click();await page.getByRole('status').waitFor();
    await page.setViewportSize({width:1440,height:1000});
    await page.getByRole('link',{name:'Corbeille',exact:true}).click();await page.waitForURL('**/administration/corbeille');
    await page.getByRole('button',{name:'Restaurer',exact:true}).click();await page.getByRole('status').waitFor();
    const restored=snapshot(id);assert.equal(restored.deleted,false);assert.equal(restored.revision,4);assert.deepEqual(restored.source,created.source);
  }
  const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:375,height:900}});
  const plain=await nojs.newPage();await login(plain,'nojs@example.test');
  await plain.goto(`${origin}/administration/news/ajouter`);
  await plain.locator('#fr-title').fill('TEST sans JavaScript');await plain.locator('#fr-description').fill('Texte technique de test uniquement.');
  await plain.locator('#source_note').fill('Création technique sans JavaScript sur base jetable.');
  await plain.locator('#photo').setInputFiles(env.GECA_FIXTURE_PHOTO);
  assert.equal(await plain.locator('[name=alt_fr], [name=alt_en], [name=credit], [name=license], [name=source], [name=illustrative]').count(),0);
  await plain.getByRole('button',{name:'Ajouter l’actualité',exact:true}).click();await plain.waitForURL('**/news/*/modifier');
  await plain.getByRole('status').waitFor();
  assert.equal((await nojs.request.get(await plain.locator('.entry-photo').getAttribute('src'))).status(),200);
  const anon=await browser.newContext();
  assert.equal((await anon.request.get(`${origin}/administration/projects/ajouter`,{maxRedirects:0})).status(),302);
  console.log('Création, modification, corbeille et restauration des trois types : réussite sur base jetable. Photo et aperçu privés, anglais facultatif, champs inconnus vides, auteur serveur, double soumission sans doublon, CSRF refusé, mobile/PC/texte 200 %, axe et création sans JavaScript vérifiés. Aucun contenu de travail ni envoi modifié.');
} finally {
  await browser?.close();
  if (server.exitCode === null) {
    server.kill('SIGTERM');
    await new Promise(resolve=>server.once('exit',resolve));
  }
  await rm(dir,{recursive:true,force:true});
}
