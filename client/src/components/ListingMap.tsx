import { useEffect, useRef } from 'react'
import type { Map as MapboxMap } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

type ListingMapProps = {
  coordinates: [number, number]
  title: string
}

function ListingMap({ coordinates, title }: ListingMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapToken = import.meta.env.VITE_MAP_TOKEN
  const [longitude, latitude] = coordinates

  useEffect(() => {
    if (!containerRef.current || !mapToken) return

    let isCancelled = false
    let map: MapboxMap | null = null

    async function createMap() {
      const { default: mapboxgl } = await import('mapbox-gl')

      if (isCancelled || !containerRef.current) return

      mapboxgl.accessToken = mapToken

      map = new mapboxgl.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [longitude, latitude],
        zoom: 9,
      })

      map.addControl(new mapboxgl.NavigationControl(), 'top-right')

      const popup = new mapboxgl.Popup({ offset: 25 }).setText(
        `${title} — Exact location is provided after booking.`,
      )

      new mapboxgl.Marker({ color: '#fe424d' })
        .setLngLat([longitude, latitude])
        .setPopup(popup)
        .addTo(map)
    }

    createMap()

    return () => {
      isCancelled = true
      map?.remove()
    }
  }, [latitude, longitude, mapToken, title])

  if (!mapToken) {
    return (
      <p className="status-message">
        Add VITE_MAP_TOKEN to client/.env.local to display the map.
      </p>
    )
  }

  return <div className="listing-map" ref={containerRef} aria-label={`Map of ${title}`} />
}

export default ListingMap
