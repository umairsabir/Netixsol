async function run() {
  const playerId = 43650;
  const res = await fetch(`https://www.espncricinfo.com/ci/content/player/${playerId}.html`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }
  });
  const text = await res.text();
  const titleMatch = text.match(/<title>(.*?)<\/title>/);
  console.log("Title:", titleMatch ? titleMatch[1] : "Not found");
}
run();
