import { fetchFromWebOrCache } from '@/fetchFromWebOrCache'
import { JSDOM } from 'jsdom'

export async function readHtml(url: string): Promise<Document> {
  const HTMLData = await fetchFromWebOrCache(url)
  const dom = new JSDOM(HTMLData)
  return dom.window.document
}
