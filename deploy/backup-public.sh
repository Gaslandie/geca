#!/usr/bin/env bash
# Copie privée du seul dossier GECA confirmé, sans modification du site.
(
  set -eu
  trap 'printf "Sauvegarde interrompue : contrôle refusé ou erreur (ligne %s).\n" "$LINENO" >&2' ERR
  umask 077
  geca_source='/home2/fnksrwmy/public_html/website_43934bdf'
  geca_parent='/home2/fnksrwmy'
  test "$(id -un)" = 'fnksrwmy'
  test -d "$geca_source"
  test "$(readlink -f "$geca_source")" = "$geca_source"
  test "$(readlink -f "$geca_parent")" = "$geca_parent"
  test "$(stat -c %u "$geca_source")" = "$(id -u)"
  test "$(stat -c %u "$geca_parent")" = "$(id -u)"
  geca_unusual="$(find "$geca_source" -mindepth 1 ! -type f ! -type d -print -quit)"
  test -z "$geca_unusual"
  geca_backup="$(mktemp -d "$geca_parent/geca-sauvegarde-XXXXXXXX")"
  tar -czf "$geca_backup/site-avant-publication.tar.gz" -C "$geca_source" .
  tar -dzf "$geca_backup/site-avant-publication.tar.gz" -C "$geca_source" > "$geca_backup/comparaison-source.txt"
  mkdir "$geca_backup/restauration-test"
  tar --no-same-owner --no-same-permissions -xzf "$geca_backup/site-avant-publication.tar.gz" -C "$geca_backup/restauration-test"
  diff -qr --no-dereference "$geca_source" "$geca_backup/restauration-test" > "$geca_backup/comparaison-restauration.txt"
  (cd "$geca_backup" && sha256sum site-avant-publication.tar.gz > SHA256SUMS.txt)
  printf 'Sauvegarde créée et restauration testée : %s\n' "$geca_backup"
)
