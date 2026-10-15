import fs from 'node:fs';
import path from 'node:path';
const site=new URL(process.env.SITE_URL||'https://roamark.onrender.com');
if(site.protocol!=='https:'||site.pathname!=='/'||site.search||site.hash||site.username||site.password)throw Error('SITE_URL must be an HTTPS origin');
const origin=site.origin;
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const descriptions={
 '/review/':'Share your own travel experience, Feel Index ratings, photos and videos with the Roamark community.',
 '/privacy/':'How Roamark handles accounts, contributions, analytics consent, privacy requests and your personal information.',
 '/terms/':'Read the terms for using Roamark, sharing travel contributions and participating in our community.',
 '/about/':'Meet Naman Sinha and discover why Roamark brings traveler perspectives and the feeling of a place together.',
 '/india/':'Explore India’s destinations, hiking trails, monasteries, villages and viewpoints with Roamark travel guides.',
 '/profile/':'Sign in to manage your Roamark profile, saved places and travel contributions.',
 '/admin/':'Roamark community contribution moderation.',
 '/contact/':'Contact Roamark owner Naman Sinha for destination suggestions, corrections, account support and privacy requests.',
 '/thank-you/':'Thank you for contributing your travel perspective. Track your review’s moderation status in your profile.',
 '/404.html':'This Roamark page could not be found. Explore destinations or return to the homepage.'
};
const urls=[];
function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,item.name);if(item.isDirectory()){walk(file);continue}if(!file.endsWith('.html')||item.name==='place-template.html')continue;
 const route='/'+path.relative('public',file).replaceAll(path.sep,'/').replace(/index\.html$/,'');
 let html=fs.readFileSync(file,'utf8').replace(/<!-- launch-meta -->[\s\S]*?<!-- \/launch-meta -->/g,'');
 const title=html.match(/<title>(.*?)<\/title>/s)?.[1];if(!title)throw Error('Missing title: '+file);
 let description=html.match(/<meta name="description" content="([^"]*)"/i)?.[1];if(!description){description=escape(descriptions[route]||'Explore places and honest traveler perspectives with Roamark.');html=html.replace('</head>',`<meta name="description" content="${description}"></head>`)}
 const privatePage=/^\/(admin|profile|review|thank-you)(\/|$)/.test(route)||route==='/404.html';
 const canonical=origin+route;
 const meta=`<!-- launch-meta --><link rel="canonical" href="${canonical}"><meta property="og:site_name" content="Roamark"><meta property="og:type" content="website"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${origin}/assets/roamark-share.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Roamark — Find places that feel right. Illustrated mountains and a winding trail."><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}"><meta name="twitter:image" content="${origin}/assets/roamark-share.png">${privatePage?'<meta name="robots" content="noindex,follow">':''}<link rel="stylesheet" href="/launch.css"><link rel="stylesheet" href="/mobile.css"><!-- /launch-meta -->`;
 html=html.replace('</head>',meta+'</head>');
 if(!html.includes('<footer>'))html=html.replace('</body>','<footer><a href="/contact/">Contact Roamark</a></footer></body>');
 html=html.replace(/<footer>([\s\S]*?)<\/footer>/g,(full,inside)=>inside.includes('href="/contact/"')?full:`<footer>${inside}<a href="/contact/">Contact</a></footer>`);
 fs.writeFileSync(file,html);if(!privatePage)urls.push(canonical);
}}
walk('public');
fs.writeFileSync('public/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.sort().map(url=>`  <url><loc>${escape(url)}</loc></url>`).join('\n')+'\n</urlset>\n');
fs.writeFileSync('public/robots.txt',`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${origin}/sitemap.xml\n`);
console.log(`Prepared metadata and sitemap for ${urls.length} public pages.`);
