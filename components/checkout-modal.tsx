"use client"

import type React from "react"
import type { Product } from "@/app/page"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { X, ShoppingCart, User, Loader2 } from "lucide-react"
import { useCart } from "./cart-provider"
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "@/hooks/use-toast"

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  directProduct?: Product | null
}

interface CustomerData {
  name: string
  phone: string
  email: string
  address: string
  notes: string
}

export function CheckoutModal({ isOpen, onClose, directProduct }: CheckoutModalProps) {
  const { items, getTotalPrice, clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  })

  const checkoutItems = directProduct
    ? [
        {
          id: directProduct.id,
          name: directProduct.name,
          price: directProduct.price,
          quantity: 1,
          image: directProduct.images?.[0] || "/placeholder.svg",
          category: directProduct.category,
          size: directProduct.size,
          brand: directProduct.brand,
        },
      ]
    : items

  const checkoutTotal = directProduct ? directProduct.price : getTotalPrice()

  useEffect(() => {
    if (isOpen) {
      const savedData = localStorage.getItem("lastCustomerData")
      if (savedData) {
        const parsed = JSON.parse(savedData)
        setCustomerData((prev) => ({
          ...prev,
          name: parsed.name || "",
          phone: parsed.phone || "",
          email: parsed.email || "",
          address: parsed.address || "",
        }))
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerData.name || !customerData.phone || !customerData.address) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    if (checkoutItems.length === 0) {
      toast({
        title: "Nenhum produto selecionado",
        description: "Selecione um produto antes de finalizar.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      const orderData = {
        customerInfo: {
          name: customerData.name,
          phone: customerData.phone,
          email: customerData.email,
          address: customerData.address,
        },
        items: checkoutItems.map((item) => ({
          productId: item.id,
          productName: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.image,
          category: item.category,
          size: item.size,
          brand: item.brand,
        })),
        total: checkoutTotal,
        status: "pending",
        notes: customerData.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const docRef = await addDoc(collection(db, "orders"), orderData)

      let customerDocId = null

      const customerQuery = query(
        collection(db, "customers"),
        where("email", "==", customerData.email || ""),
        where("phone", "==", customerData.phone),
      )

      const existingCustomers = await getDocs(customerQuery)

      if (!existingCustomers.empty) {
        const existingCustomer = existingCustomers.docs[0]
        customerDocId = existingCustomer.id
        const currentData = existingCustomer.data()

        await updateDoc(doc(db, "customers", customerDocId), {
          name: customerData.name,
          email: customerData.email,
          address: customerData.address,
          lastOrderId: docRef.id,
          lastOrderDate: new Date(),
          totalOrders: (currentData.totalOrders || 0) + 1,
          totalSpent: (currentData.totalSpent || 0) + checkoutTotal,
          updatedAt: new Date(),
        })
      } else {
        const customerDoc = {
          name: customerData.name,
          phone: customerData.phone,
          email: customerData.email,
          address: customerData.address,
          lastOrderId: docRef.id,
          lastOrderDate: new Date(),
          totalOrders: 1,
          totalSpent: checkoutTotal,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const newCustomerRef = await addDoc(collection(db, "customers"), customerDoc)
        customerDocId = newCustomerRef.id
      }

      if (!directProduct) {
        clearCart()
      }
      onClose()

      toast({
        title: "Pedido realizado com sucesso!",
        description: `Seu pedido #${docRef.id.slice(-6)} foi registrado. Você receberá atualizações em breve.`,
      })

      localStorage.setItem(
        "lastCustomerData",
        JSON.stringify({
          name: customerData.name,
          phone: customerData.phone,
          email: customerData.email,
          address: customerData.address,
        }),
      )
    } catch (error) {
      console.error("Erro ao processar pedido:", error)
      toast({
        title: "Erro ao processar pedido",
        description: "Tente novamente ou entre em contato conosco.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleWhatsAppCheckout = () => {
    const itemsList = checkoutItems
      .map(
        (item) =>
          `• ${item.name} ${item.size ? `(${item.size})` : ""} - Qtd: ${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2)}`,
      )
      .join("\n")

    const messageType = directProduct ? "COMPRA DIRETA" : "PEDIDO DO CARRINHO"

    const message = `🛒 *${messageType}*

*Cliente:* ${customerData.name}
*Telefone:* ${customerData.phone}
${customerData.email ? `*Email:* ${customerData.email}\n` : ""}
*Itens do Pedido:*
${itemsList}

*Total: R$ ${checkoutTotal.toFixed(2)}*

*Endereço de entrega:* ${customerData.address}
${customerData.notes ? `\n*Observações:* ${customerData.notes}` : ""}

📱 *Pedido realizado pelo site*
Gostaria de confirmar este pedido! 🙏`

    const whatsappUrl = `https://wa.me/5599984680391?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")

    if (!directProduct) {
      clearCart()
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">{directProduct ? "Comprar Agora" : "Finalizar Pedido"}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Seus Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={customerData.name}
                    onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                    placeholder="(99) 99999-9999"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerData.email}
                  onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                  placeholder="seu@email.com"
                  required
                />
                <p className="text-xs text-muted-foreground">Necessário para acompanhar seus pedidos</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Endereço de Entrega *</Label>
                <Textarea
                  id="address"
                  value={customerData.address}
                  onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                  placeholder="Rua, número, bairro, cidade..."
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Textarea
                  id="notes"
                  value={customerData.notes}
                  onChange={(e) => setCustomerData({ ...customerData, notes: e.target.value })}
                  placeholder="Alguma observação especial sobre o pedido..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {checkoutItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Badge variant="outline">{item.category}</Badge>
                      {item.size && <Badge variant="secondary">{item.size}</Badge>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Qtd: {item.quantity}</p>
                    <p className="text-sm font-bold text-primary">R$ {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}

              <Separator />

              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary">R$ {checkoutTotal.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 text-lg font-bold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Processando Pedido...
                </>
              ) : (
                "Finalizar Pedido pelo Site"
              )}
            </Button>

            <Button
              type="button"
              onClick={handleWhatsAppCheckout}
              disabled={isProcessing || !customerData.name || !customerData.phone || !customerData.address}
              className="w-full py-3 text-lg font-bold bg-gradient-to-r from-blue-600 to-black hover:from-blue-700 hover:to-gray-900"
            >
              Finalizar pelo WhatsApp
            </Button>

            <p className="text-center text-sm text-gray-600">🔒 Seus dados estão seguros • Entrega garantida</p>
          </div>
        </form>
      </div>
    </div>
  )
}
