"use client"

import { useState, useEffect } from "react"
import { Banner } from "./banner"

export function BannerWrapper() {
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    
    // Simula um pequeno delay para transição suave
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 150)

    return () => clearTimeout(timer)
  }, [])

  if (!mounted || isLoading) {
    // Skeleton loader mais sofisticado seguindo o design moderno
    return (
      <div className="relative w-full mb-8 group">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 shadow-2xl">
          <div className="relative h-56 md:h-72 lg:h-96 flex items-center justify-center overflow-hidden">
            {/* Background animado */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-purple-800/30 animate-pulse"></div>
            
            {/* Elementos decorativos animados */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            {/* Skeleton do conteúdo no canto inferior */}
            <div className="absolute bottom-6 left-6 z-10">
              <div className="backdrop-blur-md bg-black/20 rounded-lg p-3 border border-white/10 shadow-lg animate-pulse">
                <div className="w-32 h-4 bg-white/20 rounded mb-2"></div>
                <div className="w-24 h-3 bg-white/15 rounded mb-1"></div>
                <div className="w-20 h-3 bg-white/15 rounded"></div>
              </div>
            </div>

            {/* Skeleton dos botões de navegação */}
            <div className="absolute left-6 top-1/2 transform -translate-y-1/2 opacity-30">
              <div className="backdrop-blur-md bg-white/10 p-3 rounded-full animate-pulse">
                <div className="w-6 h-6 bg-white/20 rounded"></div>
              </div>
            </div>
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 opacity-30">
              <div className="backdrop-blur-md bg-white/10 p-3 rounded-full animate-pulse">
                <div className="w-6 h-6 bg-white/20 rounded"></div>
              </div>
            </div>

            {/* Skeleton dos indicadores */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
              <div className="w-8 h-3 bg-white/30 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-white/20 rounded-full animate-pulse delay-200"></div>
              <div className="w-3 h-3 bg-white/20 rounded-full animate-pulse delay-300"></div>
            </div>

            {/* Barra de progresso skeleton */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
              <div className="h-full w-1/3 bg-gradient-to-r from-purple-500/50 to-blue-500/50 animate-pulse"></div>
            </div>

            {/* Texto de carregamento sutil */}
            <div className="relative z-10 text-center">
              <div className="backdrop-blur-sm bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white/80 rounded-full animate-spin mx-auto"></div>
                <p className="text-white/60 text-sm mt-2 font-medium">Carregando...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in-0 duration-300">
      <Banner />
    </div>
  )
}