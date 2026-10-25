import { useEffect, useState } from 'react'
import { getPhoto } from '../lib/photos'

export function Photo({ id, className, alt = '' }: { id?: string; className?: string; alt?: string }) {
  const [src, setSrc] = useState<string>()
  useEffect(() => {
    let alive = true
    if (id) getPhoto(id).then((s) => alive && setSrc(s)).catch(() => {})
    return () => {
      alive = false
    }
  }, [id])
  if (!id || !src) return null
  return <img src={src} alt={alt} className={className} loading="lazy" />
}
