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
// Régression explicite de l'ancien mode ; email-browser.mjs couvre le mode demandé.
env.GECA_LOGIN_VERIFICATION='authenticator';
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
function contentSnapshot(entryId) {
  const result=spawnSync(php,['-r',String.raw`require 'vendor/autoload.php'; $app=require 'bootstrap/app.php'; $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap(); $entry=App\Models\ContentEntry::withTrashed()->findOrFail(getenv('GECA_TEST_ENTRY_ID')); $revision=Illuminate\Support\Facades\DB::table('content_revisions')->where('content_entry_id',$entry->id)->orderByDesc('revision')->first(); echo json_encode(['source'=>$entry->source_payload,'draft'=>$entry->draft_payload,'revision'=>$entry->revision,'deletedAt'=>$entry->deleted_at?->toIso8601String(),'deletionBatch'=>$entry->deletion_batch,'deletedBy'=>$entry->deleted_by,'history'=>$revision ? json_decode($revision->payload,true) : null,'linkedNewsId'=>$entry->kind==='projects' ? App\Models\ContentEntry::withTrashed()->where('source_key','projet-'.$entry->source_key)->value('id') : null],JSON_THROW_ON_ERROR);`],{cwd,env:{...env,GECA_TEST_ENTRY_ID:String(entryId)},encoding:'utf8'});
  assert.equal(result.status,0,'Relecture indépendante de la base de test');
  return JSON.parse(result.stdout);
}
async function checkAccessibility(page) {
  const {violations} = await new AxeBuilder({page}).analyze();
  assert.deepEqual(violations.map(v=>({id:v.id,help:v.help,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),[]);
  if(await page.locator('.admin-shell').count()) {
    const alignment=await page.evaluate(()=>{
      const visible=element=>element.getClientRects().length>0;
      const center=element=>{const box=element.getBoundingClientRect();return box.x+box.width/2;};
      const headings=[...document.querySelectorAll('main h1,main h2,main h3')].filter(visible).flatMap(element=>{
        const range=document.createRange();range.selectNodeContents(element);
        return [...range.getClientRects()].filter(box=>box.width>0).map(box=>Math.abs(box.x+box.width/2-center(element)));
      });
      const actions=[...document.querySelectorAll('main .actions')].filter(visible).map(group=>{
        const boxes=[...group.children].filter(visible).map(element=>element.getBoundingClientRect());
        return boxes.length ? Math.abs((Math.min(...boxes.map(box=>box.x))+Math.max(...boxes.map(box=>box.right)))/2-center(group)) : 0;
      });
      const buttons=[...document.querySelectorAll('main form > button')].filter(visible).map(button=>Math.abs(center(button)-center(button.parentElement)));
      const padding=[...document.querySelectorAll('main .card')].filter(visible).map(card=>{const style=getComputedStyle(card);return [style.paddingTop,style.paddingRight,style.paddingBottom,style.paddingLeft];});
      return {headings,actions,buttons,padding};
    });
    assert.ok(alignment.headings.every(offset=>offset<1.5),'Titres centrés, y compris ceux répartis sur plusieurs lignes');
    assert.ok(alignment.actions.every(offset=>offset<1.5),'Groupes d’actions centrés');
    assert.ok(alignment.buttons.every(offset=>offset<1.5),'Boutons de formulaire centrés');
    assert.ok(alignment.padding.every(values=>values.every(value=>value===alignment.padding[0][0])),'Marges intérieures communes aux cartes');
  }
}
async function expectPhotoPreview(page, file, width, height) {
  await page.locator('#photo').setInputFiles(file);
  await page.waitForFunction(({width,height})=>{
    const image=document.querySelector('[data-photo-preview-image]');
    return !image.hidden && image.complete && image.naturalWidth===width && image.naturalHeight===height;
  },{width,height});
  assert.equal(await page.locator('#photo-preview-status').textContent(),'Nouvelle photo — à enregistrer.');
  if(await page.locator('[data-photo-current]').count()) assert.equal(await page.locator('[data-photo-current]').isVisible(),false,'Un seul portrait visible avant confirmation');
  assert.equal(await page.locator('#photo').evaluate(el=>el.validity.valid),true);
}
async function checkCentralTheme(page) {
  const styles=await page.locator('link[rel=stylesheet]').evaluateAll(links=>links.map(link=>new URL(link.href).pathname));
  assert.deepEqual(styles,['/admin-theme.css','/admin.css'],'Thème commun chargé avant les composants');
  const propagated=await page.evaluate(async()=>{
    const sheet=[...document.styleSheets].find(sheet=>sheet.href && new URL(sheet.href).pathname==='/admin-theme.css');
    const index=sheet.insertRule('[data-admin-theme] { --green:#1f4a76; --radius-panel:2px; --radius-control:4px; --shadow-card:none; --space:24px; --font-family:Arial,sans-serif; }',sheet.cssRules.length);
    try {
      // Mesurer après la transition de couleur réelle, sans la désactiver.
      await new Promise(resolve=>setTimeout(resolve,300));
      const visible=element=>element.getClientRects().length>0;
      const cards=[...document.querySelectorAll('main .card')].filter(visible).map(element=>{
        const style=getComputedStyle(element);
        return {radius:style.borderRadius,padding:style.padding,shadow:style.boxShadow};
      });
      const controls=[...document.querySelectorAll('main .button,main button,main input:not([type=checkbox]):not([type=hidden]),main textarea,main select')].filter(visible).map(element=>getComputedStyle(element).borderRadius);
      const links=[...document.querySelectorAll('.admin-navigation a[aria-current=page],main .dashboard-link')].filter(visible).map(element=>getComputedStyle(element).color);
      return {cards,controls,links,font:getComputedStyle(document.body).fontFamily};
    } finally { sheet.deleteRule(index); }
  });
  assert.ok(propagated.cards.length>0);
  assert.ok(propagated.cards.every(card=>card.radius==='2px' && card.padding==='24px' && card.shadow==='none'),'Un réglage commun change toutes les cartes');
  assert.ok(propagated.controls.every(radius=>radius==='4px'),'Commandes et champs suivent le thème');
  assert.ok(propagated.links.every(color=>color==='rgb(31, 74, 118)'),'Liens et navigation suivent la couleur commune');
  assert.equal(propagated.font,'Arial, sans-serif');
}
async function openTrash(page) {
  const menu = page.getByRole('button', {name:'Menu', exact:true});
  if (await menu.isVisible()) await menu.click();
  await page.getByRole('link', {name:'Corbeille', exact:true}).click();
  await page.waitForURL('**/administration/corbeille');
}
async function openNewsletterMessages(page) {
  const details=page.locator('.newsletter-tracking');
  if(await details.getAttribute('open')===null) {
    await details.locator('summary').focus();
    await page.keyboard.press('Enter');
  }
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
  await checkCentralTheme(page);
  await page.goto('http://127.0.0.1:8001/administration/newsletter');
  assert.equal(await page.locator('.newsletter-mode').textContent(),'Mode test · aucun e-mail envoyé.');
  assert.equal(await page.locator('.newsletter-tracking').getAttribute('open'),null);
  assert.equal(await page.getByRole('button',{name:'Lancer le test',exact:true}).count(),0,'Pas d’action de test inutile sur liste vide');
  assert.equal(await page.getByRole('link',{name:'Voir le formulaire d’inscription',exact:true}).getAttribute('href'),'http://127.0.0.1:8001/newsletter/fr');
  for(const width of [320,375,768,1440]) {
    await page.setViewportSize({width,height:1000});
    for(const size of ['', '200%']) {
      await page.evaluate(size=>document.documentElement.style.fontSize=size,size);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Newsletter simplifiée sans débordement');
    }
    await page.evaluate(()=>document.documentElement.style.fontSize='');
    await checkAccessibility(page);
    if([375,1440].includes(width)) await page.screenshot({path:`${cwd}/artifacts/newsletter-vide-${width}.png`,fullPage:true});
  }
  await page.goto('http://127.0.0.1:8001/administration');
  for (const width of [320,375,768,1024,1440]) {
    await page.setViewportSize({width,height:1000});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    if(width < 1152) {
      assert.equal(await page.locator('.admin-sidebar').isVisible(),false);
      const trigger=page.locator('.mobile-menu-trigger');
      await trigger.focus();
      const before=await page.locator('#contenu').boundingBox();
      await page.keyboard.press('Enter');
      assert.equal(await page.evaluate(()=>document.activeElement.matches('.mobile-menu-close')),true,'Focus sur la fermeture du menu');
      assert.equal(await page.locator('.mobile-navigation').evaluate(el=>el.matches(':modal')),true,'Menu modal natif');
      assert.deepEqual(await page.locator('.mobile-navigation').boundingBox(),{x:0,y:0,width,height:1000},'Menu sur toute la surface');
      const nav=page.locator('.mobile-navigation .admin-navigation');
      assert.equal(await nav.isVisible(),true);
      assert.equal(await nav.locator('[aria-current="page"]').textContent().then(t=>t.trim()),'Accueil');
      assert.deepEqual(await page.locator('#contenu').boundingBox(),before,'Le menu ne déplace pas le dashboard');
      const panel=page.locator('.mobile-navigation-content');
      const panelBox=await panel.boundingBox();
      assert.ok(panelBox.y+panelBox.height <= 1000,'Menu borné à la hauteur de l’écran');
      await panel.getByRole('button',{name:'Se déconnecter',exact:true}).focus();
      await page.keyboard.press('Tab');
      const tabState=await page.evaluate(()=>({tag:document.activeElement.tagName,id:document.activeElement.id,classes:document.activeElement.className,pageFocused:document.hasFocus(),inMenu:document.activeElement.closest('.mobile-navigation')!==null}));
      assert.ok(tabState.inMenu || (!tabState.pageFocused && tabState.tag==='BODY'),`Tab ne rejoint pas le contenu derrière : ${JSON.stringify(tabState)}`);
      await page.locator('.mobile-menu-close').focus();
      await page.keyboard.press('Shift+Tab');
      const reverseTabState=await page.evaluate(()=>({tag:document.activeElement.tagName,pageFocused:document.hasFocus(),inMenu:document.activeElement.closest('.mobile-navigation')!==null}));
      assert.ok(reverseTabState.inMenu || (!reverseTabState.pageFocused && reverseTabState.tag==='BODY'),`Maj+Tab ne rejoint pas le contenu derrière : ${JSON.stringify(reverseTabState)}`);
      await page.locator('.mobile-menu-close').focus();
      await page.locator('#contenu').evaluate(el=>el.focus());
      assert.equal(await page.evaluate(()=>document.activeElement.matches('.mobile-menu-close')),true,'Le contenu derrière ne peut pas recevoir le focus');
      assert.ok(await panel.evaluate(el=>el.scrollTop > 0 || el.scrollHeight <= el.clientHeight),'Fin du menu accessible par défilement interne');
      await checkAccessibility(page);
      await page.screenshot({path:`${cwd}/artifacts/tableau-de-bord-menu-${width}.png`});
      await page.keyboard.press('Escape');
      assert.equal(await nav.isVisible(),false);
      assert.equal(await trigger.evaluate(el=>el===document.activeElement),true,'Échap rend le focus au bouton Menu');
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
  // Petits écrans et paysage : tout le menu reste accessible sans pousser le contenu.
  for (const viewport of [{width:320,height:568},{width:927,height:835},{width:640,height:360}]) {
    await page.setViewportSize(viewport);
    for (const fontSize of ['', '200%']) {
      await page.evaluate(size=>{document.documentElement.style.fontSize=size;scrollTo(0,0);},fontSize);
      const trigger=page.locator('.mobile-menu-trigger');
      await trigger.focus();
      const before=await page.locator('#contenu').boundingBox();
      await page.keyboard.press('Enter');
      assert.deepEqual(await page.locator('.mobile-navigation').boundingBox(),{x:0,y:0,...viewport},'Plein écran en paysage et à 200 %');
      assert.deepEqual(await page.locator('#contenu').boundingBox(),before,'Contenu stable sur écran court');
      const panel=page.locator('.mobile-navigation-content');
      const box=await panel.boundingBox();
      assert.ok(box.y+box.height <= viewport.height,'Menu contenu dans un écran court');
      const logout=panel.getByRole('button',{name:'Se déconnecter',exact:true});
      await logout.focus();
      const last=await logout.boundingBox();
      const visible=await panel.boundingBox();
      // Le défilement natif arrondit au pixel, les mesures gardent leurs fractions.
      assert.ok(last.y >= visible.y-1 && last.y+last.height <= visible.y+visible.height+1,`Dernière commande visible au focus : ${JSON.stringify({viewport,fontSize,last,visible})}`);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      await page.locator('.mobile-menu-close').focus();
      await page.keyboard.press('Space');
      assert.equal(await page.locator('.mobile-navigation').isVisible(),false);
      assert.equal(await trigger.evaluate(el=>el===document.activeElement),true);
    }
    await page.evaluate(()=>document.documentElement.style.fontSize='');
  }
  for (const width of [320,1440]) {
    await page.setViewportSize({width,height:1000});
    await page.evaluate(()=>document.documentElement.style.fontSize='200%');
    assert.equal(await page.locator('.admin-sidebar').isVisible(),false);
    const before=await page.locator('#contenu').boundingBox();
    await page.locator('.mobile-menu-trigger').click();
    assert.deepEqual(await page.locator('#contenu').boundingBox(),before,'Le menu ne déplace pas le dashboard à 200 %');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await checkAccessibility(page);
    await page.screenshot({path:`${cwd}/artifacts/tableau-de-bord-zoom-${width}.png`});
    await page.locator('.mobile-menu-close').click();
    await page.evaluate(()=>document.documentElement.style.fontSize='');
  }
  await page.setViewportSize({width:1440,height:1000});
  await checkAccessibility(page);
  await page.screenshot({path:`${cwd}/artifacts/tableau-de-bord.png`,fullPage:true});
  await page.getByRole('link',{name:'Ouvrir les projets',exact:true}).click();
  assert.equal(await page.locator('.admin-sidebar [aria-current="page"]').textContent().then(t=>t.trim()),'Projets et programmes');
  // Titres courts et longs doivent conserver la même place pour l’action Modifier.
  for (const kind of ['projects','news','team']) {
    await page.goto(`http://127.0.0.1:8001/administration/${kind}`);
    for (const width of [320,375,768,927,1024,1440]) {
      await page.setViewportSize({width,height:1000});
      for (const fontSize of ['', '200%']) {
        await page.evaluate(size=>document.documentElement.style.fontSize=size,fontSize);
        const boxes=await page.locator('.entry').evaluateAll(cards=>cards.map(card=>{
          const rect=element=>{const {x,y,width,height}=element.getBoundingClientRect();return {x,y,width,height};};
          return {card:rect(card),text:rect(card.querySelector(':scope > div')),button:rect(card.querySelector(':scope > .button'))};
        }));
        assert.ok(boxes.length>0);
        const compact=await page.evaluate(()=>document.querySelector('.admin-shell').getBoundingClientRect().width < 48*parseFloat(getComputedStyle(document.documentElement).fontSize));
        for (const {card,text,button} of boxes) {
          assert.ok(button.x >= card.x && button.x+button.width <= card.x+card.width,'Commande contenue dans sa carte');
          if (compact) {
            assert.ok(Math.abs(button.x+button.width/2-(card.x+card.width/2))<1,'Commande centrée sur mobile et texte agrandi');
            assert.ok(button.y >= text.y+text.height+19,'Commande sous le texte');
          } else {
            assert.ok(button.x >= text.x+text.width+19,'Commande à droite même si le titre est long');
            assert.ok(Math.abs(button.x+button.width-(boxes[0].button.x+boxes[0].button.width))<1,'Bords droits alignés dans toute la liste');
          }
        }
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
        if(width===1440 && !fontSize) await checkAccessibility(page);
        if(kind==='projects' && [375,927].includes(width) && !fontSize) await page.screenshot({path:`${cwd}/artifacts/liste-projets-${width}.png`,fullPage:true});
      }
      await page.evaluate(()=>document.documentElement.style.fontSize='');
    }
  }
  await page.setViewportSize({width:1440,height:1000});
  for (const [kind,action] of [['projects','Modifier le projet'],['news','Modifier l’actualité'],['team','Modifier les informations']]) {
    await page.goto(`http://127.0.0.1:8001/administration/${kind}`);
    await page.getByRole('link',{name:action,exact:true}).first().click();
    const editUrl=page.url();
    const entryId=Number(editUrl.split('/').at(-2));
    const original=contentSnapshot(entryId);
    assert.equal(original.draft,null);
    const english=page.locator('.english-version');
    if(await english.getAttribute('open')===null) await english.locator('summary').click();
    const expected={fr:{},en:{}};
    for(const locale of ['fr','en']) {
      for(const field of await page.locator(`[name^="payload[${locale}]"]`).all()) {
        const key=(await field.getAttribute('name')).match(/\[([^\]]+)\]$/)[1];
        expected[locale][key]=`${await field.inputValue()} [contrôle ${kind} ${locale} ${key}]`;
        await field.fill(expected[locale][key]);
      }
    }
    await page.locator('#source_note').fill('Changements techniques sur base jetable, sans publication.');
    await page.getByRole('button',{name:'Enregistrer les changements'}).click();
    await page.getByRole('status').waitFor();
    assert.equal((await page.getByRole('status').textContent()).trim(),'Vos changements sont enregistrés.');
    const saved=contentSnapshot(entryId);
    assert.deepEqual(saved.draft,expected,'Tous les champs FR/EN réellement stockés');
    assert.deepEqual(saved.history,expected,'Version enregistrée dans l’historique');
    assert.deepEqual(saved.source,original.source,'Origine conservée intacte');
    assert.equal(saved.revision,1);
    await page.goto(`http://127.0.0.1:8001/administration/${kind}`);
    const title=expected.fr.title || expected.fr.name;
    await page.getByRole('heading',{name:title,exact:true,level:2}).waitFor();
    await page.locator('.entry').filter({has:page.getByRole('heading',{name:title,exact:true})}).getByRole('link',{name:action,exact:true}).click();
    await page.reload();
    for(const locale of ['fr','en']) for(const [key,value] of Object.entries(expected[locale])) assert.equal(await page.locator(`#${locale}-${key}`).inputValue(),value,'Valeur conservée après réouverture et rechargement');
    const reopened=await browser.newContext({storageState:await context.storageState()});
    const reopenedPage=await reopened.newPage();
    await reopenedPage.goto(editUrl);
    for(const locale of ['fr','en']) for(const [key,value] of Object.entries(expected[locale])) assert.equal(await reopenedPage.locator(`#${locale}-${key}`).inputValue(),value,'Valeur relue dans un nouveau contexte navigateur');
    await reopened.close();
    if(saved.linkedNewsId) {
      await page.goto(`http://127.0.0.1:8001/administration/news/${saved.linkedNewsId}/modifier`);
      assert.equal(await page.locator('h1').textContent(),title,'Titre de l’actualité synchronisé avec le projet');
      assert.equal(await page.locator('#fr-title').inputValue(),title);
      await page.goto('http://127.0.0.1:8001/administration/news');
      await page.getByRole('heading',{name:title,exact:true,level:2}).waitFor();
    }
    console.log(`Modification ${kind} : tous les champs FR/EN, stockage, historique et réouverture vérifiés.`);
  }
  await page.goto('http://127.0.0.1:8001/administration/projects');
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
  await checkCentralTheme(page);
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
  const jpeg=await sharp(photo).resize(36,24).jpeg().toBuffer();
  const webp=await sharp(photo).resize(28,20).webp().toBuffer();
  const previewEntryId=Number(page.url().split('/').at(-2));
  const beforePreview=contentSnapshot(previewEntryId);
  const previewRequests=[];
  const recordPreviewRequest=request=>{if(/^https?:/.test(request.url())) previewRequests.push(request.url());};
  page.on('request',recordPreviewRequest);
  // Le fichier reste local ; JPEG, PNG et WebP sont visibles sans soumission.
  for(const [file,width,height] of [
    [{name:'fixture.png',mimeType:'image/png',buffer:photo},40,40],
    [{name:'fixture.jpg',mimeType:'image/jpeg',buffer:jpeg},36,24],
    [{name:'fixture.webp',mimeType:'image/webp',buffer:webp},28,20],
  ]) await expectPhotoPreview(page,file,width,height);
  const selectedUrl=await page.locator('[data-photo-preview-image]').getAttribute('src');
  assert.ok(selectedUrl.startsWith('blob:'),'Aperçu issu du fichier local');
  await page.getByRole('button',{name:'Annuler le choix de la photo'}).click();
  assert.equal(await page.locator('#photo').inputValue(),'');
  assert.equal(await page.locator('[data-photo-preview-panel]').isVisible(),false);
  assert.equal(await page.evaluate(()=>document.activeElement.id),'photo');
  assert.equal(await page.evaluate(async url=>{try{await fetch(url);return true;}catch{return false;}},selectedUrl),false,'Adresse locale libérée à l’annulation');
  const excessive=Buffer.from(photo);
  excessive.writeUInt32BE(6001,16);
  for(const file of [
    {name:'interdit.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>')},
    {name:'faux.jpg',mimeType:'image/jpeg',buffer:photo},
    {name:'trop-lourd.png',mimeType:'image/png',buffer:Buffer.alloc(6*1024*1024+1)},
    {name:'trop-grand.png',mimeType:'image/png',buffer:excessive},
    {name:'illisible.png',mimeType:'image/png',buffer:photo.subarray(0,8)},
  ]) {
    await page.locator('#photo').setInputFiles(file);
    await page.waitForFunction(()=>document.getElementById('photo').getAttribute('aria-invalid')==='true');
    assert.equal(await page.locator('[data-photo-preview-image]').isVisible(),false);
    assert.equal(await page.locator('#photo').evaluate(el=>el.validity.valid),false);
    await checkAccessibility(page);
    await page.getByRole('button',{name:'Annuler le choix de la photo'}).click();
  }
  assert.deepEqual(previewRequests,[],'Aucun envoi HTTP lors du choix ou de l’annulation');
  page.off('request',recordPreviewRequest);
  assert.deepEqual(contentSnapshot(previewEntryId),beforePreview,'Aucune écriture en base avant validation');
  // Un script sans autorisation reste bloqué malgré l’aperçu autorisé.
  await page.evaluate(()=>{const script=document.createElement('script');script.textContent='window.gecaUnsafePreview=true';document.head.append(script);});
  assert.equal(await page.evaluate(()=>window.gecaUnsafePreview),undefined);
  await expectPhotoPreview(page,{name:'fixture.png',mimeType:'image/png',buffer:photo},40,40);
  for(const width of [320,375,1440]) {
    await page.setViewportSize({width,height:1000});
    for(const size of ['', '200%']) {
      await page.evaluate(size=>document.documentElement.style.fontSize=size,size);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Aperçu sans débordement');
    }
    await page.evaluate(()=>document.documentElement.style.fontSize='');
    await checkAccessibility(page);
    await page.locator('.entry-photo-fields').screenshot({path:`${cwd}/artifacts/apercu-photo-${width}.png`});
  }
  await page.getByLabel('Qu’avez-vous changé ?', {exact:true}).fill('Ajout d’une photo de test au projet.');
  await page.getByRole('button',{name:'Enregistrer les changements'}).click();
  await page.getByRole('status').waitFor();
  const photoUrl=await page.locator('.entry-photo').getAttribute('src');
  assert.equal((await context.request.get(photoUrl)).status(),200);
  const replacement=await sharp({create:{width:48,height:32,channels:3,background:'#ebad0e'}}).png().toBuffer();
  await expectPhotoPreview(page,{name:'replacement.png',mimeType:'image/png',buffer:replacement},48,32);
  assert.equal(await page.locator('.entry-photo').getAttribute('src'),photoUrl,'La photo enregistrée reste intacte avant validation');
  await page.locator('#source_note').fill('Remplacement technique de la photo sur base jetable.');
  await page.getByRole('button',{name:'Enregistrer les changements'}).click();
  await page.getByRole('status').waitFor();
  const replacedUrl=await page.locator('.entry-photo').getAttribute('src');
  assert.notEqual(replacedUrl,photoUrl,'Nouvelle photo effectivement affectée');
  await page.reload();
  assert.equal(await page.locator('.entry-photo').getAttribute('src'),replacedUrl,'Nouvelle photo conservée après rechargement');
  assert.equal((await context.request.get(replacedUrl)).status(),200);
  assert.equal((await context.request.get(photoUrl)).status(),200,'Ancienne photo conservée pour l’historique privé');
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
    await expectPhotoPreview(page,{name:'fixture.png',mimeType:'image/png',buffer:photo},40,40);
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
  // Suppression réversible des trois rubriques, sur base jetable uniquement.
  for(const [kind,editAction,deleteAction] of [
    ['projects','Modifier le projet','Supprimer le projet'],
    ['news','Modifier l’actualité','Supprimer l’actualité'],
    ['team','Modifier les informations','Supprimer la fiche du membre'],
  ]) {
    const base=`http://127.0.0.1:8001/administration/${kind}`;
    await page.goto(base);
    await page.getByRole('link',{name:editAction,exact:true}).first().click();
    const editUrl=page.url();
    const id=Number(new URL(editUrl).pathname.split('/')[3]);
    const before=contentSnapshot(id);
    const linkedBefore=before.linkedNewsId ? contentSnapshot(before.linkedNewsId) : null;
    const privatePhoto=await page.locator('.entry-photo').getAttribute('src');
    await page.getByRole('link',{name:deleteAction,exact:true}).click();
    assert.deepEqual(contentSnapshot(id),before,'Ouvrir la confirmation ne supprime rien');
    if(linkedBefore) await page.getByText('actualité(s) liée(s)',{exact:false}).waitFor();
    await page.getByRole('link',{name:'Annuler',exact:true}).click();
    assert.equal(page.url(),editUrl);
    assert.deepEqual(contentSnapshot(id),before,'Annuler conserve la fiche');
    await page.getByRole('link',{name:deleteAction,exact:true}).click();
    await page.getByRole('button',{name:'Confirmer la suppression',exact:true}).click();
    assert.equal(await page.locator('[name=confirm]').evaluate(el=>el.validity.valid),false);
    assert.deepEqual(contentSnapshot(id),before,'Confirmation obligatoire');
    for(const width of [320,1440]) {
      await page.setViewportSize({width,height:1000});
      await checkAccessibility(page);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      if(kind==='projects') await page.screenshot({path:`${cwd}/artifacts/suppression-${width}.png`,fullPage:true});
    }
    await page.evaluate(()=>document.documentElement.style.fontSize='200%');
    await checkAccessibility(page);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.evaluate(()=>document.documentElement.style.fontSize='');
    const refused=await context.request.delete(base+'/'+id,{form:{revision:String(before.revision),confirm:'1',deletion_state:await page.locator('[name=deletion_state]').inputValue()},maxRedirects:0});
    assert.equal(refused.status(),419,'Suppression sans CSRF refusée dans le navigateur réel');
    assert.deepEqual(contentSnapshot(id),before);
    await page.locator('[name=confirm]').check();
    await page.getByRole('button',{name:'Confirmer la suppression',exact:true}).click();
    await page.getByRole('status').waitFor();
    const removed=contentSnapshot(id);
    assert.ok(removed.deletedAt && removed.deletionBatch && removed.deletedBy);
    assert.equal(removed.revision,before.revision+1);
    assert.deepEqual(removed.draft,before.draft);
    assert.deepEqual(removed.source,before.source);
    assert.equal((await context.request.get(editUrl)).status(),404);
    assert.equal((await context.request.get(`${base}/${id}/photo`)).status(),404);
    if(privatePhoto.includes('/medias/')) assert.equal((await context.request.get(privatePhoto)).status(),200,'Photo historique privée conservée');
    if(linkedBefore) {
      const linkedRemoved=contentSnapshot(before.linkedNewsId);
      assert.ok(linkedRemoved.deletedAt);
      assert.equal(linkedRemoved.deletionBatch,removed.deletionBatch);
    }
    await openTrash(page);
    for(const width of [320,1440]) {
      await page.setViewportSize({width,height:1000});
      await checkAccessibility(page);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      if(kind==='projects') await page.screenshot({path:`${cwd}/artifacts/corbeille-${width}.png`,fullPage:true});
    }
    await page.locator(`form[action="${base}/${id}/restaurer"]`).getByRole('button',{name:'Restaurer',exact:true}).click();
    await page.getByRole('status').waitFor();
    const restored=contentSnapshot(id);
    assert.equal(restored.deletedAt,null);
    assert.equal(restored.deletionBatch,null);
    assert.equal(restored.deletedBy,null);
    assert.equal(restored.revision,before.revision+2);
    assert.deepEqual(restored.draft,before.draft);
    assert.deepEqual(restored.source,before.source);
    if(linkedBefore) assert.equal(contentSnapshot(before.linkedNewsId).deletedAt,null);
    await page.goto(editUrl);
    assert.equal(await page.locator('.entry-photo').getAttribute('src'),privatePhoto,'Photo restaurée avec la fiche');
    await page.goto(base+'/corbeille');
    await page.getByText('La corbeille est vide.',{exact:true}).waitFor();
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
  await openNewsletterMessages(page);
  const testResponse=page.waitForResponse(r=>r.url().endsWith('/simulation')&&r.request().method()==='POST');
  await page.getByRole('button',{name:'Lancer le test',exact:true}).click();
  assert.equal((await testResponse).status(),302,'Test lancé depuis le volet avec CSRF');
  await page.getByRole('status').waitFor();
  await openNewsletterMessages(page);
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
  await page.goto('http://127.0.0.1:8001/administration/newsletter');
  await openNewsletterMessages(page);
  const campaignTest=page.waitForResponse(r=>r.url().endsWith('/simulation')&&r.request().method()==='POST');
  await page.getByRole('button',{name:'Lancer le test',exact:true}).click();
  assert.equal((await campaignTest).status(),302);
  await page.getByRole('status').waitFor();
  await openNewsletterMessages(page);
  for(const width of [320,768,1440]) {
    await page.setViewportSize({width,height:1000});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.evaluate(()=>document.documentElement.style.fontSize='200%');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.evaluate(()=>document.documentElement.style.fontSize='');
    await checkAccessibility(page);
    await page.screenshot({path:`${cwd}/artifacts/newsletter-${width}.png`,fullPage:true});
  }
  await page.getByRole('link',{name:'Voir le message de test'}).first().click();
  const unsubscribeLink=page.getByRole('link',{name:'Ouvrir la désinscription de test'});
  if(await unsubscribeLink.count()===0) {
    await page.goto('http://127.0.0.1:8001/administration/newsletter');
    await openNewsletterMessages(page);
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
  const nojsBefore=await p.locator('#contenu').boundingBox();
  await p.locator('.mobile-menu-trigger').click();
  assert.deepEqual(await p.locator('#contenu').boundingBox(),nojsBefore,'Menu superposé sans JavaScript');
  assert.deepEqual(await p.locator('.mobile-navigation').boundingBox(),{x:0,y:0,width:320,height:1000},'Plein écran sans JavaScript');
  await p.keyboard.press('Escape');
  assert.equal(await p.locator('.mobile-navigation').isVisible(),false);
  assert.equal(await p.locator('.mobile-menu-trigger').evaluate(el=>el===document.activeElement),true);
  await p.locator('.mobile-menu-trigger').click();
  await p.locator('.mobile-navigation').getByRole('link',{name:'Équipe',exact:true}).click();
  await p.waitForURL('**/administration/team');
  await p.locator('.mobile-menu-trigger').click();
  assert.equal(await p.locator('.mobile-navigation [aria-current="page"]').textContent().then(t=>t.trim()),'Équipe');
  await p.locator('.mobile-menu-close').click();
  await p.getByRole('link',{name:'Modifier les informations',exact:true}).first().click();
  const nojsEditUrl=p.url();
  const nojsName=`${await p.locator('#fr-name').inputValue()} [contrôle sans JavaScript]`;
  const nojsEnglish=await p.locator('#en-name').inputValue();
  const nojsSavePath=new URL(nojsEditUrl).pathname.replace(/\/modifier$/,'');
  const saveNojs=async()=>{
    await p.locator('#fr-name').fill(nojsName);
    await p.locator('#photo').setInputFiles({name:'fixture.png',mimeType:'image/png',buffer:photo});
    await p.locator('#source_note').fill('Texte et photo de test modifiés sans JavaScript.');
    const saved=p.waitForResponse(response=>response.request().method()==='POST' && new URL(response.url()).pathname===nojsSavePath);
    await p.getByRole('button',{name:'Enregistrer les changements'}).click();
    return saved;
  };
  let nojsResponse=await saveNojs();
  if(nojsResponse.status()===429) {
    const retry=Number(nojsResponse.headers()['retry-after']);
    assert.ok(Number.isInteger(retry) && retry>=0 && retry<=60,'Limite des photos avec délai de reprise borné');
    console.log(`Photos : limite réelle 429 conservée ; reprise après ${retry} secondes.`);
    await new Promise(resolve=>setTimeout(resolve,retry*1000+1000));
    await p.goto(nojsEditUrl);
    assert.notEqual(await p.locator('#fr-name').inputValue(),nojsName,'Refus sans écriture de la modification');
    nojsResponse=await saveNojs();
  }
  assert.equal(nojsResponse.status(),302,'Modification autorisée après le délai normal');
  await p.getByRole('status').waitFor();
  await p.goto('http://127.0.0.1:8001/administration/team');
  await p.getByRole('heading',{name:nojsName,exact:true,level:2}).waitFor();
  await p.goto(nojsEditUrl);
  assert.equal(await p.locator('#fr-name').inputValue(),nojsName,'Texte modifié puis relu sans JavaScript');
  assert.equal(await p.locator('#en-name').inputValue(),nojsEnglish,'Traduction préservée sans changement');
  assert.equal((await nojs.request.get(await p.locator('.entry-photo').getAttribute('src'))).status(),200);
  const nojsEntryId=Number(new URL(nojsEditUrl).pathname.split('/')[3]);
  const nojsBeforeRemoval=contentSnapshot(nojsEntryId);
  await p.getByRole('link',{name:'Supprimer la fiche du membre',exact:true}).click();
  await p.locator('[name=confirm]').check();
  await p.getByRole('button',{name:'Confirmer la suppression',exact:true}).click();
  await p.getByRole('status').waitFor();
  assert.ok(contentSnapshot(nojsEntryId).deletedAt,'Suppression sans JavaScript');
  await openTrash(p);
  await p.locator(`form[action$="/team/${nojsEntryId}/restaurer"]`).getByRole('button',{name:'Restaurer',exact:true}).click();
  await p.getByRole('status').waitFor();
  const nojsRestored=contentSnapshot(nojsEntryId);
  assert.equal(nojsRestored.deletedAt,null,'Restauration sans JavaScript');
  assert.deepEqual(nojsRestored.draft,nojsBeforeRemoval.draft);
  assert.equal(nojsRestored.revision,nojsBeforeRemoval.revision+2);
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
  await p.locator('.mobile-menu-trigger').click();
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
