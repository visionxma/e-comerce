"use client"

import { useCart } from "./cart-provider"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface CartButtonProps {
  product: any
  variant?: "default" | "icon" | "compact"
  className?: string
}

export function CartButton({ product, variant = "default", className = "" }: CartButtonProps) {
  const { addItem, getTotalItems } = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    addItem(product)
  }

  if (variant === "icon") {
    return (
      <Button
        onClick={handleAddToCart}
        size="icon"
        className={`relative ${className}`}
      >
        <Plus className="h-4 w-4" />
        {getTotalItems() > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
            {getTotalItems()}
          </Badge>
        )}
      </Button>
    )
  }

  if (variant === "compact") {
    return (
      <Button
        onClick={handleAddToCart}
        size="sm"
        className={`flex items-center gap-1 ${className}`}
      >
        <Plus className="h-3 w-3" />
        <span className="text-xs">Adicionar</span>
      </Button>
    )
  }

  return (
    <Button
      onClick={handleAddToCart}
      className={`flex items-center gap-2 ${className}`}
    >
      <ShoppingCart className="h-4 w-4" />
      Adicionar ao Carrinho
    </Button>
  )
}
