export const getValue = (attr: string, year: number) => {
  const data: any = {
    title: {
      2020: '.property-card__carousel .carousel__item-wrapper:first-child img',
      2021: '.property-card__carousel .carousel__item-wrapper:first-child img',
      2022: '.property-card__carousel .carousel__item-wrapper:first-child img',
    },
    address: {},
    area: {},
    rooms: {},
    bathrooms: {},
    garage: {},
    price: {},
  }
  return data[attr][year]
}
