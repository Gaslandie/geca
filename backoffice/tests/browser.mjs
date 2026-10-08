import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { spawn, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdtemp, writeFile, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const cwd = fileURLToPath(new URL('..', import.meta.url));
const php = process.env.GECA_PHP || 'php';
const dir = await mkdtemp(`${tmpdir()}/geca-browser-`);
const password = randomBytes(32).toString('hex');
const env = {...process.env, APP_ENV:'local', APP_DEBUG:'false', APP_URL:'http://127.0.0.1:8001', DB_CONNECTION:'sqlite', DB_DATABASE:`${dir}/test.sqlite`, CACHE_STORE:'database', SESSION_DRIVER:'database', SESSION_SECURE_COOKIE:'false', GECA_TEST_PASSWORD:password};
env.LARAVEL_STORAGE_PATH=`${dir}/storage`;
env.GECA_MEDIA_UPLOADS_ENABLED='true';
env.GECA_NEWSLETTER_MODE='preview';
env.GECA_NEWSLETTER_ORIGINS='http://127.0.0.1:3000,http://127.0.0.1:8001';
for (const folder of ['app/private', 'framework/cache/data', 'framework/sessions', 'framework/views', 'logs']) await mkdir(`${env.LARAVEL_STORAGE_PATH}/${folder}`, {recursive:true});
env.APP_CONFIG_CACHE=`${dir}/config.php`;
env.APP_ROUTES_CACHE=`${dir}/routes.php`;
env.VIEW_COMPILED_PATH=`${dir}/views`;
await mkdir(env.VIEW_COMPILED_PATH);
await writeFile(env.DB_DATABASE, '', {mode:0o600});
function run(args) {
  const r = spawnSync(php, args, {cwd,env,encoding:'utf8'});
  if(r.status !== 0) throw new Error(`Commande de test échouée : ${args[0]}`);
}
async function checkAccessibility(page) {
  const {violations} = await new AxeBuilder({page}).analyze();
  assert.deepEqual(violations.map(v=>({id:v.id,help:v.help,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),[]);
}
run(['artisan','migrate','--no-interaction']);
run(['artisan','geca:import-reference']);
run(['-r', String.raw`require 'vendor/autoload.php'; $app=require 'bootstrap/app.php'; $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap(); $u=new App\Models\User; $u->name='Compte de test'; $u->email='browser@example.test'; $u->password=getenv('GECA_TEST_PASSWORD'); $u->is_admin=true; $u->is_active=true; $u->session_version=1; $u->save();`]);
// Serveur privé jetable : aucune modification du serveur public sur le port 3000.
const server=spawn(php,['artisan','serve','--host=127.0.0.1','--port=8001','--no-reload'],{cwd,env,stdio:'ignore',detached:true});
let browser;
try {
  let ready=false;
  for(let i=0;i<50;i++) {
    try { const r=await fetch('http://127.0.0.1:8001/connexion'); if(r.ok){ready=true;break;} } catch {}
    await new Promise(r=>setTimeout(r,200));
  }
  assert.ok(ready,'Serveur de test indisponible');
  browser=await chromium.launch({headless:true,executablePath:process.env.GECA_CHROME || '/usr/bin/google-chrome',chromiumSandbox:true});
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  const page=await context.newPage();
  page.setDefaultTimeout(15000);
  page.setDefaultNavigationTimeout(15000);
  await mkdir(`${cwd}/artifacts`,{recursive:true});
  await page.goto('http://127.0.0.1:8001/connexion');
  assert.equal((await page.locator('h1').textContent()).trim(),'Votre espace de gestion');
  const response=await context.request.post('http://127.0.0.1:8001/connexion',{form:{email:'browser@example.test',password}});
  assert.equal(response.status(),419,'POST sans jeton refusé');
  for(const width of [320,768,1440]) {
    await page.setViewportSize({width,height:1000});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await checkAccessibility(page);
    await page.screenshot({path:`${cwd}/artifacts/connexion-${width}.png`,fullPage:true});
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.getByLabel('Adresse e-mail').fill('browser@example.test');
  await page.getByLabel('Mot de passe',{exact:true}).fill(password);
  await page.getByRole('button',{name:'Se connecter',exact:true}).click();
  await page.waitForURL('**/connexion/double-verification');
  assert.equal((await context.request.get('http://127.0.0.1:8001/administration',{maxRedirects:0})).status(),302);
  assert.equal((await context.request.post('http://127.0.0.1:8001/connexion/double-verification',{form:{code:'123456'}})).status(),419);
  const mfaSecret=await page.locator('.mfa-secret code').textContent();
  const otp=spawnSync(php,['-r',String.raw`require 'vendor/autoload.php'; echo OTPHP\TOTP::createFromSecret(getenv('GECA_TEST_MFA_SECRET'))->now();`],{cwd,env:{...env,GECA_TEST_MFA_SECRET:mfaSecret},encoding:'utf8'});
  assert.equal(otp.status,0);
  for(const width of [320,768,1440]) {
    await page.setViewportSize({width,height:1000});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await checkAccessibility(page);
    await page.screenshot({path:`${cwd}/artifacts/mfa-activation-${width}.png`,fullPage:true,mask:[page.locator('.mfa-qr'),page.locator('.mfa-secret:visible')]});
  }
  for(const width of [320,1440]) {
    await page.setViewportSize({width,height:1000});
    await page.evaluate(()=>document.documentElement.style.fontSize='200%');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.evaluate(()=>document.documentElement.style.fontSize='');
  }
  // Générer le code juste avant la saisie, après les contrôles visuels.
  const freshOtp=spawnSync(php,['-r',String.raw`require 'vendor/autoload.php'; echo OTPHP\TOTP::createFromSecret(getenv('GECA_TEST_MFA_SECRET'))->now();`],{cwd,env:{...env,GECA_TEST_MFA_SECRET:mfaSecret},encoding:'utf8'});
  await page.getByLabel('Code Authenticator à six chiffres').fill(freshOtp.stdout.trim());
  await page.getByRole('button',{name:'Activer la double authentification'}).click();
  await page.waitForURL('**/codes-de-secours');
  const recoveryCodes=await page.locator('.mfa-codes code').allTextContents();
  assert.equal(recoveryCodes.length,10);
  for(const width of [320,1440]) {
    await page.setViewportSize({width,height:1000});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await checkAccessibility(page);
    await page.screenshot({path:`${cwd}/artifacts/mfa-secours-${width}.png`,fullPage:true,mask:[page.locator('.mfa-codes')]});
    await page.evaluate(()=>document.documentElement.style.fontSize='200%');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.evaluate(()=>document.documentElement.style.fontSize='');
  }
  await page.getByLabel('J’ai conservé mes codes de secours.').check();
  await page.getByRole('button',{name:'Accéder à mon espace'}).click();
  await page.waitForURL('**/administration');
  assert.deepEqual(await page.locator('.dashboard-count').allTextContents(),['7','9','8']);
  for (const width of [320,768,1440]) {
    await page.setViewportSize({width,height:1000});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    if(width < 1152) {
      assert.equal(await page.locator('.admin-sidebar').isVisible(),false);
      const summary=page.locator('.mobile-navigation > summary');
      await summary.focus();
      await page.keyboard.press('Enter');
      const nav=page.locator('.mobile-navigation .admin-navigation');
      assert.equal(await nav.isVisible(),true);
      assert.equal(await nav.locator('[aria-current="page"]').textContent().then(t=>t.trim()),'Accueil');
      await checkAccessibility(page);
      await page.screenshot({path:`${cwd}/artifacts/tableau-de-bord-menu-${width}.png`,fullPage:true});
      await summary.focus();
      await page.keyboard.press('Space');
      assert.equal(await nav.isVisible(),false);
    } else {
      const sidebar=await page.locator('.admin-sidebar').boundingBox();
      const main=await page.locator('#contenu').boundingBox();
      assert.ok(main.x >= sidebar.x+sidebar.width);
      assert.equal(await page.locator('.admin-sidebar [aria-current="page"]').textContent().then(t=>t.trim()),'Accueil');
      const siteLink=page.locator('.admin-sidebar .sidebar-action').first();
      assert.equal(await siteLink.getAttribute('rel'),'noopener noreferrer');
    }
    await checkAccessibility(page);
    await page.screenshot({path:`${cwd}/artifacts/tableau-de-bord-${width}.png`,fullPage:true});
  }
  for (const width of [320,1440]) {
    await page.setViewportSize({width,height:1000});
    await page.evaluate(()=>document.documentElement.style.fontSize='200%');
    assert.equal(await page.locator('.admin-sidebar').isVisible(),false);
    await page.locator('.mobile-navigation > summary').click();
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await checkAccessibility(page);
    await page.screenshot({path:`${cwd}/artifacts/tableau-de-bord-zoom-${width}.png`,fullPage:true});
    await page.locator('.mobile-navigation > summary').click();
    await page.evaluate(()=>document.documentElement.style.fontSize='');
  }
  await page.setViewportSize({width:1440,height:1000});
  await checkAccessibility(page);
  await page.screenshot({path:`${cwd}/artifacts/tableau-de-bord.png`,fullPage:true});
  await page.getByRole('link',{name:'Ouvrir les projets',exact:true}).click();
  assert.equal(await page.locator('.admin-sidebar [aria-current="page"]').textContent().then(t=>t.trim()),'Projets et programmes');
  await page.getByRole('link',{name:'Modifier le projet'}).first().click();
  await page.getByRole('button',{name:'Enregistrer les changements'}).scrollIntoViewIfNeeded();
  assert.ok(Math.abs((await page.locator('.admin-sidebar').boundingBox()).y) < 1,'Menu latéral visible pendant le défilement');
  const title=await page.locator('#fr-title').inputValue();
  assert.equal(await page.getByLabel('Ville, commune ou lieu du projet',{exact:true}).isVisible(),true);
  assert.equal(await page.locator('#en-title').isVisible(),false);
  assert.equal(await page.locator('#en-title').getAttribute('required'),null);
  const englishTitle=await page.locator('#en-title').inputValue();
  await page.getByLabel('Qu’avez-vous changé ?').fill('Contrôle technique local : texte conservé, aucun changement factuel.');
  await page.getByRole('button',{name:'Enregistrer les changements'}).click();
  await page.getByRole('status').waitFor();
  assert.equal(await page.locator('#fr-title').inputValue(),title);
  assert.equal(await page.locator('#en-title').inputValue(),englishTitle);
  for(const width of [320,1440]) {
    await page.setViewportSize({width,height:1000});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await checkAccessibility(page);
    await page.screenshot({path:`${cwd}/artifacts/brouillon-${width}.png`,fullPage:true});
  }
  await page.evaluate(()=>document.documentElement.style.fontSize='200%');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.evaluate(()=>document.documentElement.style.fontSize='');
  assert.equal(await page.getByRole('link',{name:'Photos',exact:true}).count(),0);
  assert.equal((await context.request.get('http://127.0.0.1:8001/administration/medias')).status(),404);
  await checkAccessibility(page);
  const sharp=(await import('sharp')).default;
  const photo=await sharp({create:{width:40,height:40,channels:3,background:'#176348'}}).png().toBuffer();
  await page.locator('#photo').setInputFiles({name:'fixture.png',mimeType:'image/png',buffer:photo});
  await page.getByLabel('Que montre la nouvelle photo ?', {exact:true}).fill('Image unie de test');
  await page.getByLabel('Qu’avez-vous changé ?', {exact:true}).fill('Ajout d’une photo de test au projet.');
  await page.getByRole('button',{name:'Enregistrer les changements'}).click();
  await page.getByRole('status').waitFor();
  const photoUrl=await page.locator('.entry-photo').getAttribute('src');
  assert.equal((await context.request.get(photoUrl)).status(),200);
  const anonymous=await browser.newContext();
  assert.equal((await anonymous.request.get(photoUrl,{maxRedirects:0})).status(),302);
  await anonymous.close();
  for (const width of [320,1440]) {
    await page.setViewportSize({width,height:1000});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await checkAccessibility(page);
    await page.screenshot({path:`${cwd}/artifacts/medias-${width}.png`,fullPage:true});
  }
  for (const [kind,action] of [['news','Modifier l’actualité'],['team','Modifier les informations']]) {
    await page.goto(`http://127.0.0.1:8001/administration/${kind}`);
    await page.getByRole('link',{name:action,exact:true}).first().click();
    await page.locator('#photo').setInputFiles({name:'fixture.png',mimeType:'image/png',buffer:photo});
    await page.locator('#alt_fr').fill('Image unie de test');
    await page.locator('#source_note').fill('Photo de test ajoutée dans cette rubrique.');
    await page.getByRole('button',{name:'Enregistrer les changements'}).click();
    await page.getByRole('status').waitFor();
    assert.equal((await context.request.get(await page.locator('.entry-photo').getAttribute('src'))).status(),200);
    for(const width of [320,1440]) {
      await page.setViewportSize({width,height:1000});
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      await checkAccessibility(page);
      await page.screenshot({path:`${cwd}/artifacts/photo-${kind}-${width}.png`,fullPage:true});
    }
  }
  // Le formulaire public ne remplace pas la session d’administration.
  assert.equal((await context.request.post('http://127.0.0.1:8001/newsletter/fr/commencer',{headers:{Origin:'http://127.0.0.1:3000'},form:{email:'session-check@example.test'}})).status(),200);
  assert.equal((await context.request.get('http://127.0.0.1:8001/administration/newsletter')).status(),200);
  // Newsletter interne sur base jetable ; jamais d’envoi réel.
  const subscriberContext=await browser.newContext({javaScriptEnabled:false,viewport:{width:375,height:900}});
  const subscriberPage=await subscriberContext.newPage();
  subscriberPage.setDefaultTimeout(15000);
  subscriberPage.setDefaultNavigationTimeout(15000);
  await subscriberPage.goto('http://127.0.0.1:3000/fr');
  assert.equal(await subscriberPage.locator('.newsletter-controls').getAttribute('action'),'http://127.0.0.1:8000/newsletter/fr/commencer');
  // Seule la destination de la page de test change vers le serveur/base jetables.
  await subscriberPage.locator('.newsletter-controls').evaluate(form=>form.action='http://127.0.0.1:8001/newsletter/fr/commencer');
  await subscriberPage.locator('#newsletter-email').fill('newsletter-browser@example.test');
  await subscriberPage.getByRole('button',{name:'S’abonner',exact:true}).click();
  await subscriberPage.getByRole('heading',{name:'Abonnez-vous à notre newsletter'}).waitFor();
  assert.equal(await subscriberPage.locator('#email').inputValue(),'newsletter-browser@example.test');
  await subscriberPage.locator('[name="consent"]').check();
  await subscriberPage.getByRole('button',{name:'S’abonner',exact:true}).click();
  await subscriberPage.getByRole('heading',{name:'Demande de test reçue'}).waitFor();
  await page.goto('http://127.0.0.1:8001/administration/newsletter');
  await page.getByRole('link',{name:'Voir le message de test'}).first().click();
  const confirmation=await page.getByRole('link',{name:'Ouvrir la confirmation de test'}).getAttribute('href');
  await subscriberPage.goto(confirmation);
  await subscriberPage.getByRole('button',{name:'Confirmer mon inscription'}).click();
  await subscriberPage.getByRole('heading',{name:'Inscription confirmée'}).waitFor();
  await page.goto('http://127.0.0.1:8001/administration/newsletter/nouvelle');
  await page.getByLabel('Objet',{exact:true}).fill('Vérification technique de la newsletter');
  await page.getByLabel('Message',{exact:true}).fill('Message de test. Aucun fait GECA ajouté.');
  await page.getByRole('button',{name:'Enregistrer le brouillon'}).click();
  await page.locator('[name="approve"]').check();
  const approvalResponse=page.waitForResponse(r=>r.url().endsWith('/preparer')&&r.request().method()==='POST');
  await page.getByRole('button',{name:'Préparer la simulation'}).click();
  assert.equal((await approvalResponse).status(),302);
  run(['artisan','geca:newsletter-process']);
  await page.goto('http://127.0.0.1:8001/administration/newsletter');
  for(const width of [320,768,1440]) {
    await page.setViewportSize({width,height:1000});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await checkAccessibility(page);
    await page.screenshot({path:`${cwd}/artifacts/newsletter-${width}.png`,fullPage:true});
  }
  await page.getByRole('link',{name:'Voir le message de test'}).first().click();
  const unsubscribeLink=page.getByRole('link',{name:'Ouvrir la désinscription de test'});
  if(await unsubscribeLink.count()===0) {
    await page.goto('http://127.0.0.1:8001/administration/newsletter');
    await page.getByRole('link',{name:'Voir le message de test'}).nth(1).click();
  }
  console.log('Newsletter : campagne simulée vérifiée.');
  await subscriberPage.goto(await page.getByRole('link',{name:'Ouvrir la désinscription de test'}).getAttribute('href'));
  console.log('Newsletter : page de désinscription ouverte.');
  const unsubscribeResponse=subscriberPage.waitForResponse(r=>r.request().method()==='POST');
  await subscriberPage.getByRole('button',{name:'Me désinscrire'}).click();
  assert.equal((await unsubscribeResponse).status(),200);
  await subscriberPage.getByRole('heading',{name:'Désinscription enregistrée'}).waitFor();
  console.log('Newsletter : désinscription sans JavaScript réussie.');
  const accessiblePublic=await browser.newContext({viewport:{width:375,height:900}});
  const publicPage=await accessiblePublic.newPage();
  for(const locale of ['fr','en']) {
    await publicPage.goto(`http://127.0.0.1:8001/newsletter/${locale}`);
    await checkAccessibility(publicPage);
    await publicPage.evaluate(()=>document.documentElement.style.fontSize='200%');
    assert.ok(await publicPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await publicPage.screenshot({path:`${cwd}/artifacts/newsletter-public-${locale}.png`,fullPage:true});
  }
  await accessiblePublic.close();
  await subscriberContext.close();
  run(['-r',String.raw`require 'vendor/autoload.php'; $app=require 'bootstrap/app.php'; $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap(); App\Models\User::where('email','browser@example.test')->update(['is_active'=>false]);`]);
  const revoked=await page.reload();
  assert.equal(revoked.status(),403,'Session révoquée refusée au navigateur');
  await context.close();
  const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:800}});
  const p=await nojs.newPage();
  p.setDefaultTimeout(15000);
  p.setDefaultNavigationTimeout(15000);
  await p.goto('http://127.0.0.1:8001/connexion');
  await p.getByRole('button',{name:'Se connecter',exact:true}).click();
  await p.locator('#email-error').waitFor();
  assert.equal(await p.locator('.errors').count(),0);
  assert.equal(await p.locator('#email').getAttribute('aria-describedby'),'email-error');
  assert.equal(await p.locator('#password').getAttribute('aria-describedby'),'password-error');
  assert.equal(await p.evaluate(()=>document.activeElement.id),'email');
  for (const id of ['email','password']) {
    const field=await p.locator(`#${id}`).boundingBox();
    const error=await p.locator(`#${id}-error`).boundingBox();
    assert.ok(error.y >= field.y+field.height,'Erreur sous le champ');
  }
  await p.getByLabel('Adresse e-mail').fill('adresse-invalide');
  await p.getByLabel('Mot de passe',{exact:true}).fill('invalid-password');
  await p.getByRole('button',{name:'Se connecter',exact:true}).click();
  await p.locator('#email-error').waitFor();
  assert.equal(await p.locator('#password-error').count(),0);
  await p.getByLabel('Adresse e-mail').fill('absent@example.test');
  await p.getByLabel('Mot de passe',{exact:true}).fill('invalid-password');
  await p.getByRole('button',{name:'Se connecter',exact:true}).click();
  await p.getByRole('alert').waitFor();
  assert.equal(await p.locator('.errors').count(),0);
  assert.equal(await p.locator('#password').inputValue(),'');
  assert.equal(await p.locator('#email').inputValue(),'absent@example.test');
  assert.equal(await p.locator('#password').getAttribute('aria-describedby'),'credentials-error');
  assert.equal(await p.evaluate(()=>document.activeElement.id),'password');
  for (const width of [320,1440]) {
    await p.setViewportSize({width,height:1000});
    assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    const field=await p.locator('#password').boundingBox();
    const error=await p.locator('#credentials-error').boundingBox();
    assert.ok(error.y >= field.y+field.height);
    await p.screenshot({path:`${cwd}/artifacts/connexion-erreur-${width}.png`,fullPage:true});
  }
  await p.setViewportSize({width:320,height:1000});
  await p.evaluate(()=>document.documentElement.style.fontSize='200%');
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  // Compte jetable réactivé seulement pour vérifier le menu sans JavaScript.
  run(['-r',String.raw`require 'vendor/autoload.php'; $app=require 'bootstrap/app.php'; $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap(); App\Models\User::where('email','browser@example.test')->update(['is_active'=>true]);`]);
  await p.evaluate(()=>document.documentElement.style.fontSize='');
  await p.getByLabel('Adresse e-mail').fill('browser@example.test');
  await p.getByLabel('Mot de passe',{exact:true}).fill(password);
  await p.getByRole('button',{name:'Se connecter',exact:true}).click();
  console.log('MFA sans JavaScript : destination après mot de passe',p.url());
  await p.waitForURL('**/connexion/double-verification');
  await p.getByText('Utiliser un code de secours',{exact:true}).click();
  await p.getByLabel('Code de secours',{exact:true}).fill(recoveryCodes[0]);
  await p.getByRole('button',{name:'Confirmer avec ce code de secours'}).click();
  console.log('MFA sans JavaScript : destination après secours',p.url());
  await p.waitForURL('**/administration');
  await p.locator('.mobile-navigation > summary').click();
  await p.locator('.mobile-navigation').getByRole('link',{name:'Équipe',exact:true}).click();
  await p.waitForURL('**/administration/team');
  await p.locator('.mobile-navigation > summary').click();
  assert.equal(await p.locator('.mobile-navigation [aria-current="page"]').textContent().then(t=>t.trim()),'Équipe');
  await p.locator('.mobile-navigation > summary').click();
  await p.getByRole('link',{name:'Modifier les informations',exact:true}).first().click();
  await p.locator('#photo').setInputFiles({name:'fixture.png',mimeType:'image/png',buffer:photo});
  await p.locator('#alt_fr').fill('Image unie de test');
  await p.locator('#source_note').fill('Photo de test ajoutée sans JavaScript.');
  await p.getByRole('button',{name:'Enregistrer les changements'}).click();
  await p.getByRole('status').waitFor();
  assert.equal((await nojs.request.get(await p.locator('.entry-photo').getAttribute('src'))).status(),200);
  await p.goto('http://127.0.0.1:8001/administration/securite');
  await p.getByLabel('Mot de passe actuel').fill(password);
  await p.getByLabel('Code Authenticator ou code de secours inutilisé').fill(recoveryCodes[1]);
  await p.getByRole('button',{name:'Créer mes nouveaux codes'}).click();
  assert.equal(await p.locator('.mfa-codes code').count(),10);
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await p.screenshot({path:`${cwd}/artifacts/mfa-secours-sans-js.png`,fullPage:true,mask:[p.locator('.mfa-codes')]});
  // axe a besoin d'exécuter du JavaScript ; contrôle séparé avec la même session jetable.
  const auditContext=await browser.newContext({storageState:await nojs.storageState(),viewport:{width:320,height:1000}});
  const auditPage=await auditContext.newPage();
  await auditPage.goto('http://127.0.0.1:8001/administration/securite');
  await checkAccessibility(auditPage);
  await auditContext.close();
  await p.locator('.mobile-navigation > summary').click();
  await p.getByRole('button',{name:'Se déconnecter',exact:true}).click();
  await p.waitForURL('**/connexion');
  await p.goto('http://127.0.0.1:8001/administration');
  await p.waitForURL('**/connexion');
  await nojs.close();
  console.log('Navigateur : activation MFA, codes de secours et régénération sans JavaScript, connexion, CSRF réel, brouillon, médias privés, révocation, 320/768/1440 px, 200 %, accessibilité automatique et sans JavaScript : réussis.');
} finally {
  if(browser) await browser.close();
  try { process.kill(-server.pid,'SIGTERM'); } catch {}
  await rm(dir,{recursive:true,force:true});
}
