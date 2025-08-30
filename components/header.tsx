"use client"
import { useCart } from "./cart-provider"
import { ShoppingCart, Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Header() {
  const { getTotalItems, setIsOpen } = useCart()

  return (
    <header className="bg-[#0000FF] border-b border-blue-800 sticky top-0 z-40 backdrop-blur-md bg-[#0000FF]/95 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-extrabold text-white hover:text-blue-200 transition-colors">
          Sua Logo Aqui
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/pedidos">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Meus Pedidos</span>
            </Button>
          </Link>

          {/* Botão do carrinho */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(true)}
            className="relative text-white hover:bg-white/20"
          >
            <ShoppingCart className="h-5 w-5" />
            {getTotalItems() > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-white text-blue-600">
                {getTotalItems()}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}
