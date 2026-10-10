@props(['name'])
<svg {{ $attributes->class(['admin-icon']) }} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
@switch($name)
    @case('close')<path d="m6 6 12 12M18 6 6 18" />@break
    @case('home')<path d="m3 10 9-7 9 7M5 9v12h14V9M9 21v-8h6v8" />@break
    @case('projects')<path d="M5 3h9l5 5v13H5zM14 3v6h5M9 13h6M9 17h4" />@break
    @case('news')<rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 8h4v5H7zM15 8h2M15 12h2M7 16h10" />@break
    @case('newsletter')<rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" />@break
    @case('security')<path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6z" /><path d="m8.5 12 2.5 2.5 4.5-5" />@break
    @case('trash')<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" />@break
    @case('team')<circle cx="12" cy="7" r="3" /><path d="M6 21v-3a6 6 0 0 1 12 0v3M3 10a3 3 0 0 0 3 3M21 10a3 3 0 0 1-3 3M2 21v-2a5 5 0 0 1 2-4M22 21v-2a5 5 0 0 0-2-4" />@break
    @case('media')<rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8" cy="8" r="1.5" /><path d="m3 17 6-6 4 4 3-3 5 5" />@break
    @case('external')<path d="M14 3h7v7M21 3 10 14M10 3H3v18h18v-7" />@break
    @case('logout')<path d="M9 3H4v18h5M9 12h12m-5-5 5 5-5 5" />@break
    @case('arrow')<path d="M4 12h16m-6-6 6 6-6 6" />@break
    @case('back')<path d="M20 12H4m6-6-6 6 6 6" />@break
    @case('info')<circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7v.1" />@break
    @case('menu')<path d="M4 6h16M4 12h16M4 18h16" />@break
    @case('sidebar')<rect x="3" y="4" width="18" height="16" rx="2" /><path d="M8 4v16" /><path class="sidebar-direction" d="m16 9-3 3 3 3" />@break
@endswitch
</svg>
