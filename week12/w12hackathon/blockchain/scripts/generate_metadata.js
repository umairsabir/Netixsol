import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const metadataDir = path.join(__dirname, "../../frontend/public/metadata");

const nfts = [
  { name: "Neon Cyber Glitch", price: "50", desc: "A glitchy digital cyberpunk artifact.", class: "Glitch" },
  { name: "Nebula Voyager", price: "100", desc: "Deep space explorer vessel floating in cosmic dust.", class: "Cosmic" },
  { name: "Quantum Portal", price: "150", desc: "A gateway connecting parallel dimensions.", class: "Quantum" },
  { name: "Synthwave Sunset", price: "200", desc: "Classic 80s aesthetics with glowing grid sun.", class: "Retro" },
  { name: "Ether Shard", price: "250", desc: "A crystalline fragment of pure decentralized energy.", class: "Crystalline" },
  { name: "Pixelated Potion", price: "300", desc: "Restores mana and opens local Web3 state.", class: "Alchemy" },
  { name: "Holographic Skull", price: "350", desc: "Digital memento mori in neon cyber space.", class: "Cybernetic" },
  { name: "Golden Bitcoin", price: "400", desc: "A physical representation of digital gold.", class: "Financial" },
  { name: "Crypto Kitty V2", price: "450", desc: "An advanced agentic kitten with laser eyes.", class: "Agentic" },
  { name: "Antigravity Core", price: "500", desc: "Powering agentic developers since 2026.", class: "Core" },
];

const cids = {
  0: "bafybeihbutkaceymmlfnpkz6iy2bkwwyznx6d5tezazvkzj55mi7z4ymtq",
  1: "bafybeicfafsx63zh2sdfuvalrhbblqnhuci5nhbbjsrf6ssxgjfyoqee5i",
  2: "bafybeickrsuxulnqnnz53sx75xp5ydtnzj2j6erfe4relvgnc2zzqc3smi",
  3: "bafybeicfafsx63zh2sdfuvalrhbblqnhuci5nhbbjsrf6ssxgjfyoqee5i",
  4: "bafybeicfp2gc7odearywjbnr6gixxd2prn7m3drmnwk4ikfbnwptumxqem",
  5: "bafybeihbutkaceymmlfnpkz6iy2bkwwyznx6d5tezazvkzj55mi7z4ymtq",
  6: "bafybeickrsuxulnqnnz53sx75xp5ydtnzj2j6erfe4relvgnc2zzqc3smi",
  7: "bafybeicfp2gc7odearywjbnr6gixxd2prn7m3drmnwk4ikfbnwptumxqem",
  8: "bafybeiabxkgcg52rbadzopfmoepja3b6hgnxuipusraxokg7nsvkgkyof4",
  9: "bafybeiabxkgcg52rbadzopfmoepja3b6hgnxuipusraxokg7nsvkgkyof4",
};

function main() {
  if (!fs.existsSync(metadataDir)) {
    fs.mkdirSync(metadataDir, { recursive: true });
  }

  for (let i = 0; i < nfts.length; i++) {
    const nft = nfts[i];
    const metadata = {
      name: nft.name,
      description: nft.desc,
      image: `https://gateway.pinata.cloud/ipfs/${cids[i]}`,
      attributes: [
        { trait_type: "Class", value: nft.class },
        { trait_type: "Price", value: `${nft.price} DNFT` }
      ]
    };
    const filepath = path.join(metadataDir, `nft_${i}.json`);
    fs.writeFileSync(filepath, JSON.stringify(metadata, null, 2), "utf-8");
    console.log(`Generated ${filepath}`);
  }
}

main();
