"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { X, ShoppingCart, User, Loader2 } from "lucide-react"
import { useCart } from "./cart-provider"
import { collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "@/hooks/use-toast"

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  userData: { name: string; phone: string; address: string } | null
}

interface CustomerData {
  name: string
  phone: string
  email: string
  address: string
  notes: string
}

export function CheckoutModal({ isOpen, onClose, userData }: CheckoutModalProps) {
  const { items, getTotalPrice, clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: userData?.name || "",
    phone: userData?.phone || "",
    email: "",
    address: userData?.address || "",
    notes: "",
  })

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

    if (items.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Criar pedido no Firestore
      const orderData = {
        customerInfo: {
          name: customerData.name,
          phone: customerData.phone,
          email: customerData.email,
          address: customerData.address,
        },
        items: items.map((item) => ({
          productId: item.id,
          productName: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.image,
          category: item.category,
          size: item.size,
          brand: item.brand,
        })),
        total: getTotalPrice(),
        status: "pending",
        notes: customerData.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const docRef = await addDoc(collection(db, "orders"), orderData)

      // Criar/atualizar cliente no Firestore
      const customerDoc = {
        name: customerData.name,
        phone: customerData.phone,
        email: customerData.email,
        address: customerData.address,
        lastOrderId: docRef.id,
        lastOrderDate: new Date(),
        totalOrders: 1,
        totalSpent: getTotalPrice(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await addDoc(collection(db, "customers"), customerDoc)

      // Limpar carrinho e fechar modal
      clearCart()
      onClose()

      toast({
        title: "Pedido realizado com sucesso!",
        description: `Seu pedido #${docRef.id.slice(-6)} foi registrado. Você receberá atualizações em breve.`,
      })

      // Salvar dados do usuário no localStorage
      localStorage.setItem(
        "userData",
        JSON.stringify({
          name: customerData.name,
          phone: customerData.phone,
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
    const itemsList = items
      .map(
        (item) =>
          `• ${item.name} ${item.size ? `(${item.size})` : ""} - Qtd: ${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2)}`,
      )
      .join("\n")

    const message = `🛒 *PEDIDO DO CARRINHO*

*Cliente:* ${customerData.name}
*Telefone:* ${customerData.phone}
${customerData.email ? `*Email:* ${customerData.email}\n` : ""}
*Itens do Pedido:*
${itemsList}

*Total: R$ ${getTotalPrice().toFixed(2)}*

*Endereço de entrega:* ${customerData.address}
${customerData.notes ? `\n*Observações:* ${customerData.notes}` : ""}

📱 *Pedido realizado pelo site*
Gostaria de confirmar este pedido! 🙏`

    const whatsappUrl = `https://wa.me/5599984680391?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")

    clearCart()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Finalizar Pedido</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Dados do Cliente */}
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
                <Label htmlFor="email">Email (opcional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerData.email}
                  onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                  placeholder="seu@email.com"
                />
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

          {/* Resumo do Pedido */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
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
                <span className="text-primary">R$ {getTotalPrice().toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Botões de Finalização */}
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
              disabled={isProcessing}
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
