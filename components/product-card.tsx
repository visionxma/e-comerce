"use client"

import { Eye, ShoppingCart, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { useState } from "react"
import { CartButton } from "./cart-button"
import type { Product } from "@/e-comerce/app/page"

interface ProductCardProps {
  product: Product
  isSelected: boolean
  onSelect: () => void
  compact?: boolean
}

export function ProductCard({ product, isSelected, onSelect, compact = false }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const images = product.images && product.images.length > 0 ? product.images : ["/placeholder.svg"]

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div
      onClick={onSelect}
      className={`group relative bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-300 border border-gray-200 hover:shadow-lg hover:shadow-blue-300/20 hover:border-blue-300 h-full ${
        isSelected ? "ring-2 ring-blue-500 border-blue-500" : ""
      }`}
    >
      {/* Container da imagem */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        <img 
          src={images[currentImageIndex]} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
        
        {/* Overlay gradiente sutil */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Badge de preço */}
        <div className="absolute top-2 left-2 backdrop-blur-md bg-white/90 rounded-full px-2 py-1 shadow-sm border border-white/50">
          <span className="text-xs font-bold text-blue-600">
            R$ {product.price.toFixed(2)}
          </span>
        </div>

        {/* Badges informativos (tamanho e marca) */}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
          {product.size && (
            <div className="backdrop-blur-md bg-black/70 text-white rounded-md px-1.5 py-0.5">
              <span className="text-[10px] font-medium">{product.size}</span>
            </div>
          )}
          {product.brand && (
            <div className="backdrop-blur-md bg-black/70 text-white rounded-md px-1.5 py-0.5">
              <span className="text-[10px] font-medium">{product.brand}</span>
            </div>
          )}
        </div>

        {/* Ícone de visualização */}
        <div className="absolute top-10 right-2 z-10 transition-all duration-300 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100">
          <div className="bg-white/90 backdrop-blur-sm border border-blue-200 text-blue-600 rounded-full p-1.5 shadow-md">
            <Eye className="h-3 w-3" />
          </div>
        </div>
        
        {/* Navegação do carrossel - só aparece se houver mais de uma imagem */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            
            {/* Indicadores de imagem */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Conteúdo do card */}
      <div className="p-3 space-y-2">
        <div className="space-y-1">
          <h3 className="font-semibold text-gray-900 leading-tight line-clamp-2 text-xs">
            {product.name}
          </h3>
          <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Categoria */}
        {product.category && (
          <div className="flex items-center">
            <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
              {product.category}
            </span>
          </div>
        )}

        {/* Footer do card */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          {/* Indicador de estoque */}
          {product.stock !== undefined && (
            <div className={`text-[10px] font-medium ${
              product.stock > 0 ? 'text-blue-600' : 'text-rose-600'
            }`}>
              {product.stock > 0 ? `${product.stock} em estoque` : 'Sem estoque'}
            </div>
          )}
          
          {/* Indicador de ação */}
          <div className="flex items-center transition-all duration-300 text-gray-400 group-hover:text-blue-600">
            <CartButton 
              product={product} 
              variant="icon" 
              className="h-6 w-6 text-xs bg-blue-600 hover:bg-blue-700 text-white border-0"
            />
          </div>
        </div>
      </div>

      {/* Overlay de hover */}
      <div className="absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none group-hover:bg-gradient-to-r group-hover:from-blue-500/5 group-hover:via-transparent group-hover:to-black/5"></div>

      {/* Shimmer effect sutil */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
      </div>
    </div>
  )
}