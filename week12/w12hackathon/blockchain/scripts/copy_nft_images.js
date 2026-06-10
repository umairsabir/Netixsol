import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = "/home/talhak911/.gemini/antigravity-ide/brain/5a44e0d8-ec7a-4367-99d7-b25532b6a326";
const targetDir = path.join(__dirname, "../../frontend/public/images");

// Source files generated
const sourceFiles = {
  0: "neon_cyber_glitch_1779433956769.png", // Neon Cyber Glitch
  1: "nebula_voyager_1779433987107.png",     // Nebula Voyager
  2: "quantum_portal_1779434262511.png",     // Quantum Portal
  4: "ether_shard_1779434374182.png",        // Ether Shard
  9: "antigravity_core_1779434487247.png"      // Antigravity Core
};

// We will map other slots to these high quality generated ones to ensure all 10 have gorgeous images
const mapping = {
  0: 0,
  1: 1,
  2: 2,
  3: 1, // reuse nebula voyager for synthwave sunset
  4: 4,
  5: 0, // reuse neon cyber glitch for pixelated potion
  6: 2, // reuse quantum portal for holographic skull
  7: 4, // reuse ether shard for golden bitcoin
  8: 9, // reuse antigravity core for crypto kitty
  9: 9
};

function main() {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  for (let i = 0; i <= 9; i++) {
    const srcIndex = mapping[i];
    const srcFilename = sourceFiles[srcIndex];
    const srcPath = path.join(sourceDir, srcFilename);
    const destPath = path.join(targetDir, `nft_${i}.png`);

    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied ${srcFilename} to ${destPath}`);
    } else {
      console.error(`Source file does not exist: ${srcPath}`);
    }
  }
}

main();
