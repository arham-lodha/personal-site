const markdownIt = require("markdown-it");
const markdownItKatex = require("@traptitech/markdown-it-katex");
const fs = require("fs");

module.exports = function (eleventyConfig) {
  // Markdown with KaTeX
  const md = markdownIt({ html: true, linkify: true, typographer: true })
    .use(markdownItKatex);
  eleventyConfig.setLibrary("md", md);

  // Pass through static assets
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/assets");

  // Self-host KaTeX CSS + fonts (no CDN round-trip / SRI fragility).
  // katex.min.css references fonts via url(fonts/…), so fonts must sit
  // alongside the CSS at /css/fonts/.
  eleventyConfig.addPassthroughCopy({
    "node_modules/katex/dist/katex.min.css": "css/katex.min.css",
    "node_modules/katex/dist/fonts": "css/fonts",
  });

  // Date filter for templates
  eleventyConfig.addFilter("dateDisplay", (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  // ISO date filter used for <time datetime="..."> attributes
  eleventyConfig.addFilter("date", (date) => {
    return new Date(date).toISOString().split("T")[0];
  });

  // Render a Markdown string to HTML (used for paper abstracts)
  eleventyConfig.addFilter("md", (content) => md.render(content || ""));

  // Slice first n items from an array
  eleventyConfig.addFilter("first", (arr, n) => arr.slice(0, n));

  // Tag list collection (used by tag index page)
  eleventyConfig.addCollection("tagList", (collectionApi) => {
    const tags = new Set();
    collectionApi.getAll().forEach((item) => {
      (item.data.tags || []).forEach((t) => {
        if (!["all", "posts"].includes(t)) tags.add(t);
      });
    });
    return [...tags].sort();
  });

  // Search index collection — reads raw file to avoid templateContent timing issues in v3
  eleventyConfig.addCollection("searchIndex", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/posts/*.md")
      .map((post) => {
        const raw = fs.existsSync(post.inputPath)
          ? fs.readFileSync(post.inputPath, "utf8").replace(/^---[\s\S]*?---\n?/, "")
          : "";
        return {
          url: post.url,
          title: post.data.title,
          tags: (post.data.tags || []).join(" "),
          summary: post.data.summary || "",
          content: raw
            .replace(/<[^>]+>/g, "")
            .replace(/\s+/g, " ")
            .trim()
            .substring(0, 3000),
        };
      });
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
