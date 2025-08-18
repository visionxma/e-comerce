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

      console.log("Banners carregados:", bannersData) // 👈 debug
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
    <div className="relative w-full mb-8 rounded-lg overflow-hidden shadow-lg group">
      <div
        className="relative h-48 md:h-64 lg:h-80 flex items-center justify-center text-white overflow-hidden"
        style={{ backgroundColor: currentBanner.backgroundColor || "#059669" }}
      >
        {currentBanner.imageUrl && (
          <img
            src={currentBanner.imageUrl}
            alt={currentBanner.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

<div className="relative w-full h-48 rounded-lg overflow-hidden">
  {banners.length > 0 && (
    <img
      src={banners[currentBannerIndex]?.imageUrl}
      alt="Banner promocional"
      className="w-full h-full object-cover"
    />
  )}


  {/* Bolinhas de navegação */}
  {banners.length > 1 && (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
      {banners.map((_, index) => (
        <button
          key={index}
          onClick={() => goToBanner(index)}
          className={`w-3 h-3 rounded-full transition-all ${
            index === currentBannerIndex
              ? "bg-white"
              : "bg-white bg-opacity-50 hover:bg-opacity-75"
          }`}
        />
      ))}
    </div>
  )}
</div>



        {banners.length > 1 && (
          <>
            <button
              onClick={prevBanner}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextBanner}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-6 h-6" />
            </button> //é verdade
          </>
        )}
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToBanner(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentBannerIndex ? "bg-white" : "bg-white bg-opacity-50 hover:bg-opacity-75"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
