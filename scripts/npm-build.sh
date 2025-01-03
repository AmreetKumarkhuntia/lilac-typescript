rm -rf dist
rollup --config --bundleConfigAsCjs
cp index.d.ts ./dist