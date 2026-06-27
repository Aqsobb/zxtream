import { NextResponse } from 'next/server';

export async function GET() {
  const results: any = {};
  
  // Test 1: Can we fetch anichin.moe?
  try {
    const res = await fetch('https://anichin.moe', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
      },
      signal: AbortSignal.timeout(15000),
    });
    results.fetchStatus = res.status;
    const html = await res.text();
    results.htmlLength = html.length;
    results.hasPopularslider = html.includes('popularslider');
    results.hasBs = html.includes('class="bs"');
    results.sample = html.substring(0, 500);
  } catch (e: any) {
    results.fetchError = e.message;
  }

  // Test 2: Try scraper
  try {
    const scraper = await import('@/lib/server/scraper');
    const data = await scraper.getHomeAnime();
    results.scraperPopular = data.popular?.length || 0;
    results.scraperRecent = data.recent?.length || 0;
  } catch (e: any) {
    results.scraperError = e.message;
    results.scraperStack = e.stack?.substring(0, 500);
  }

  // Test 3: Check require works
  try {
    const axios = require('axios');
    results.axiosVersion = axios.VERSION || 'unknown';
  } catch (e: any) {
    results.axiosError = e.message;
  }

  try {
    const cheerio = require('cheerio');
    results.cheerioWorks = true;
  } catch (e: any) {
    results.cheerioError = e.message;
  }

  return NextResponse.json(results, { spaces: 2 });
}
