import { readHtml } from '@/readHtml'
import ObjectsToCsv from 'objects-to-csv'
import { LogTimeUtil } from '@/util/logTimeUtil'
import { writeFile } from 'fs/promises'
import { resolve } from 'path'
import getDataByYear from '@/util/historical-urls'

async function extractData(document: Document, pageUrl: string) {
  const containers = Array.from(document.querySelectorAll('.property-card__container'))
  const createAt = new Date()
  return await Promise.all(containers.map(async (el) => {
    const details = Array.from(el.querySelectorAll('ul.property-card__details .property-card__detail-item'))
    return {
      link: pageUrl,
      title: el.querySelector('.property-card__carousel .carousel__item-wrapper:first-child img')?.getAttribute('alt'),
      address: el.querySelector(".property-card__address")?.textContent?.trim(),
      area: details[0]?.querySelector('.js-property-card-value')?.textContent?.trim(),
      rooms: details[1]?.querySelector('.js-property-card-value')?.textContent?.trim(),
      bathrooms: details[2]?.querySelector('.js-property-card-value')?.textContent?.trim(),
      garage: details[3]?.querySelector('.js-property-card-value')?.textContent?.trim(),
      price: el.querySelector('.property-card__price')?.textContent?.trim().replace(/R\$|\s/g, ''),
      ...await extractInternalData('https://web.archive.org' + el.querySelector('a.property-card__main-link')?.getAttribute('href')),
      createdAt: createAt.toISOString().split('.')[0].replace('T', '-'),
    }
  }))
}

async function extractInternalData(url: string) {
  try {
    const document = await readHtml(url)
    return {
      condo: document.querySelector('span.price__list-value.condominium')?.textContent?.replace(/R\$|\s/g, '').trim(),
      suite: document.querySelector('small')?.textContent?.trim(),
      zone: Array.from(document.querySelectorAll('.breadcrumb__item-name')).map(item => item.textContent?.trim())[4],
      district: Array.from(document.querySelectorAll('.breadcrumb__item-name')).map(item => item.textContent?.trim())[5],
      characteristics: Array.from(document.querySelectorAll('ul.amenities__list li')).map(item => item.textContent?.trim()),
    }
  } catch (e) {
    // console.log(`error extracting data for ${url}`)
  }

  return {
    condo: undefined,
    suite: undefined,
    zone: undefined,
    district: undefined,
    characteristics: undefined,
  }
}

async function getData(url: string) {
  const dom = await readHtml(url)
  return await extractData(dom, url)
}


async function getAllData() {
  const urls = getDataByYear(2019)
  const data: any[] = []
  const errorPages: number[] = []
  for (const [index, url] of urls.entries()) {
    for (let i = 1; i < 8; i++) {
      const append = i > 1 ? `?pagina=${i}` : ''
      try {
        const logTimeUtil = new LogTimeUtil()
        data.push(...await getData(url + append))
        console.info(`Finished page ${index} - ${i} after ${logTimeUtil.getElapsedTime()} seconds`)
      } catch (e: any) {
        console.error('error processing data', e)
        errorPages.push(i)
      }
    }
  }

  await writeFile(resolve('./error_pages.txt'), errorPages.toString(), { encoding: 'utf-8' })
  await new ObjectsToCsv(data).toDisk('./final.csv')
}

async function run() {
  const data = await extractInternalData('https://web.archive.org/web/20200101112349/https://www.vivareal.com.br/imovel/apartamento-2-quartos-santana-zona-norte-sao-paulo-com-garagem-90m2-venda-RS699753-id-2456657010/')
  console.log(data)
}

getAllData()
