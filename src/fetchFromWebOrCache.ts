import {existsSync, mkdirSync} from 'fs';
import {readFile, writeFile} from 'fs/promises';
import {resolve} from 'path';
import {fetchPage} from "@/fetchPage";

export async function fetchFromWebOrCache(url: string, ignoreCache = false): Promise<string | undefined> {
    // If the cache folder doesn't exist, create it
    if (!existsSync(resolve(__dirname, '.cache'))) {
        mkdirSync('.cache');
    }
    console.log(`Getting data for ${url}...`);
    if (!ignoreCache && existsSync(resolve(__dirname, `.cache/${Buffer.from(url).toString('base64')}.html`))) {
        console.log(`I read ${url} from cache`);
        return await readFile(
            resolve(__dirname, `.cache/${Buffer.from(url).toString('base64')}.html`),
            {encoding: 'utf8'},
        );
    }

    console.log(`I fetched ${url} fresh`);
    const htmlData = await fetchPage(url);
    if (!ignoreCache && htmlData) {
        await writeFile(
            resolve(__dirname, `.cache/${Buffer.from(url).toString('base64')}.html`),
            htmlData,
            {encoding: 'utf8'},
        );
    }
    return htmlData;
}
