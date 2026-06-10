'use strict';

var fs = require('fs');
var UglifyJS = require('uglify-js');

var version = 'v' + require('./package.json').version;

var CORE_PREAMBLE = '/*! howler.js ' + version + ' | (c) 2013-2020, James Simpson of GoldFire Studios | MIT License | howlerjs.com */';
var SPATIAL_PREAMBLE = '/*! howler.js ' + version + ' | Spatial Plugin | (c) 2013-2020, James Simpson of GoldFire Studios | MIT License | howlerjs.com */';

// Update the version header line in a source file, preserving original line endings.
function setVersionHeader(file, lineIndex) {
  var content = fs.readFileSync(file, 'utf8');
  var eol = content.includes('\r\n') ? '\r\n' : '\n';
  var lines = content.split(eol);
  lines[lineIndex] = ' *  howler.js ' + version;
  fs.writeFileSync(file, lines.join(eol));
}

// Minify a source file and write to dest with a preamble comment.
function minify(src, dest, preamble) {
  var result = UglifyJS.minify(src, {
    fromString: false,
    compress: true,
    mangle: true,
    screw_ie8: true,
    output: { preamble: preamble }
  });
  fs.writeFileSync(dest, result.code);
}

// 1. Stamp version into source file headers.
setVersionHeader('src/howler.core.js', 1);            // line 2
setVersionHeader('src/plugins/howler.spatial.js', 3); // line 4

// 2. Minify individual files.
minify('src/howler.core.js',            'dist/howler.core.min.js',    CORE_PREAMBLE);
minify('src/plugins/howler.spatial.js', 'dist/howler.spatial.min.js', SPATIAL_PREAMBLE);

// 3. Combine minified files into howler.min.js.
//    Replace the spatial plugin's full preamble with a short marker comment,
//    and strip the trailing newline (matching the original build output).
var coreMin    = fs.readFileSync('dist/howler.core.min.js', 'utf8');
var spatialMin = fs.readFileSync('dist/howler.spatial.min.js', 'utf8')
  .replace(/^\/\*!.*\*\//, '/*! Spatial Plugin */');
fs.writeFileSync('dist/howler.min.js', (coreMin + spatialMin).replace(/\n$/, ''));

// 4. Concatenate full source files into howler.js (two blank lines between them).
var core    = fs.readFileSync('src/howler.core.js', 'utf8');
var spatial = fs.readFileSync('src/plugins/howler.spatial.js', 'utf8');
fs.writeFileSync('dist/howler.js', core + '\n\n' + spatial);

console.log('Built howler.js ' + version);
