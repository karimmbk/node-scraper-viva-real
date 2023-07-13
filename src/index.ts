import { readHtml } from '@/readHtml'
import ObjectsToCsv from 'objects-to-csv'
import { LogTimeUtil } from '@/util/logTimeUtil'
import { writeFile } from 'fs/promises'
import { resolve } from 'path'

async function extractData(document: Document, pageUrl: string) {
  const containers = Array.from(document.querySelectorAll('.property-card__content-link'))
  const createAt = new Date()
  return await Promise.all(containers.map(async (el) => {
    return {
      link: pageUrl,
      title: el.querySelector('.property-card__title')?.textContent?.trim(),
      address: el.querySelector('.property-card__address')?.textContent?.trim(),
      area: el.querySelector('.property-card__detail-area .js-property-card-value')?.textContent?.trim(),
      rooms: el.querySelector('.property-card__detail-room .js-property-card-value')?.textContent?.trim(),
      bathrooms: el.querySelector('.property-card__detail-bathroom .js-property-card-value')?.textContent?.trim(),
      garages: el.querySelector('.property-card__detail-garage .js-property-card-value')?.textContent?.trim(),
      price: el.querySelector('.js-property-card__price-small p')?.textContent?.trim().replace(/R\$|\s/g, ''),
      ...await extractInternalData('https://www.vivareal.com.br' + el.getAttribute('href')),
      createdAt: createAt.toISOString().split('.')[0].replace('T', '-'),
    }
  }))
}

async function extractInternalData(url: string) {
  const document = await readHtml(url)
  return {
    condo: document.querySelector('span.price__list-value.condominium')?.textContent?.replace(/R\$|\s/g, '').trim(),
    suite: document.querySelector('small')?.textContent?.trim(),
    zone: Array.from(document.querySelectorAll('.breadcrumb__menu-item')).map(item => item.textContent?.trim())[2],
    district: Array.from(document.querySelectorAll('.breadcrumb__menu-item')).map(item => item.textContent?.trim())[3],
    characteristics: document.querySelector('ul.amenities__list')?.textContent?.trim().split('      ').map(item => item.trim()),
  }
}

async function getData(url: string) {
  const dom = await readHtml(url)
  return await extractData(dom, url)
}


async function getAllData() {
  const baseUrl = 'https://www.vivareal.com.br/venda/sp/sao-paulo/?pagina=#onde=Brasil,S%C3%A3o%20Paulo,S%C3%A3o%20Paulo,,,,,,BR%3ESao%20Paulo%3ENULL%3ESao%20Paulo,,,'
  const data: any[] = []
  const errorPages: number[] = []
  for (let i = 2; i < 3; i++) {
    const append = i > 1 ? `?pagina=${i}` : ''
    try {
      const logTimeUtil = new LogTimeUtil()
      data.push(...await getData(`https://www.vivareal.com.br/venda/sp/sao-paulo/?pagina=${i}#onde=Brasil,S%C3%A3o%20Paulo,S%C3%A3o%20Paulo,,,,,,BR%3ESao%20Paulo%3ENULL%3ESao%20Paulo,,,`))
      console.info(`Finished page ${i} after ${logTimeUtil.getElapsedTime()} seconds`)
    } catch (e: any) {
      console.error('error processing data', e)
      errorPages.push(i)
    }
  }

  await writeFile(resolve('./error_pages.txt'), errorPages.toString(), { encoding: 'utf-8' })
  await new ObjectsToCsv(data).toDisk('./final_zona_norte.csv')
}

getAllData()
