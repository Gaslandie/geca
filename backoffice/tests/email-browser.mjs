import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createServer } from 'node:tls';
import { spawn, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdtemp, writeFile, readFile, mkdir, rm, symlink, chmod } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const cwd = fileURLToPath(new URL('..', import.meta.url));
const php = process.env.GECA_PHP || 'php';
const dir = await mkdtemp(`${tmpdir()}/geca-email-browser-`);
const password = randomBytes(24).toString('hex');
const newPassword = randomBytes(24).toString('hex');
const smtpPassword = 'fixture-$'+String.fromCharCode(34,92)+' '+randomBytes(24).toString('hex');
const cert = `${dir}/smtp-cert.pem`;
const key = `${dir}/smtp-key.pem`;
const made = spawnSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', key, '-out', cert,
  '-days', '1', '-subj', '/CN=127.0.0.1', '-addext', 'subjectAltName=IP:127.0.0.1'], {stdio:'ignore'});
assert.equal(made.status, 0);
const messages = [];
const sockets = new Set();
const smtp = createServer({key:await readFile(key), cert:await readFile(cert)}, socket => {
  sockets.add(socket); socket.on('close',()=>sockets.delete(socket));
  socket.setEncoding('utf8'); socket.write('220 fixture.example.test ESMTP\r\n');
  let buffer = '', data = null, recipient = '', authStage = 0, authenticated = false, smtpUser = '';
  socket.on('data', chunk => {
    buffer += chunk;
    while (buffer.includes('\r\n')) {
      const end = buffer.indexOf('\r\n'); const line = buffer.slice(0,end); buffer = buffer.slice(end+2);
      if (data !== null) {
        if (line === '.') { messages.push({recipient, body:data}); data=null; socket.write('250 queued locally\r\n'); }
        else data += `${line}\n`;
      } else if (authStage) {
        if (authStage === 1) { smtpUser=Buffer.from(line,'base64').toString(); authStage=2; socket.write('334 UGFzc3dvcmQ6\r\n'); }
        else { authenticated=smtpUser==='sender@example.test' && Buffer.from(line,'base64').toString()===smtpPassword; authStage=0; socket.write(authenticated ? '235 authenticated\r\n' : '535 refused\r\n'); }
      } else if (/^EHLO /i.test(line)) socket.write('250-fixture.example.test\r\n250 AUTH LOGIN\r\n');
      else if (/^AUTH LOGIN/i.test(line)) {authStage=1; socket.write('334 VXNlcm5hbWU6\r\n');}
      else if (/^MAIL FROM:/i.test(line)) {assert.ok(authenticated); socket.write('250 sender accepted\r\n');}
      else if (/^RCPT TO:/i.test(line)) {recipient=line; socket.write('250 recipient accepted\r\n');}
      else if (line === 'DATA') {data=''; socket.write('354 end with dot\r\n');}
      else if (line === 'QUIT') socket.end('221 bye\r\n');
      else socket.write('250 OK\r\n');
    }
  });
});
smtp.on('connection', socket => { sockets.add(socket); socket.on('close',()=>sockets.delete(socket)); });
await new Promise(resolve => smtp.listen(0,'127.0.0.1',resolve));
const env = {...process.env, APP_ENV:'local', APP_DEBUG:'false', APP_KEY:`base64:${randomBytes(32).toString('base64')}`,
  APP_URL:'http://127.0.0.1:8002', DB_CONNECTION:'sqlite', DB_DATABASE:`${dir}/test.sqlite`, DB_URL:'', CACHE_STORE:'database',
  SESSION_DRIVER:'database', SESSION_SECURE_COOKIE:'false', GECA_LOGIN_VERIFICATION:'email',
  GECA_LOGIN_MAIL_HOST:'127.0.0.1', GECA_LOGIN_MAIL_PORT:String(smtp.address().port), GECA_LOGIN_MAIL_SCHEME:'smtps',
  GECA_LOGIN_MAIL_USERNAME:'sender@example.test', GECA_LOGIN_MAIL_PASSWORD:smtpPassword, GECA_LOGIN_MAIL_FROM:'sender@example.test',
  MAIL_MAILER:'array', GECA_NEWSLETTER_MODE:'preview', GECA_TEST_PASSWORD:password, GECA_TEST_NEW_PASSWORD:newPassword,
  GECA_LOCAL_ACCESS_USER:'0', GECA_LOCAL_ACCESS_UNTIL:'0',
  GECA_PUBLIC_PATH:'null', LARAVEL_STORAGE_PATH:`${dir}/storage`, APP_CONFIG_CACHE:`${dir}/config.php`,
  APP_ROUTES_CACHE:`${dir}/routes.php`, VIEW_COMPILED_PATH:`${dir}/views`};
