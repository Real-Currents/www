const autoprefixer = require('autoprefixer');
const postcssimport = require('postcss-import');

const config = {
    plugins: [
        autoprefixer,
        postcssimport
    ]
}

module.exports = config;
