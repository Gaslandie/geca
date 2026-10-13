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
const dir = await mkdtemp(`${tmpdir()}/geca-reports-`);
const password = randomBytes(32).toString('hex');
const origin = 'http://127.0.0.1:8006';
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
run(['-r',bootstrap+String.raw`foreach(['admin@example.test','admin-nojs@example.test','editor@example.test','reader@example.test'] as $email) { $u=new App\Models\User; $u->name='Compte technique de test'; $u->email=$email; $u->password=getenv('GECA_TEST_PASSWORD'); $u->role=str_starts_with($email,'admin')?'admin':explode('@',$email)[0]; $u->is_admin=$u->role==='admin'; $u->is_active=true; $u->session_version=1; $u->two_factor_secret=OTPHP\TOTP::generate()->getSecret(); $u->two_factor_confirmed_at=now(); $u->save(); } $im=imagecreatetruecolor(80,60); imagejpeg($im,getenv('GECA_FIXTURE_PHOTO'));`]);
const server=spawn(php,['-S','127.0.0.1:8006','-t','.',`${cwd}/vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php`],{cwd:`${cwd}/public`,env,stdio:'ignore'});
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
const pdf=`${dir}/report.pdf`;
await writeFile(pdf, '%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF\n');
try {
  let ready=false;
  for(let n=0;n<50;n++) {try {if((await fetch(`${origin}/connexion`)).ok){ready=true;break;}}catch{} await new Promise(resolve=>setTimeout(resolve,100));}
  assert.ok(ready);
  browser=await chromium.launch({headless:true,executablePath:process.env.GECA_CHROME || '/usr/bin/google-chrome',args:['--no-sandbox']});
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  const page=await context.newPage();page.setDefaultTimeout(15000);
  await login(page,'admin@example.test');
  await page.getByRole('link',{name:'Gérer les comptes et rôles',exact:true}).click();
  await page.getByRole('link',{name:'Ajouter un compte',exact:true}).click();
  assert.equal(await page.locator('#role option').count(),3);
  assert.equal(await page.locator('#role').inputValue(),'reader');
  for(const width of [320,375,768,1440]) for(const font of ['', '200%']) {
    await page.setViewportSize({width,height:1000}); await page.evaluate(font=>document.documentElement.style.fontSize=font,font);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Débordement ${width}/${font}`);
  }
  await page.evaluate(()=>document.documentElement.style.fontSize='');
  await page.setViewportSize({width:375,height:1000});
  assert.deepEqual((await new AxeBuilder({page}).analyze()).violations,[]);
  await page.screenshot({path:'/tmp/geca-users-create-mobile.png',fullPage:true});
  await page.getByLabel('Nom de la personne',{exact:true}).fill('TEST nouveau compte');
  await page.getByLabel('Adresse e-mail de la personne',{exact:true}).fill('new@example.test');
  await page.getByLabel('Rôle',{exact:true}).selectOption('reader');
  await page.getByLabel('Mot de passe de la personne',{exact:true}).fill(password);
  await page.getByLabel('Confirmer le mot de passe de la personne',{exact:true}).fill(password);
  await page.getByLabel('Votre mot de passe actuel',{exact:true}).fill(password);
  await page.getByRole('button',{name:'Ajouter le compte',exact:true}).click(); await page.waitForURL('**/administration/comptes');
  await page.getByRole('heading',{name:'TEST nouveau compte',exact:true}).waitFor();
  const editorCard=page.locator('article').filter({hasText:'editor@example.test'});
  await editorCard.getByRole('link',{name:/Modifier les droits/}).click();
  await page.getByLabel('Rôle',{exact:true}).selectOption('reader');
  await page.getByLabel('Votre mot de passe actuel',{exact:true}).fill(password);
  await page.getByRole('button',{name:'Enregistrer les droits',exact:true}).click(); await page.waitForURL('**/administration/comptes');
  assert.ok(await page.locator('article').filter({hasText:'editor@example.test'}).getByText('Lecteur · Actif',{exact:true}).count());
  await page.setViewportSize({width:1440,height:1000});
  await page.screenshot({path:'/tmp/geca-users-list-desktop.png',fullPage:true});
  assert.deepEqual((await new AxeBuilder({page}).analyze()).violations,[]);
  const readonlyContext=await browser.newContext({viewport:{width:375,height:900},javaScriptEnabled:false});
  const readonly=await readonlyContext.newPage(); await login(readonly,'reader@example.test');
  assert.equal(await readonly.getByRole('link',{name:'Comptes et rôles',exact:true}).count(),0);
  assert.equal((await readonlyContext.request.get(`${origin}/administration/comptes`)).status(),403);
  assert.equal((await readonlyContext.request.get(`${origin}/administration/rapports/ajouter`)).status(),403);
  await readonly.goto(`${origin}/administration/rapports`);
  assert.equal(await readonly.getByRole('link',{name:'Ajouter un rapport',exact:true}).count(),0);
  assert.ok(await readonly.getByText('Aucun rapport pour le moment.',{exact:true}).count());
  await readonlyContext.close();
  const plainContext=await browser.newContext({javaScriptEnabled:false,viewport:{width:375,height:900}});
  const plain=await plainContext.newPage(); await login(plain,'admin-nojs@example.test');
  await plain.goto(`${origin}/administration/comptes/ajouter`);
  await plain.getByLabel('Nom de la personne',{exact:true}).fill('TEST sans JavaScript');
  await plain.getByLabel('Adresse e-mail de la personne',{exact:true}).fill('plain@example.test');
  await plain.getByLabel('Rôle',{exact:true}).selectOption('editor');
  await plain.getByLabel('Mot de passe de la personne',{exact:true}).fill(password);
  await plain.getByLabel('Confirmer le mot de passe de la personne',{exact:true}).fill(password);
  await plain.getByLabel('Votre mot de passe actuel',{exact:true}).fill(password);
  await plain.getByRole('button',{name:'Ajouter le compte',exact:true}).click(); await plain.waitForURL('**/administration/comptes');
  await plain.getByRole('heading',{name:'TEST sans JavaScript',exact:true}).waitFor();
  await plainContext.close();
  console.log('Comptes : création, changement de rôle, lecture seule, refus directs et sans JavaScript réussis. 4 largeurs/texte 200 %, axe sans violation.');
} finally {
  await browser?.close();
  if (server.exitCode === null) {server.kill('SIGTERM');await new Promise(resolve=>server.once('exit',resolve));}
  await rm(dir,{recursive:true,force:true});
}
