import axios from 'axios'
import { JSDOM } from 'jsdom'
import { Readability } from '@mozilla/readability'
import NodeCache from 'node-cache'

const cache = new NodeCache({ stdTTL: 3600 }) // cache for 1 hour

export const fetchArticleText = async (url: string) => {
    if (cache.has(url)) return cache.get(url);
    try {
        const { data: html } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.google.com/',
                'Connection': 'keep-alive',
                'Accept-Encoding': 'gzip, deflate, br'
            },
        });
        const dom = new JSDOM(html, { url });
        const reader = new Readability(dom.window.document);
        const article = reader.parse();

        return article?.excerpt || '';
    } catch (err: any) {
        console.warn(`Failed to fetch: ${url}`, err.message);
        return '';
    }
}