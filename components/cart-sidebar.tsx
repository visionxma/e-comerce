"use client"

import { useCart } from "./cart-provider"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Plus, Minus, Trash2, X, Loader2 } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface CartSidebarProps {
  userData: { name: string; phone: string; address: string } | null
}

export function CartSidebar({ userData }: CartSidebarProps) {
  const { items, removeItem, updateQuantity, clearCart, getTotalItems, getTotalPrice, isOpen, setIsOpen } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCheckout = async () => {
    if (items.length === 0) return
    
    setIsProcessing(true)
    
    try {
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
      
      // Abrir WhatsApp em nova aba
      const newWindow = window.open(whatsappUrl, "_blank")
      
      // Esperar um pouco antes de limpar o carrinho para garantir que o WhatsApp abriu
      setTimeout(() => {
        clearCart()
        setIsOpen(false)
        setIsProcessing(false)
      }, 1000)
      
    } catch (error) {
      console.error("Erro ao processar pedido:", error)
      setIsProcessing(false)
    }
  }

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id)
    } else {
      updateQuantity(id, newQuantity)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative transition-all hover:scale-105">
          <ShoppingCart className="h-4 w-4" />
          {getTotalItems() > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 animate-pulse">
              {getTotalItems()}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <SheetHeader className="flex-1">
            <SheetTitle className="flex items-center gap-2 text-lg">
              <ShoppingCart className="h-5 w-5" />
              Meu Carrinho
              {getTotalItems() > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'itens'}
                </Badge>
              )}
            </SheetTitle>
          </SheetHeader>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col h-full">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Seu carrinho está vazio</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Adicione produtos incríveis ao seu carrinho
              </p>
              <Button onClick={() => setIsOpen(false)} variant="default" className="gap-2">
                Continuar comprando
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              {/* Lista de itens com scroll */}
              <div className="flex-1 overflow-y-auto py-4 px-4 space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg bg-background hover:shadow-sm transition-shadow">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = '/api/placeholder/64/64'
                      }}
                    />
                    
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-medium text-sm line-clamp-2 leading-tight">{item.name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{item.category}</Badge>
                        {item.size && (
                          <Badge variant="secondary" className="text-xs">{item.size}</Badge>
                        )}
                      </div>
                      <p className="text-sm font-bold text-primary">
                        R$ {item.price.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      {/* Controles de quantidade */}
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Subtotal e remover */}
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-right min-w-[70px]">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </p>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Resumo e checkout */}
              <div className="p-4 space-y-4 bg-muted/30">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-primary">
                      R$ {getTotalPrice().toFixed(2)}
                    </span>
                  </div>
                  
                  {userData && (
                    <div className="text-xs text-muted-foreground">
                      Entrega para: {userData.name} • {userData.address}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className={cn(
                      "w-full py-3 rounded-xl font-bold transition-all duration-300",
                      "bg-gradient-to-r from-blue-600 to-black hover:from-blue-700 hover:to-gray-900",
                      "text-white shadow-lg hover:shadow-xl"
                    )}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processando...
                      </>
                    ) : (
                      "Finalizar Pedido no WhatsApp"
                    )}
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={clearCart}
                      variant="outline"
                      className="flex-1"
                      disabled={isProcessing}
                    >
                      Limpar Carrinho
                    </Button>
                    <Button
                      onClick={() => setIsOpen(false)}
                      variant="outline"
                      className="flex-1"
                      disabled={isProcessing}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Fechar
                    </Button>
                    <Button
                      onClick={() => setIsOpen(false)}
                      variant="ghost"
                      className="flex-1"
                      disabled={isProcessing}
                    >
                      Continuar Comprando
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Pedido seguro
                  </div>
                  <div className="w-1 h-1 bg-muted rounded-full"></div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Entrega garantida
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}