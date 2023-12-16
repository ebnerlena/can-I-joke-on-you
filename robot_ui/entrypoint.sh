#!/bin/sh

die() { echo "error: $*"; exit 1; }

echo "Replacing environment variables"

[ -f ".env" ] || die "missing .env file"

# replace .env vars with environment variables
grep "=" .env | while read -r line; do
    key=$(echo "$line" | cut -d'=' -f 1)
    eval value="\$$key"
    [ -z "$value" ] && continue
    echo "replacing '$key' with '$value'"
    find ./.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#${key}#${value}#g"
done

echo "Starting Nextjs"
exec "$@"
