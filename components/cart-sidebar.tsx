"use client"

import { useCart } from "./cart-provider"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Plus, Minus, Trash2, X } from "lucide-react"

interface CartSidebarProps {
  userData: { name: string; phone: string; address: string } | null
}

export function CartSidebar({ userData }: CartSidebarProps) {
  const { items, removeItem, updateQuantity, clearCart, getTotalItems, getTotalPrice, isOpen, setIsOpen } = useCart()

  const handleCheckout = () => {
    if (items.length === 0) return

    let customerInfo = ""
    let addressText = ""

    if (userData) {
      customerInfo = `*Cliente:* ${userData.name}\n*Telefone:* ${userData.phone}\n`
      addressText = userData.address
    } else {
      addressText = "Endereço a combinar"
    }

    const itemsList = items.map(item => 
      `• ${item.name} ${item.size ? `(${item.size})` : ""} - Qtd: ${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2)}`
    ).join('\n')

    const total = getTotalPrice()

    const message = `🛒 *PEDIDO DO CARRINHO*

${customerInfo}*Itens do Pedido:*
${itemsList}

*Total: R$ ${total.toFixed(2)}*

*Endereço de entrega:* ${addressText}

📱 *Pedido realizado pelo site*
Gostaria de confirmar este pedido! 🙏`

    const whatsappUrl = `https://wa.me/5599984680391?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
    
    // Limpar carrinho após envio
    clearCart()
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {getTotalItems() > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {getTotalItems()}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Carrinho de Compras
            {getTotalItems() > 0 && (
              <Badge variant="secondary">{getTotalItems()} {getTotalItems() === 1 ? 'item' : 'itens'}</Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Carrinho vazio</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Adicione produtos ao seu carrinho para continuar
              </p>
              <Button onClick={() => setIsOpen(false)} variant="outline">
                Continuar comprando
              </Button>
            </div>
          ) : (
            <>
              {/* Lista de itens */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{item.category}</Badge>
                        {item.size && (
                          <Badge variant="outline" className="text-xs">{item.size}</Badge>
                        )}
                      </div>
                      <p className="text-sm font-bold text-primary mt-1">
                        R$ {item.price.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {/* Controles de quantidade */}
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Botão remover */}
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>

                      {/* Subtotal */}
                      <p className="text-xs font-bold">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Resumo e checkout */}
              <div className="py-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-xl font-bold text-primary">
                    R$ {getTotalPrice().toFixed(2)}
                  </span>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-blue-600 to-black text-white py-3 rounded-xl font-bold hover:from-blue-700 hover:to-gray-900 transition-all duration-300"
                  >
                    Finalizar Pedido no WhatsApp
                  </Button>
                  
                  <Button
                    onClick={clearCart}
                    variant="outline"
                    className="w-full"
                  >
                    Limpar Carrinho
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  🔒 Pedido seguro via WhatsApp • Entrega garantida
                </p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}