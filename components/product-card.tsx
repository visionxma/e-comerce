"use client"

import { Check } from "lucide-react"
import type { Product } from "@/e-comerce/app/page"

interface ProductCardProps {
  product: Product
  isSelected: boolean
  onSelect: () => void
}

export function ProductCard({ product, isSelected, onSelect }: ProductCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`relative bg-card border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
        isSelected ? "border-primary bg-primary/5 shadow-md" : "border-border hover:border-primary/50 hover:shadow-sm"
      }`}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
          <Check className="h-4 w-4" />
        </div>
      )}

      <div className="aspect-square mb-3 overflow-hidden rounded-md bg-muted">
        <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-card-foreground">{product.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">R$ {product.price.toFixed(2)}</span>
          {product.size && (
            <span className="text-sm bg-muted px-2 py-1 rounded text-muted-foreground">{product.size}</span>
          )}
        </div>
      </div>
    </div>
  )
}
