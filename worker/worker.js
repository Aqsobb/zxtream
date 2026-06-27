export default {
  async fetch(request) {
    const url = new URL(request.url);
    const target = url.searchParams.get("url");

    if (!target) {
      return new Response("Usage: /?url=https://anichin.moe/", {
        headers: { "Content-Type": "text/plain" },
      });
    }

    const uas = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    ];

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const resp = await fetch(target, {
          headers: {
            "User-Agent": uas[attempt % uas.length],
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Sec-Ch-Ua": '"Chromium";v="126", "Not/A)Brand";v="8", "Google Chrome";v="126"',
            "Sec-Ch-Ua-Mobile": "?0",
            "Sec-Ch-Ua-Platform": '"Linux"',
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Upgrade-Insecure-Requests": "1",
          },
        });

        const html = await resp.text();

        if (html.includes("challenge-platform") || html.includes("cf-browser-verification")) {
          if (attempt < 1) continue;
        }

        return new Response(html, {
          status: resp.status,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=120",
          },
        });
      } catch (e) {
        if (attempt === 1) {
          return new Response(JSON.stringify({ error: e.message }), {
            status: 502,
            headers: { "Content-Type": "application/json" },
          });
        }
      }
    }
  },
};
