#!/usr/bin/env bash
set -e

root_dir="$( cd "$( dirname "$0" )" && pwd )"
dist_dir="$root_dir/dist"
zip_file_name=note.zip
zip_file_path="$dist_dir/$zip_file_name"
deploy_path="$root_dir/../../mail/mail/h5.bundle/$zip_file_name"

npm_path=/usr/local/bin/npm
if [ ! -e "$npm_path" ]; then
    echo "No npm"
    exit -1
fi
zip_path=/usr/bin/zip
if [ ! -e "$zip_path" ]; then
    echo "No zip"
    exit -1
fi

# build
"$npm_path" run build

# zip
cd "$dist_dir"
"$zip_path" -r "$zip_file_name" *

# copy zip file
echo $deploy_path
cp "$zip_file_path" "$deploy_path"