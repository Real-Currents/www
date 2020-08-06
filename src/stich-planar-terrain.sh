#!/usr/bin/env bash

cd content/post/data
cat terrain.mjs.1 planar-terrain-verts.json terrain.mjs.2 planar-terrain-norms.json terrain.mjs.3 planar-terrain-uvs.json terrain.mjs.4 planar-terrain-idx.json terrain.mjs.5 > terrain.mjs
cp terrain.mjs ../../../src/apps/modules/
