#!/usr/bin/env bash
# Première installation uniquement : racine GECA encore vide hors dossiers Bluehost.
(
  set -eu
  trap 'printf "Installation interrompue : contrôle refusé ou erreur (ligne %s).\n" "$LINENO" >&2' ERR
  umask 022
  geca_target='/home2/fnksrwmy/public_html/website_43934bdf'
  geca_delivery='/home2/fnksrwmy/geca-livraison-atWbM4'
  geca_backup='/home2/fnksrwmy/geca-sauvegarde-NB6OjlRe'
  geca_archive="$geca_delivery/geca-site-public.zip"
  test "$(id -un)" = 'fnksrwmy'
  for geca_directory in "$geca_target" "$geca_delivery" "$geca_backup"; do
    test -d "$geca_directory"
    test "$(readlink -f "$geca_directory")" = "$geca_directory"
    test "$(stat -c %u "$geca_directory")" = "$(id -u)"
  done
  test "$(stat -c %a "$geca_delivery")" = '700'
  test "$(stat -c %a "$geca_backup")" = '700'
  test "$(stat -c '%a:%G' "$geca_target")" = '750:nobody'
  test -d "$geca_target/.well-known" && test -d "$geca_target/cgi-bin"
  test -z "$(find "$geca_target" -mindepth 1 ! -type f ! -type d -print -quit)"
  test -z "$(find "$geca_target" -mindepth 1 -maxdepth 1 ! -name '.well-known' ! -name 'cgi-bin' -print -quit)"
  test -f "$geca_archive" && test ! -L "$geca_archive"
  test "$(stat -c %u "$geca_archive")" = "$(id -u)"
  command -v unzip > /dev/null
  (cd "$geca_backup" && sha256sum -c SHA256SUMS.txt)
  tar -dzf "$geca_backup/site-avant-publication.tar.gz" -C "$geca_target"
  printf '%s  %s\n' '449389e4dadd1f7331e5f9fec3b8c6d39fb98d9bc167282e840190268afc7a14' "$geca_archive" | sha256sum -c -
  unzip -tq "$geca_archive"
  unzip -nq "$geca_archive" -d "$geca_target"
  for geca_name in .htaccess 404 404.html _next _not-found en fr icon.svg images index.html robots.txt sitemap.xml; do
    find "$geca_target/$geca_name" -type d -exec chmod 755 {} +
    find "$geca_target/$geca_name" -type f -exec chmod 644 {} +
  done
  geca_count="$(find "$geca_target" -mindepth 1 \( -path "$geca_target/.well-known" -o -path "$geca_target/cgi-bin" \) -prune -o -type f -print | wc -l)"
  test "$geca_count" -eq 670
  test -f "$geca_target/fr/index.html" && test -f "$geca_target/en/index.html"
  test "$(stat -c %a "$geca_target/.htaccess")" = '644'
  test "$(stat -c '%a:%G' "$geca_target")" = '750:nobody'
  printf 'Installation des 670 fichiers terminée. Vérification du domaine à suivre.\n'
)
