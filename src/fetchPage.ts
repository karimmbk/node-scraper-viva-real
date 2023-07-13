import axios, { AxiosError } from 'axios'
import { setTimeout } from 'timers/promises'

export async function fetchPage(url: string, retry = 3): Promise<string | undefined> {
  try {
    const html = await axios.get(url)
    return html.data
  } catch (e: any) {
    const error = e as AxiosError
    // console.error(`There was an error with ${error.config?.url}.`)
    if (error.response?.status === 429 && retry) {
      console.log('Waiting 15s to continue...')
      await setTimeout(15000)

      return await fetchPage(url, retry - 1)
    }
    // console.log(`Failed to extract the data for url ${url} after ${retry} retries`)
    throw new Error(error.message)
  }
}
