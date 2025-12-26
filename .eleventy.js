module.exports = function(eleventyConfig) {
  // Static assets (css, images, cw, assests) are already at root level
  // No passthrough copy needed since we output to root

  return {
    dir: {
      input: "src",
      output: ".",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["njk", "html", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
