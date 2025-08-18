import { Package, ShoppingCart } from "lucide-react"

export function Header() {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-40 backdrop-blur-md bg-card/95">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Package className="h-7 w-7 text-primary" />
              <ShoppingCart className="h-4 w-4 text-accent absolute -top-1 -right-1" />
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gradient">Sua Logo Aqui</h1>
            <p className="text-xs text-muted-foreground">Delivery Express</p>
          </div>
        </div>
      </div>
    </header>
  )
}