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

export type ListingDetails = Listing & {
  geometry: {
    type: 'Point'
    coordinates: number[]
  }
  owner: {
    _id: string
    username: string
  } | null
  reviews: Array<{
    _id: string
    comments: string
    rating: number
    author?: {
      _id: string
      username: string
    }
  }>
}

export type ListingResponse = {
  data: ListingDetails
}