// Le certificat local est explicitement approuvé pour la fixture ; vérification TLS conservée.
const phpArgs=['-d',`openssl.cafile=${cert}`];
for (const folder of ['app/private','framework/cache/data','framework/sessions','framework/views','logs']) await mkdir(`${env.LARAVEL_STORAGE_PATH}/${folder}`,{recursive:true});
await mkdir(env.VIEW_COMPILED_PATH); await writeFile(env.DB_DATABASE,'',{mode:0o600});
function run(args) { const result=spawnSync(php,[...phpArgs,...args],{cwd,env,encoding:'utf8'}); assert.equal(result.status,0,`Commande fixture : ${args[0]}`); return result.stdout; }
run(['artisan','migrate','--no-interaction']); run(['artisan','geca:import-reference']);
run(['-r', String.raw`require 'vendor/autoload.php'; $app=require 'bootstrap/app.php'; $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap(); foreach(['browser@example.test','browser-nojs@example.test'] as $email) { $u=new App\Models\User; $u->name='Compte de test'; $u->email=$email; $u->password=getenv('GECA_TEST_PASSWORD'); $u->is_admin=true; $u->is_active=true; $u->session_version=1; $u->save(); }`]);
const server=spawn(php,[...phpArgs,'-S','127.0.0.1:8002','-t','.',`${cwd}/vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php`],{cwd:`${cwd}/public`,env,stdio:'ignore'});
let browser;
try {
  let ready=false;
  for(let n=0;n<50;n++) {try {if((await fetch(`${env.APP_URL}/connexion`)).ok){ready=true;break;}}catch{} await new Promise(resolve=>setTimeout(resolve,100));}
  assert.ok(ready);
  browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
  const context=await browser.newContext({javaScriptEnabled:true}); const page=await context.newPage(); page.setDefaultTimeout(10000); page.setDefaultNavigationTimeout(15000);
  console.log('Fixture navigateur prête.');
  await page.goto(`${env.APP_URL}/administration`); assert.ok(page.url().endsWith('/connexion'));
  await page.getByLabel('Adresse e-mail').fill('browser@example.test'); await page.getByLabel('Mot de passe',{exact:true}).fill(password);
  await page.getByRole('button',{name:'Se connecter',exact:true}).click(); await page.waitForURL('**/connexion/double-verification');
  console.log('Page de code atteinte.');
  assert.equal(messages.length,1); assert.match(messages[0].recipient,/browser@example\.test/);
  const code=messages[0].body.match(/Global EcoAction : ([0-9]{6})/)[1];
  assert.equal(await page.locator('.mfa-qr').count(),0);
  for(const width of [320,375,1440]) {
    await page.setViewportSize({width,height:900});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    assert.deepEqual((await new AxeBuilder({page}).analyze()).violations,[]);
    if(width===320) await page.screenshot({path:'/tmp/geca-email-code-320.png',fullPage:true});
  }
  await page.getByLabel('Code à six chiffres').fill('abcdef'); await page.getByRole('button',{name:'Confirmer la connexion',exact:true}).click();
  assert.equal(await page.getByRole('alert').count(),1);
  await page.getByLabel('Code à six chiffres').fill(code); await page.getByRole('button',{name:'Confirmer la connexion',exact:true}).click();
  await page.waitForURL('**/administration');
  await page.goto(`${env.APP_URL}/administration/securite`); assert.equal(await page.getByText('Chaque connexion demande votre mot de passe puis un code envoyé à l’adresse e-mail de votre compte.').count(),1);
  const passwordForm=page.locator(`form[action="${env.APP_URL}/administration/securite/mot-de-passe"]`);
  for(const width of [320,375,768,1440]) for(const font of ['', '200%']) {
    await page.setViewportSize({width,height:1000});await page.evaluate(font=>document.documentElement.style.fontSize=font,font);
    if (!(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))) {
      console.log('Débordement sécurité',width,font,await page.evaluate(()=>[...document.querySelectorAll('main,main *')].filter(e=>e.getBoundingClientRect().right>innerWidth).map(e=>({tag:e.tagName,cls:e.className,width:e.getBoundingClientRect().width})).slice(0,15)));
      await page.screenshot({path:'/tmp/geca-security-overflow.png',fullPage:true});
    }
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  await page.evaluate(()=>document.documentElement.style.fontSize='');await page.setViewportSize({width:375,height:1000});
  assert.deepEqual((await new AxeBuilder({page}).analyze()).violations,[]);
  await page.screenshot({path:'/tmp/geca-security-mobile.png',fullPage:true});
  await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'/tmp/geca-security-pc.png',fullPage:true});
  const oldSession=await browser.newContext({storageState:await context.storageState()});const oldPage=await oldSession.newPage();
  await oldPage.goto(`${env.APP_URL}/administration`);assert.ok(oldPage.url().endsWith('/administration'));
  assert.equal((await context.request.put(`${env.APP_URL}/administration/securite/mot-de-passe`,{form:{current_password:password,password:newPassword,password_confirmation:newPassword},maxRedirects:0})).status(),419);
  await page.locator('#current-password').fill('Wrong fixture password');await page.locator('#new-password').fill(newPassword);await page.locator('#password-confirmation').fill(newPassword);
  await passwordForm.getByRole('button',{name:'Changer mon mot de passe',exact:true}).click();await page.getByRole('alert').waitFor();
  assert.ok(await page.getByText('Le mot de passe actuel est incorrect.',{exact:true}).isVisible());
  for(const id of ['current-password','new-password','password-confirmation']) assert.equal(await page.locator(`#${id}`).inputValue(),'');
  await page.locator('#current-password').fill(password);await page.locator('#new-password').fill(newPassword);await page.locator('#password-confirmation').fill(newPassword);
  await passwordForm.getByRole('button',{name:'Changer mon mot de passe',exact:true}).click();await page.waitForURL('**/connexion');
  await page.getByRole('status').waitFor();
  await oldPage.goto(`${env.APP_URL}/administration`);assert.ok(oldPage.url().endsWith('/connexion'));await oldSession.close();
  assert.equal(run(['-r',String.raw`require 'vendor/autoload.php'; $app=require 'bootstrap/app.php'; $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap(); $u=App\Models\User::where('email','browser@example.test')->firstOrFail(); echo ($u->session_version===2 && Illuminate\Support\Facades\Hash::check(getenv('GECA_TEST_NEW_PASSWORD'),$u->password) && !Illuminate\Support\Facades\Hash::check(getenv('GECA_TEST_PASSWORD'),$u->password)) ? 'ok' : 'fail';`]),'ok');
  await page.getByLabel('Adresse e-mail').fill('browser@example.test');await page.getByLabel('Mot de passe',{exact:true}).fill(password);
  await page.getByRole('button',{name:'Se connecter',exact:true}).click();await page.getByRole('alert').waitFor();assert.equal(messages.length,1);
  // Délai d’envoi testé en PHP ; remise à zéro du seul compte jetable pour éviter une attente d’une minute.
  run(['-r',String.raw`require 'vendor/autoload.php'; $app=require 'bootstrap/app.php'; $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap(); $u=App\Models\User::where('email','browser@example.test')->firstOrFail(); Illuminate\Support\Facades\RateLimiter::clear('email-login-send:'.$u->id);`]);
  await page.getByLabel('Adresse e-mail').fill('browser@example.test');await page.getByLabel('Mot de passe',{exact:true}).fill(newPassword);
  await page.getByRole('button',{name:'Se connecter',exact:true}).click();await page.waitForURL('**/connexion/double-verification');
  await page.getByLabel('Code à six chiffres').fill(messages.at(-1).body.match(/Global EcoAction : ([0-9]{6})/)[1]);
  await page.getByRole('button',{name:'Confirmer la connexion',exact:true}).click();await page.waitForURL('**/administration');
  console.log('Changement du mot de passe : ancien refusé, nouveau et seconde preuve acceptés, ancienne session fermée, CSRF et erreur vérifiés.');
  const log=await readFile(`${env.LARAVEL_STORAGE_PATH}/logs/laravel.log`,'utf8').catch(()=> ''); assert.ok(!log.includes(code));
  const nojs=await browser.newContext({javaScriptEnabled:false}); const plain=await nojs.newPage();
  await plain.goto(`${env.APP_URL}/connexion`);
  await plain.getByLabel('Adresse e-mail').fill('browser-nojs@example.test'); await plain.getByLabel('Mot de passe',{exact:true}).fill(password);
  await plain.getByRole('button',{name:'Se connecter',exact:true}).click(); await plain.waitForURL('**/connexion/double-verification');
  assert.match(messages.at(-1).recipient,/browser-nojs@example\.test/);
  await plain.getByLabel('Code à six chiffres').fill(messages.at(-1).body.match(/Global EcoAction : ([0-9]{6})/)[1]);
  await plain.getByRole('button',{name:'Confirmer la connexion',exact:true}).click(); await plain.waitForURL('**/administration');
  await plain.goto(`${env.APP_URL}/administration/securite`);
  await plain.locator('#logout-password').fill(password);
  await plain.getByRole('button',{name:'Déconnecter tous les appareils',exact:true}).click();await plain.waitForURL('**/connexion');await plain.getByRole('status').waitFor();
  await plain.goto(`${env.APP_URL}/administration`);assert.ok(plain.url().endsWith('/connexion'));
  await page.goto(`${env.APP_URL}/administration`);assert.ok(page.url().endsWith('/administration'),'La déconnexion ne touche pas l’autre compte');
  await nojs.close();
  const settingsDir=`${dir}/settings`; await mkdir(settingsDir,{mode:0o700});
  await symlink(`${cwd}/vendor`,`${settingsDir}/vendor`);
  const originalEnv=`APP_ENV=production\nAPP_DEBUG=false\nDB_DATABASE=fnksrwmy_geca\nAPP_KEY=base64:fixture-key-kept\nMAIL_MAILER=array\nGECA_NEWSLETTER_MODE=preview\nKEEP=unchanged\n`;
  await writeFile(`${settingsDir}/.env`,originalEnv,{mode:0o600});
  const configure=(await readFile(`${cwd}/scripts/configure-login-mail.php`,'utf8'))
    .replace("'smtps', 'globalecoaction.org', 'contact@globalecoaction.org', $password, 465",`'smtps', '127.0.0.1', 'sender@example.test', $password, ${smtp.address().port}`);
  await writeFile(`${settingsDir}/configure.php`,configure,{mode:0o600});
  async function configuration(passwordValue,extraPhpArgs=phpArgs,envText=originalEnv) {
    await writeFile(`${settingsDir}/.env`,envText,{mode:0o600});
    const work=await mkdtemp(`${settingsDir}/private-`); await chmod(work,0o700);
    await writeFile(`${work}/password`,passwordValue,{mode:0o600});
    const result=await new Promise(resolve=>{const child=spawn(php,[...extraPhpArgs,'configure.php',work],{cwd:settingsDir,env});let out='';child.stdout.on('data',data=>out+=data);child.stderr.on('data',data=>out+=data);child.on('close',status=>resolve({status,out,work}));});
    assert.ok(!result.out.includes(smtpPassword)); return result;
  }
  const wrongPassword=await configuration('incorrect'); assert.equal(wrongPassword.status,1); assert.equal(await readFile(`${settingsDir}/.env`,'utf8'),originalEnv);
  const insecure=await configuration(smtpPassword,phpArgs,originalEnv.replace('APP_DEBUG=false','APP_DEBUG=true')); assert.equal(insecure.status,1);
  const untrusted=await configuration(smtpPassword,['-d',`openssl.cafile=${dir}/absent-ca.pem`]); assert.equal(untrusted.status,1); assert.equal(await readFile(`${settingsDir}/.env`,'utf8'),originalEnv);
  const configured=await configuration(smtpPassword); assert.equal(configured.status,0,configured.out); assert.equal(await readFile(`${configured.work}/env-avant`,'utf8'),originalEnv);
  const exact=spawnSync(php,['-r',String.raw`require 'vendor/autoload.php'; $p=Dotenv\Dotenv::parse(file_get_contents('.env')); if($p['GECA_LOGIN_MAIL_PASSWORD']!==getenv('GECA_LOGIN_MAIL_PASSWORD') || $p['APP_KEY']!=='base64:fixture-key-kept' || $p['MAIL_MAILER']!=='array' || $p['KEEP']!=='unchanged' || isset($p['GECA_LOGIN_VERIFICATION'])) exit(1);`],{cwd:settingsDir,env,encoding:'utf8'}); assert.equal(exact.status,0);
  assert.equal(messages.length,3,'La configuration SMTP ne transmet aucun message');
  console.log('Configuration privée SMTP : réussite avec caractères spéciaux et sauvegarde ; mot de passe incorrect, debug et certificat non approuvé refusés.');
  console.log('Parcours e-mail et sécurité avec et sans JavaScript réussi : SMTP TLS authentifié local, destinataire exact, mot de passe et déconnexion de tous les appareils, compte indépendant conservé, mobile/PC/texte 200 %, axe. Aucun e-mail extérieur ni compte de travail modifié.');
} finally {
  await browser?.close(); server.kill('SIGTERM');
  for(const socket of sockets) socket.destroy(); await new Promise(resolve=>smtp.close(resolve));
  await rm(dir,{recursive:true,force:true});
}
