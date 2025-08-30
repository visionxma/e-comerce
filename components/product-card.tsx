"use client"

import { Eye, ShoppingCart } from "lucide-react"
import type { Product } from "@/e-comerce/app/page"

interface ProductCardProps {
  product: Product
  isSelected: boolean
  onSelect: () => void
  compact?: boolean
}

export function ProductCard({ product, isSelected, onSelect, compact = false }: ProductCardProps) {
  return (
    <div
      onClick={onSelect}
      className="group relative bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-300 border border-gray-200 hover:shadow-lg hover:shadow-blue-300/20 hover:border-blue-300 h-full"
    >
      {/* Ícone de visualização */}
      <div className="absolute top-2 right-2 z-10 transition-all duration-300 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100">
        <div className="bg-white/90 backdrop-blur-sm border border-blue-200 text-blue-600 rounded-full p-1.5 shadow-md">
          <Eye className="h-3 w-3" />
        </div>
      </div>

      {/* Container da imagem */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        <img 
          src={product.image || "/placeholder.svg"} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
        
        {/* Overlay gradiente sutil */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Badge de preço flutuante */}
        <div className="absolute bottom-2 left-2 backdrop-blur-md bg-white/90 rounded-full px-2 py-1 shadow-sm border border-white/50">
          <span className="text-xs font-bold text-blue-600">
            R$ {product.price.toFixed(2)}
          </span>
        </div>

        {/* Badge de tamanho se existir */}
        {product.size && (
          <div className="absolute top-2 left-2 backdrop-blur-md bg-black/70 text-white rounded-md px-1.5 py-0.5">
            <span className="text-[10px] font-medium">{product.size}</span>
          </div>
        )}

        {/* Badge de marca se existir */}
        {product.brand && (
          <div className="absolute top-2 right-2 backdrop-blur-md bg-black/70 text-white rounded-md px-1.5 py-0.5">
            <span className="text-[10px] font-medium">{product.brand}</span>
          </div>
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
              product.stock > 0 ? 'text-blue-600' : 'text-black'
            }`}>
              {product.stock > 0 ? `${product.stock} em estoque` : 'Sem estoque'}
            </div>
          )}
          
          {/* Indicador de ação */}
          <div className="transition-all duration-300 text-gray-400 group-hover:text-blue-600">
            <span className="text-[10px]">
              Ver detalhes
            </span>
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