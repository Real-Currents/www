const preprocess = require("svelte-preprocess");
const postcss_config = require("./postcss.config.cjs");

const config = {
  preprocess: [
    preprocess({
      postcss: postcss_config
    })
  ]
};

module.exports = config;
