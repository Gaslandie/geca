#!/usr/bin/env bash
# Retrait réversible des seuls chemins de la première livraison, sans suppression.
(
  set -eu
  trap 'printf "Retour arrière interrompu : contrôle refusé ou erreur (ligne %s).\n" "$LINENO" >&2' ERR
  umask 077
  geca_target='/home2/fnksrwmy/public_html/website_43934bdf'
  geca_delivery='/home2/fnksrwmy/geca-livraison-atWbM4'
  test "$(id -un)" = 'fnksrwmy'
  for geca_directory in "$geca_target" "$geca_delivery"; do
    test -d "$geca_directory"
    test "$(readlink -f "$geca_directory")" = "$geca_directory"
    test "$(stat -c %u "$geca_directory")" = "$(id -u)"
  done
  test "$(stat -c %a "$geca_delivery")" = '700'
  test "$(stat -c '%a:%G' "$geca_target")" = '750:nobody'
  test -z "$(find "$geca_target" -mindepth 1 ! -type f ! -type d -print -quit)"
  geca_retired="$(mktemp -d "$geca_delivery/retrait-XXXXXXXX")"
  for geca_name in fr en index.html robots.txt sitemap.xml images _next _not-found 404 404.html icon.svg .htaccess; do
    if test -e "$geca_target/$geca_name"; then
      mv -T -- "$geca_target/$geca_name" "$geca_retired/$geca_name"
    fi
  done
  test "$(stat -c '%a:%G' "$geca_target")" = '750:nobody'
  printf 'Fichiers de la première livraison retirés et conservés dans : %s\n' "$geca_retired"
)
