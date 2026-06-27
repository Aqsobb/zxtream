const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  const { data } = await axios.get('https://anichin.moe', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36' },
    timeout: 15000
  });
  const $ = cheerio.load(data);
  
  console.log('HTML length:', data.length);
  console.log('popularslider .bs count:', $('.popularslider .bs').length);
  console.log('.slider .bs count:', $('.slider .bs').length);
  console.log('.normal .bs count:', $('.normal .bs').length);
  console.log('.postbody .bs count:', $('.postbody .bs').length);
  console.log('.listupd .bs count:', $('.listupd .bs').length);
  console.log('article.bs count:', $('article.bs').length);
  console.log('.bs count:', $('.bs').length);
  
  // Check the popular items
  $('.popularslider .bs').each((i, el) => {
    if (i < 3) {
      const $el = $(el);
      const a = $el.find('a').first();
      console.log('popular item', i, {
        title: a.attr('title'),
        href: a.attr('href'),
        hasEpx: $el.find('.epx').length > 0,
        hasTypez: $el.find('.typez').length > 0
      });
    }
  });
  
  // Check recent items
  console.log('\n--- Recent (normal .bs) ---');
  $('.normal .bs').each((i, el) => {
    if (i < 3) {
      const $el = $(el);
      const a = $el.find('a').first();
      console.log('recent item', i, {
        title: a.attr('title'),
        href: a.attr('href'),
        hasEpx: $el.find('.epx').length > 0,
        hasTypez: $el.find('.typez').length > 0
      });
    }
  });
  
  // Also test the extractItem logic
  console.log('\n--- extractItem test ---');
  const popularslider = $('.popularslider .bs').first();
  if (popularslider.length) {
    const $el = $(popularslider);
    const link = $el.find('a').first();
    const title = link.attr('title') || $el.find('h2').first().text().trim() || '';
    const url = link.attr('href') || '';
    const slug = url.replace(/^\//, '').replace(/\/$/, '');
    const thumbnail = $el.find('img').attr('src') || '';
    const episode = $el.find('.epx').text().trim();
    const type = $el.find('.typez').text().trim().split(' ')[0] || '';
    console.log('extractItem result:', { title, slug, thumbnail: thumbnail.substring(0, 80), episode, type });
  }
}

test().catch(e => console.error(e.message));
