const path = require("path");
const dotenv = require("dotenv");

const projectRoot = path.join(__dirname, "..");

// Local secret files are gitignored. Existing process/Vercel variables always
// win because dotenv does not overwrite values by default.
for (const filename of [".env.apexstart.local", ".env.local", ".env"]) {
  dotenv.config({ path: path.join(projectRoot, filename), quiet: true });
}
