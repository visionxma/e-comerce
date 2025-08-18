"use client"

import { useState, useEffect } from "react"
import { Banner } from "./banner" // importa seu componente principal de banners

export function BannerWrapper() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Renderiza só um quadrado cinza enquanto ainda está no SSR
    return <div className="w-full h-48 bg-muted rounded-lg mb-6"></div>
  }

  return <Banner /> // só monta no client
}
