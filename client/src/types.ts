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

export type Review = {
  _id: string
  comments: string
  rating: number
  createdAt?: string
  author?: {
    _id: string
    username: string
  }
}

export type ListingDetails = Listing & {
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
  owner: {
    _id: string
    username: string
  } | null
  reviews: Review[]
}

export type ListingResponse = {
  data: ListingDetails
}

export type CreateListingResponse = {
  data: ListingDetails
}

export type ReviewResponse = {
  data: Review
}

export type DeleteResponse = {
  data: {
    id: string
    deleted: boolean
  }
}

export type CurrentUser = {
  id: string
  username: string
  email: string
}

export type AuthResponse = {
  data: {
    authenticated: boolean
    user: CurrentUser | null
  }
}

export type ApiErrorResponse = {
  error: {
    code: string
    message: string
  }
}
