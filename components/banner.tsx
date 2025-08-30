"use client"

import { useState, useEffect } from "react"
import { collection, onSnapshot, query, orderBy, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Banner {
  id: string
  title: string
  description: string
  imageUrl: string
  linkUrl?: string
  isActive: boolean
  priority: number
  startDate?: string
  endDate?: string
  backgroundColor?: string
  textColor?: string
  createdAt: Date
}

export function Banner() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const bannersQuery = query(
      collection(db, "banners"),
      where("isActive", "==", true),
      orderBy("priority", "desc")
    )

    const unsubscribe = onSnapshot(bannersQuery, (snapshot) => {
      const bannersData: Banner[] = []
      const currentDate = new Date().toISOString().split("T")[0]

      snapshot.forEach((doc) => {
        const data = doc.data()
        const banner = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Banner

        // Sempre adiciona o banner sem checar datas
        bannersData.push(banner)
      })

      console.log("Banners carregados:", bannersData)
      setBanners(bannersData)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (banners.length <= 1) return
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [banners.length])

  const nextBanner = () => setCurrentBannerIndex((prev) => (prev + 1) % banners.length)
  const prevBanner = () => setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length)
  const goToBanner = (index: number) => setCurrentBannerIndex(index)

  if (isLoading) {
    return <div className="w-full h-48 bg-muted animate-pulse rounded-lg mb-6"></div>
  }

  if (banners.length === 0) {
    return null
  }

  const currentBanner = banners[currentBannerIndex]

  return (
    <div className="relative w-full mb-8 group">
      {/* Container principal com bordas arredondadas e sombra moderna */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 shadow-2xl">
        <div
          className="relative h-56 md:h-72 lg:h-96 flex items-center justify-center overflow-hidden"
          style={{ 
            background: currentBanner.backgroundColor 
              ? `linear-gradient(135deg, ${currentBanner.backgroundColor}33, ${currentBanner.backgroundColor})`
              : "linear-gradient(135deg, #0000FF, #000000, #0000FF)"
          }}
        >
          {/* Imagem de fundo com overlay */}
          {currentBanner.imageUrl && (
            <>
              <img
                src={currentBanner.imageUrl}
                alt={currentBanner.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Overlay gradiente para melhor legibilidade */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30"></div>
            </>
          )}

          {/* Elementos decorativos animados */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-black/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          {/* Texto compacto no canto inferior esquerdo */}
          <div className="absolute bottom-6 left-6 z-10 max-w-xs md:max-w-sm">
            <div className="backdrop-blur-md bg-black/30 rounded-lg p-3 border border-white/20 shadow-lg">
              <h3 
                className="text-sm md:text-base font-bold mb-1 leading-tight"
                style={{ color: currentBanner.textColor || "white" }}
              >
                {currentBanner.title}
              </h3>
              {currentBanner.description && (
                <p 
                  className="text-xs md:text-sm opacity-90 leading-tight line-clamp-2"
                  style={{ color: currentBanner.textColor || "white" }}
                >
                  {currentBanner.description}
                </p>
              )}
              
              {/* Botão CTA compacto */}
              {currentBanner.linkUrl && (
                <div className="mt-2">
                  <a
                    href={currentBanner.linkUrl}
                    className="inline-flex items-center text-xs font-medium text-white/90 hover:text-white transition-colors"
                  >
                    Saiba mais
                    <ChevronRight className="ml-1 w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Botões de navegação modernos */}
          {banners.length > 1 && (
            <>
              <button
                onClick={prevBanner}
                className="absolute left-6 top-1/2 transform -translate-y-1/2 backdrop-blur-md bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg border border-white/30"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextBanner}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 backdrop-blur-md bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg border border-white/30"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Indicadores de posição modernos */}
        {banners.length > 1 && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToBanner(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentBannerIndex
                    ? "w-8 h-3 bg-white shadow-lg"
                    : "w-3 h-3 bg-white/50 hover:bg-white/75 hover:scale-125"
                }`}
              />
            ))}
          </div>
        )}

        {/* Barra de progresso para auto-play */}
        {banners.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-black transition-all duration-100"
              style={{ 
                width: `${((currentBannerIndex + 1) / banners.length) * 100}%`
              }}
            ></div>
          </div>
        )}
      </div>
    </div>
  )
}
