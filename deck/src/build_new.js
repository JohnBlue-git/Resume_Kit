// Generates the new/updated slides (new.pptx + manifest) into the build dir given as argv[2].
const fs = require("fs");
const path = require("path");
const H = require("./helpers.js");
require("./main_slides.js");
require("./appendix_slides.js");
const BUILD = process.argv[2] || path.join(__dirname, "..", "..", "out", "deck", "_build");
fs.mkdirSync(BUILD, { recursive: true });
H.pres.writeFile({ fileName: path.join(BUILD, "new.pptx") }).then(() => {
  fs.writeFileSync(path.join(BUILD, "new_manifest.json"), JSON.stringify(H.manifest));
  console.log("new slides:", H.manifest.length);
});
