export type Listing = {
  _id: string
  title: string
  description: string
  image: {
    url: string
    filename: string
  }
  price: number
  location: string
  country: string
  category: string
}

export type ListingsResponse = {
  data: Listing[]
  meta: {
    count: number
    filters: {
      category: string | null
      search: string
    }
  }
}
