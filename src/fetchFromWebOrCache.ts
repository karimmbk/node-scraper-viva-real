import { existsSync, mkdirSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'
import { resolve } from 'path'
import { fetchPage } from '@/fetchPage'

export async function fetchFromWebOrCache(url: string, ignoreCache = false): Promise<string | undefined> {
  // If the cache folder doesn't exist, create it
  if (!existsSync(resolve('./.cache'))) {
    mkdirSync('.cache')
  }

  const path = `./.cache/${Buffer.from(url, 'binary').toString('base64').replace(/[/+=]/gm, '')}.html`
  if (!ignoreCache && existsSync(resolve(path))) {
    return await readFile(resolve(path), { encoding: 'utf8' })
  }

  const htmlData = await fetchPage(url)
  if (!ignoreCache && htmlData) {
    await writeFile(resolve(path), htmlData, { encoding: 'utf8' })
  }

  return htmlData
}
