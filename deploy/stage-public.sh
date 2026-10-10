#!/usr/bin/env bash
# Extraction privée de la seule archive publique dont l'empreinte est connue.
(
  set -eu
  trap 'printf "Extraction interrompue : contrôle refusé ou erreur (ligne %s).\n" "$LINENO" >&2' ERR
  umask 077
  geca_delivery='/home2/fnksrwmy/geca-livraison-atWbM4'
  geca_archive="$geca_delivery/geca-site-public.zip"
  geca_stage="$geca_delivery/site-pret"
  test "$(id -un)" = 'fnksrwmy'
  test "$(readlink -f "$geca_delivery")" = "$geca_delivery"
  test "$(stat -c %u "$geca_delivery")" = "$(id -u)"
  test "$(stat -c %a "$geca_delivery")" = '700'
  test -f "$geca_archive" && test ! -L "$geca_archive"
  test "$(stat -c %u "$geca_archive")" = "$(id -u)"
  command -v unzip > /dev/null
  printf '%s  %s\n' '449389e4dadd1f7331e5f9fec3b8c6d39fb98d9bc167282e840190268afc7a14' "$geca_archive" | sha256sum -c -
  unzip -tq "$geca_archive"
  mkdir -m 700 "$geca_stage"
  unzip -nq "$geca_archive" -d "$geca_stage"
  test -f "$geca_stage/.htaccess"
  test -f "$geca_stage/fr/index.html"
  test -f "$geca_stage/en/index.html"
  test -z "$(find "$geca_stage" -mindepth 1 ! -type f ! -type d -print -quit)"
  test "$(find "$geca_stage" -type f | wc -l)" -eq 670
  printf 'Extraction privée vérifiée : %s (670 fichiers).\n' "$geca_stage"
)
