#!/usr/bin/env node
const yargs = require("yargs");
const path = require("path");
const fs = require("fs");
const {
  createOutputFolder,
  logInfo,
  logSuccess,
  logError,
} = require("./modules/utils");
const { resize } = require("./modules/png");
const { generateFavicon } = require("./modules/favicon");
const { generateSvg } = require("./modules/svg");

const options = yargs
  .usage("Usage: -a <asset> -o <output>")
  .option("a", {
    alias: "asset",
    describe: "A PNG or SVG file",
    type: "string",
    demandOption: true,
  })
  .option("o", { alias: "output", describe: "folder output", type: "string", default: false })
  .argv;

const publicFolderPath = createOutputFolder(path.normalize(options.output || "public" || ""));
const iconFolderPath = createOutputFolder(path.normalize(options.output || "public/img/icons" || ""));

const information = `Generating images for ${options.asset}...`;
logInfo(information);

const assetPath = path.resolve(options.asset);

generateSvg(assetPath, iconFolderPath);

const iconParams = [
  ["android-chrome", 192],
  ["android-chrome", 512],
  ["android-chrome-maskable", 192],
  ["android-chrome-maskable", 512],
  ["apple-touch-icon", 60],
  ["apple-touch-icon", 76],
  ["apple-touch-icon", 120],
  ["apple-touch-icon", 152],
  ["apple-touch-icon", 180],
  ["apple-touch-icon", 180, false],
  ["favicon", 16],
  ["favicon", 32],
  ["msapplication-icon", 144],
  ["mstile", 150],
];

const generateIcons = async () => {
  const icons = await Promise.all(
    iconParams.map((iconParam) => resize(assetPath, iconFolderPath, ...iconParam))
  );
  const asset512x512Path = `${iconFolderPath}/android-chrome-512x512.png`;
  await generateFavicon(asset512x512Path, publicFolderPath);

  const json = JSON.stringify({ icons }, null, 2);
  const manifestFilename = "manifest.json";

  fs.writeFile(`${publicFolderPath}/manifest.json`, json, function (err) {
    if (err) {
      logError(manifestFilename, err);
    } else {
      logSuccess(manifestFilename);
    }
  });
};

generateIcons();
