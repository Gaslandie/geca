@if($paginator->hasPages())<nav class="newsletter-pagination" aria-label="{{ $label }}">
@if($paginator->previousPageUrl())<a class="button secondary" href="{{ $paginator->previousPageUrl() }}" rel="prev">Page précédente</a>@endif
<p>Page {{ $paginator->currentPage() }} sur {{ $paginator->lastPage() }}</p>
@if($paginator->nextPageUrl())<a class="button secondary" href="{{ $paginator->nextPageUrl() }}" rel="next">Page suivante</a>@endif
</nav>@endif
