<?php

use App\Http\Controllers\ContentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\NewsletterAdminController;
use App\Http\Controllers\NewsletterPublicController;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\TwoFactorController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/administration');
Route::middleware('guest')->group(function () {
    Route::view('/connexion', 'auth.login')->name('login');
    Route::post('/connexion', [SessionController::class, 'store'])->middleware('throttle:login')->name('login.store');
});
Route::middleware(['guest', 'pending-mfa'])->prefix('connexion/double-verification')->group(function () {
    Route::get('/', [TwoFactorController::class, 'show'])->name('two-factor.show');
    Route::get('/qr', [TwoFactorController::class, 'qr'])->middleware('throttle:mfa-qr')->name('two-factor.qr');
    Route::post('/', [TwoFactorController::class, 'verify'])->middleware('throttle:mfa')->name('two-factor.verify');
    Route::get('/codes-de-secours', [TwoFactorController::class, 'recovery'])->name('two-factor.recovery');
    Route::post('/terminer', [TwoFactorController::class, 'finish'])->middleware('throttle:mfa')->name('two-factor.finish');
    Route::post('/annuler', [TwoFactorController::class, 'cancel'])->name('two-factor.cancel');
});
Route::post('/deconnexion', [SessionController::class, 'destroy'])->middleware('auth')->name('logout');
Route::middleware(['auth', 'admin', 'auth.session'])->group(function () {
    Route::get('/administration/medias/{media}/apercu', [MediaController::class, 'preview'])->whereUuid('media')->name('media.preview');
    Route::get('/administration/securite', [TwoFactorController::class, 'settings'])->name('security');
    Route::post('/administration/securite/codes', [TwoFactorController::class, 'regenerate'])->middleware('throttle:mfa')->name('security.regenerate');
    Route::get('/administration', DashboardController::class)->name('dashboard');
    Route::get('/administration/{kind}', [ContentController::class, 'index'])->whereIn('kind', ['projects', 'news', 'team'])->name('content.index');
    Route::get('/administration/{kind}/{entry}/photo', [ContentController::class, 'photo'])->whereIn('kind', ['projects', 'news', 'team'])->name('content.photo');
    Route::get('/administration/{kind}/{entry}/modifier', [ContentController::class, 'edit'])->whereIn('kind', ['projects', 'news', 'team'])->name('content.edit');
    Route::put('/administration/{kind}/{entry}', [ContentController::class, 'update'])->whereIn('kind', ['projects', 'news', 'team'])->middleware('throttle:media-upload')->name('content.update');
});

// Présentation statique -> formulaire GECA : aucune écriture ni envoi à cette étape.
Route::prefix('newsletter/{locale}')->where(['locale' => 'fr|en'])->group(function () {
    Route::get('/', [NewsletterPublicController::class, 'form'])->name('newsletter.form');
    Route::post('/commencer', [NewsletterPublicController::class, 'form'])->middleware('throttle:newsletter-display')->name('newsletter.start');
    Route::post('/inscription', [NewsletterPublicController::class, 'subscribe'])->middleware('throttle:newsletter-signup')->name('newsletter.subscribe');
    Route::match(['get', 'post'], '/confirmer/{subscriber}', [NewsletterPublicController::class, 'confirm'])->whereUuid('subscriber')->middleware(['signed:relative', 'throttle:newsletter-display'])->name('newsletter.confirm');
    Route::match(['get', 'post'], '/desinscription/{subscriber}', [NewsletterPublicController::class, 'unsubscribe'])->whereUuid('subscriber')->middleware(['signed:relative', 'throttle:newsletter-display'])->name('newsletter.unsubscribe');
});
Route::middleware(['auth', 'admin', 'auth.session', 'throttle:newsletter-admin'])->prefix('administration/newsletter')->group(function () {
    Route::get('/', [NewsletterAdminController::class, 'index'])->name('newsletter.index');
    Route::delete('/abonnes/{subscriber}', [NewsletterAdminController::class, 'destroySubscriber'])->whereUuid('subscriber')->name('newsletter.subscriber.delete');
    Route::post('/simulation', [NewsletterAdminController::class, 'simulate'])->name('newsletter.simulate');
    Route::get('/nouvelle', [NewsletterAdminController::class, 'create'])->name('newsletter.create');
    Route::post('/', [NewsletterAdminController::class, 'store'])->name('newsletter.store');
    Route::get('/messages/{delivery}', [NewsletterAdminController::class, 'delivery'])->whereUuid('delivery')->name('newsletter.delivery');
    Route::get('/{campaign}', [NewsletterAdminController::class, 'edit'])->whereUuid('campaign')->name('newsletter.edit');
    Route::put('/{campaign}', [NewsletterAdminController::class, 'update'])->whereUuid('campaign')->name('newsletter.update');
    Route::post('/{campaign}/preparer', [NewsletterAdminController::class, 'approve'])->whereUuid('campaign')->name('newsletter.approve');
    Route::post('/{campaign}/arreter', [NewsletterAdminController::class, 'cancel'])->whereUuid('campaign')->name('newsletter.cancel');
});
