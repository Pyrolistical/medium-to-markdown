import { mkdir, writeFile } from "node:fs/promises";
import puppeteer from "puppeteer";
import TurndownService from "turndown";

const turndownService = new TurndownService();

const converters = {
  section: {
    filter: "section",
    replacement(content) {
      return content;
    },
  },
  div: {
    filter: "div",
    replacement(content) {
      return content;
    },
  },
  figure: {
    filter: "figure",
    replacement(content) {
      return content;
    },
  },
  figcaption: {
    filter: "figcaption",
    replacement(content) {
      return content;
    },
  },
  // following block adapted from https://github.com/domchristie/turndown/blob/61c2748c99fc53699896c1449f953ea492311c5b/src/commonmark-rules.js#L131
  mediumInlineLink: {
    filter(node, options) {
      return (
        options.linkStyle === "inlined" &&
        node.nodeName === "A" &&
        node.getAttribute("href")
      );
    },

    replacement(content, node) {
      const href = node.getAttribute("href");

      const title = node.title ? ` "${node.title}"` : "";
      return `[${content}](${href}${title})`;
    },
  },
  // Medium has these weird hidden images that are in the html and get rendered by turndown. We filter these out.
  noHiddenImages: {
    filter(node, options) {
      return (
        node.nodeName === "IMG" &&
        node.getAttribute("src") &&
        node.getAttribute("src").endsWith("?q=20")
      );
    },

    replacement() {
      return "";
    },
  },
  "code blocks": {
    filter: "pre",
    replacement(content, node) {
      return `\`\`\`\n${content}\n\`\`\``;
    },
  },
};

for (const [rule, converter] of Object.entries(converters)) {
  turndownService.addRule(rule, converter);
}

// todo: filter out profile header
// (right below title, the div with author profile pic and name and time to read article)
// unfortunately Medium uses randomly generated CSS properties which makes it hard to
// identify the header and strip it out. For example, I could strip the div with
// the class "eq" but the next time medium updated their CSS the div would have
// a different class name and the filter wouldn't work anymore

if (process.argv.length < 3) {
  console.log("What url to convert?");
} else {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const url = process.argv[2];
  await page.goto(url);
  const author = await page.$eval(
    ".pw-author a",
    (element) => element.innerText
  );
  const publishDate = await page.$eval(
    ".pw-published-date span",
    (element) => element.innerText
  );
  const html = await page.$eval(
    "article section",
    (element) => element.innerHTML
  );
  const markdown = turndownService.turndown(html);
  const {
    groups: { slug },
  } = url.match(/^https:\/\/blog\.battlefy\.com\/(?<slug>.+)-[^-]+$/);
  const metadata = { url, slug, author, publishDate };
  await mkdir(`./dist/${slug}`, {
    recursive: true,
  });
  await writeFile(
    `./dist/${slug}/metadata.json`,
    JSON.stringify(metadata, null, 2)
  );
  await writeFile(`./dist/${slug}/post.md`, markdown);
  await browser.close();
}
