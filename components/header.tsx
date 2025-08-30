import { CartSidebar } from "./cart-sidebar"
import { useCart } from "./cart-provider"
import { ShoppingCart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function Header() {
  const { getTotalItems, setIsOpen } = useCart()

  return (
    <header className="bg-[#0000FF] border-b border-blue-800 sticky top-0 z-40 backdrop-blur-md bg-[#0000FF]/95 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-white">
          Sua Logo Aqui
        </h1>
        
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
    </header>
  )
}