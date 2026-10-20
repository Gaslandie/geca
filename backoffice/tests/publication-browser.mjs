import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {spawn,spawnSync} from 'node:child_process';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const cwd=fileURLToPath(new URL('..',import.meta.url));
const php=process.env.GECA_PHP||'php';
const dir=await mkdtemp(`${tmpdir()}/geca-publication-`);
const password=randomBytes(24).toString('hex');
const env={GECA_TEST_PASSWORD:password,...process.env,APP_ENV:'local',APP_DEBUG:'false',APP_KEY:`base64:${randomBytes(32).toString('base64')}`,APP_URL:'http://127.0.0.1:8006',DB_CONNECTION:'sqlite',DB_DATABASE:`${dir}/db.sqlite`,DB_URL:'',CACHE_STORE:'database',SESSION_DRIVER:'database',SESSION_SECURE_COOKIE:'false',MAIL_MAILER:'array',GECA_LOGIN_VERIFICATION:'authenticator',GECA_LOCAL_ACCESS_USER:'1',GECA_LOCAL_ACCESS_UNTIL:String(Math.floor(Date.now()/1000)+600),VIEW_COMPILED_PATH:`${dir}/views`,GECA_PUBLICATION_TEST_ROOT:dir};
await mkdir(env.VIEW_COMPILED_PATH);await writeFile(env.DB_DATABASE,'',{mode:0o600});
const prefix=String.raw`require 'vendor/autoload.php'; $app=require 'bootstrap/app.php'; $app->useStoragePath(getenv('LARAVEL_STORAGE_PATH')); $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap(); `;
function run(args){const r=spawnSync(php,args,{cwd,env,encoding:'utf8'});assert.equal(r.status,0,r.stderr);return r.stdout;}
// La configuration du disque privé de l'application web est isolée par son lien storage.
const storage=`${dir}/storage`;
for(const folder of ['app/private','framework/cache','framework/sessions','framework/views','logs'])await mkdir(`${storage}/${folder}`,{recursive:true});
env.LARAVEL_STORAGE_PATH=storage;
run(['artisan','migrate','--force']);
run(['-r',prefix+String.raw`
$u=new App\Models\User; $u->name='TEST Publication'; $u->email='publication@example.test'; $u->password=getenv('GECA_TEST_PASSWORD'); $u->two_factor_secret=OTPHP\TOTP::generate()->getSecret(); $u->two_factor_confirmed_at=now(); $u->role='admin'; $u->is_admin=true; $u->is_active=true; $u->session_version=1; $u->save();
foreach ([['projects','kounounkan',['title'=>'Titre source','description'=>'Description inchangée'],['title'=>'TEST projet publié','description'=>'Description inchangée']],['news','admin-11111111-1111-4111-8111-111111111111',[],['title'=>'TEST actualité publiée','description'=>'Données jetables uniquement','period'=>'TEST']],['team','admin-22222222-2222-4222-8222-222222222222',[],['name'=>'TEST membre publié','role'=>'TEST poste']]] as [$kind,$key,$source,$draft]) {$e=new App\Models\ContentEntry;$e->kind=$kind;$e->source_key=$key;$e->source_payload=['fr'=>$source,'en'=>[],'source_note'=>'NOTE PRIVÉE À NE PAS PUBLIER'];$e->draft_payload=['fr'=>$draft,'en'=>[]];$e->save();}
`]);
await writeFile(`${dir}/router.php`, `<?php
if (is_file(${JSON.stringify(cwd+'/public')} . parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH))) return false;
define('LARAVEL_START', microtime(true)); require ${JSON.stringify(cwd+'/vendor/autoload.php')}; $app=require ${JSON.stringify(cwd+'/bootstrap/app.php')}; $app->useStoragePath(getenv('LARAVEL_STORAGE_PATH')); $app->handleRequest(Illuminate\\Http\\Request::capture());`);
const server=spawn(php,['-S','127.0.0.1:8006','-t',`${cwd}/public`,`${dir}/router.php`],{cwd,env,stdio:'ignore',detached:true});
let browser;
try{
 for(let i=0;i<60;i++){try{if((await fetch('http://127.0.0.1:8006/connexion')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({headless:true,executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const context=await browser.newContext();let page=await context.newPage();
 await page.goto('http://127.0.0.1:8006/connexion');await page.getByLabel('Adresse e-mail').fill('publication@example.test');await page.getByLabel('Mot de passe',{exact:true}).fill(password);await page.getByRole('button',{name:'Se connecter',exact:true}).click();await page.waitForURL('**/connexion/double-verification');
 const code=run(['-r',prefix+String.raw`$u=App\Models\User::firstOrFail(); echo OTPHP\TOTP::create($u->two_factor_secret)->now();`]);
 await page.getByLabel('Code Authenticator à six chiffres').fill(code);await page.getByRole('button',{name:'Confirmer la connexion',exact:true}).click();await page.waitForURL('**/administration');
 await page.goto('http://127.0.0.1:8006/administration/publication');
 await page.getByRole('heading',{name:'Publier sur le site',exact:true}).waitFor();
 for(const width of [375,1440]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual((await new AxeBuilder({page}).analyze()).violations,[]);}
 assert.equal((await page.request.post('http://127.0.0.1:8006/administration/publication',{form:{confirm:'1'},maxRedirects:0})).status(),419);
 const plain=await browser.newContext({javaScriptEnabled:false,storageState:await context.storageState()});page=await plain.newPage();await page.goto('http://127.0.0.1:8006/administration/publication');
 await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Publier sur le site',exact:true}).click();await page.getByText('En attente de préparation.',{exact:true}).waitFor();
 const packet=run(['-r',prefix+String.raw`echo json_encode(app(App\Services\PublicPublication::class)->worker('fetch'),JSON_THROW_ON_ERROR);`]);const value=JSON.parse(packet);assert.equal(value.pending,true);assert.equal(value.snapshot.entries.length,3);assert.ok(!packet.includes('NOTE PRIVÉE'));
 await writeFile('/tmp/geca-publication-test-input.json',packet,{mode:0o600});
 console.log('Publication navigateur : relecture, confirmation, CSRF, mobile/ordinateur, accessibilité et copie privée vérifiés. Export jetable : /tmp/geca-publication-test-input.json');
}finally{if(browser)await browser.close();try{process.kill(-server.pid,'SIGTERM');}catch{}await rm(dir,{recursive:true,force:true});}
