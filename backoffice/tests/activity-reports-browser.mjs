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
const origin = 'http://127.0.0.1:8004';
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
const server=spawn(php,['-S','127.0.0.1:8004','-t','.',`${cwd}/vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php`],{cwd:`${cwd}/public`,env,stdio:'ignore'});
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
  await login(page,'create@example.test');
  await page.getByRole('link',{name:'Ouvrir les rapports',exact:true}).click();
  await page.getByRole('link',{name:'Ajouter un rapport',exact:true}).click();
  for(const width of [320,375,768,1440]) for(const font of ['', '200%']) {
    await page.setViewportSize({width,height:1000});await page.evaluate(font=>document.documentElement.style.fontSize=font,font);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Débordement à ${width}/${font}`);
  }
  await page.evaluate(()=>document.documentElement.style.fontSize='');
  await page.setViewportSize({width:375,height:1000});
  assert.deepEqual((await new AxeBuilder({page}).analyze()).violations,[]);
  await page.screenshot({path:'/tmp/geca-reports-create-mobile.png',fullPage:true});
  await page.getByLabel('Titre du rapport',{exact:true}).fill('TEST rapport, base jetable');
  await page.getByLabel('Date de début',{exact:true}).fill('2025-01-01');
  await page.getByLabel('Date de fin',{exact:true}).fill('2025-12-31');
  await page.getByLabel('Description (facultative)',{exact:true}).fill('Texte technique, aucun fait GECA.');
  await page.getByLabel('Choisir le rapport PDF',{exact:true}).setInputFiles(pdf);
  assert.equal(await page.locator('#start_date').getAttribute('type'),'date');
  assert.equal(await page.locator('#end_date').getAttribute('type'),'date');
  assert.notEqual(await page.locator('#start_date').getAttribute('required'),null);
  assert.notEqual(await page.locator('#end_date').getAttribute('required'),null);
  const csrf=await page.locator('main form [name=_token]').first().inputValue();
  assert.equal((await context.request.post(`${origin}/administration/rapports`,{form:{title:'TEST'},maxRedirects:0})).status(),419);
  await page.getByRole('button',{name:'Ajouter le rapport',exact:true}).click();await page.waitForURL('**/rapports/*/modifier');
  assert.equal(await page.locator('#start_date').inputValue(),'2025-01-01');
  assert.equal(await page.locator('#end_date').inputValue(),'2025-12-31');
  const editUrl=page.url(), id=editUrl.match(/rapports\/([^/]+)/)[1];
  const fileUrl=`${origin}/administration/rapports/${id}/telecharger`;
  const download=await context.request.get(fileUrl);
  assert.equal(download.status(),200);assert.ok(download.headers()['content-disposition'].startsWith('attachment;'));
  assert.equal((await context.request.get(`${origin}/storage/reports/${id}/document.pdf`)).status(),404);
  await page.getByLabel('Titre du rapport',{exact:true}).fill('TEST corrigé');
  await page.getByRole('button',{name:'Enregistrer les changements',exact:true}).click();await page.getByRole('status').waitFor();
  await page.getByLabel('Remplacer le PDF (facultatif)',{exact:true}).setInputFiles({name:'fake.pdf',mimeType:'application/pdf',buffer:Buffer.from('<?php echo 1;')});
  await page.getByRole('button',{name:'Enregistrer les changements',exact:true}).click();await page.getByRole('alert').waitFor();
  assert.equal(await page.locator('#document').getAttribute('aria-invalid'),'true');
  assert.equal(await page.locator('#title').inputValue(),'TEST corrigé');
  assert.deepEqual((await new AxeBuilder({page}).analyze()).violations,[]);
  await page.getByLabel('Remplacer le PDF (facultatif)',{exact:true}).setInputFiles(pdf);
  await page.getByRole('button',{name:'Enregistrer les changements',exact:true}).click();await page.getByRole('status').waitFor();
  await page.getByText('Retirer ce rapport de la liste',{exact:true}).click();
  await page.locator('#confirm').check();
  await page.getByRole('button',{name:'Retirer le rapport',exact:true}).click();await page.waitForURL('**/administration/rapports');
  await page.getByRole('link',{name:'Rapports retirés',exact:true}).click();
  assert.equal((await context.request.get(fileUrl)).status(),404);
  await page.getByRole('button',{name:'Restaurer',exact:false}).click();await page.waitForURL('**/administration/rapports');
  await page.setViewportSize({width:1440,height:1000});
  await page.screenshot({path:'/tmp/geca-reports-list-desktop.png',fullPage:true});
  assert.deepEqual((await new AxeBuilder({page}).analyze()).violations,[]);
  for(const width of [320,375,768,1440]) for(const font of ['', '200%']) {
    await page.setViewportSize({width,height:1000});await page.evaluate(font=>document.documentElement.style.fontSize=font,font);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:375,height:900}});
  const plain=await nojs.newPage();await login(plain,'nojs@example.test');
  await plain.goto(`${origin}/administration/rapports/ajouter`);
  await plain.getByLabel('Titre du rapport',{exact:true}).fill('TEST sans JavaScript');
  await plain.getByLabel('Date de début',{exact:true}).fill('2025-01-01');
  await plain.getByLabel('Date de fin',{exact:true}).fill('2025-12-31');
  await plain.getByLabel('Choisir le rapport PDF',{exact:true}).setInputFiles(pdf);
  await plain.getByRole('button',{name:'Ajouter le rapport',exact:true}).click();await plain.waitForURL('**/rapports/*/modifier');
  assert.equal((await nojs.request.get(await plain.getByRole('link',{name:'Télécharger le PDF actuel',exact:true}).getAttribute('href'))).status(),200);
  const anon=await browser.newContext();
  assert.equal((await anon.request.get(fileUrl,{maxRedirects:0})).status(),302);
  await page.goto(`${origin}/administration/rapports/ajouter`);
  await page.keyboard.press('Tab');
  assert.ok(await page.locator(':focus').count());
  console.log('Rapports : ajout/modification/remplacement/retrait/restauration/téléchargement privés, mauvais PDF, CSRF, anonyme, tailles 320/375/768/1440 et texte 200 %, axe et ajout sans JavaScript vérifiés sur base jetable.');
} finally {
  await browser?.close();
  if (server.exitCode === null) {server.kill('SIGTERM');await new Promise(resolve=>server.once('exit',resolve));}
  await rm(dir,{recursive:true,force:true});
}
