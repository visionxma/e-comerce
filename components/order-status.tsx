"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Package, Truck, CheckCircle, Clock, Search, Phone, Mail } from "lucide-react"
import { collection, query, where, onSnapshot, orderBy, and } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Order {
  id: string
  customerInfo: {
    name: string
    phone: string
    email?: string
    address: string
  }
  items: Array<{
    productId: string
    productName: string
    price: number
    quantity: number
    imageUrl: string
    category: string
    size?: string
    brand?: string
  }>
  total: number
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  notes?: string
  createdAt: any
  updatedAt: any
}

export function OrderStatus() {
  const [orders, setOrders] = useState<Order[]>([])
  const [searchPhone, setSearchPhone] = useState("")
  const [searchEmail, setSearchEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const searchOrders = async () => {
    if (!searchPhone.trim() || !searchEmail.trim()) return

    setIsLoading(true)

    try {
      const q = query(
        collection(db, "orders"),
        and(
          where("customerInfo.phone", "==", searchPhone.trim()),
          where("customerInfo.email", "==", searchEmail.trim().toLowerCase()),
        ),
        orderBy("createdAt", "desc"),
      )

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const ordersData: Order[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          ordersData.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Order)
        })
        setOrders(ordersData)
        setIsLoading(false)
      })

      return unsubscribe
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error)
      setIsLoading(false)
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return { label: "Aguardando Confirmação", color: "bg-yellow-100 text-yellow-800", icon: Clock }
      case "confirmed":
        return { label: "Pedido Confirmado", color: "bg-blue-100 text-blue-800", icon: CheckCircle }
      case "shipped":
        return { label: "Saiu para Entrega", color: "bg-purple-100 text-purple-800", icon: Truck }
      case "delivered":
        return { label: "Entregue", color: "bg-green-100 text-green-800", icon: CheckCircle }
      case "cancelled":
        return { label: "Cancelado", color: "bg-red-100 text-red-800", icon: Package }
      default:
        return { label: "Status Desconhecido", color: "bg-gray-100 text-gray-800", icon: Package }
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Acompanhar Pedido</h1>
        <p className="text-muted-foreground">Digite seu email E telefone para ver o status dos seus pedidos</p>
      </div>

      {/* Busca por email e telefone */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Pedidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telefone *
                </Label>
                <Input
                  id="phone"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  placeholder="(99) 99999-9999"
                  className="mt-1"
                  required
                />
              </div>
            </div>
            <div className="flex justify-center">
              <Button
                onClick={searchOrders}
                disabled={isLoading || !searchEmail.trim() || !searchPhone.trim()}
                className="flex items-center gap-2 px-8"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Buscar Pedidos
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              * Ambos os campos são obrigatórios para buscar seus pedidos
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Lista de pedidos */}
      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status)
            const StatusIcon = statusInfo.icon

            return (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Pedido #{order.id.slice(-6)}</CardTitle>
                      <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                    </div>
                    <Badge className={statusInfo.color}>
                      <StatusIcon className="h-4 w-4 mr-1" />
                      {statusInfo.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Informações do cliente */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Dados do Cliente</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <p>
                        <strong>Nome:</strong> {order.customerInfo.name}
                      </p>
                      <p>
                        <strong>Telefone:</strong> {order.customerInfo.phone}
                      </p>
                      {order.customerInfo.email && (
                        <p>
                          <strong>Email:</strong> {order.customerInfo.email}
                        </p>
                      )}
                      <p className="md:col-span-2">
                        <strong>Endereço:</strong> {order.customerInfo.address}
                      </p>
                    </div>
                  </div>

                  {/* Itens do pedido */}
                  <div>
                    <h4 className="font-medium mb-3">Itens do Pedido</h4>
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                          <img
                            src={item.imageUrl || "/placeholder.svg"}
                            alt={item.productName}
                            className="w-12 h-12 object-cover rounded-md"
                          />
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">{item.productName}</h5>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Badge variant="outline">{item.category}</Badge>
                              {item.size && <Badge variant="secondary">{item.size}</Badge>}
                              {item.brand && <Badge variant="outline">{item.brand}</Badge>}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">Qtd: {item.quantity}</p>
                            <p className="text-sm font-bold text-primary">
                              R$ {(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Total e observações */}
                  <div className="flex justify-between items-center">
                    <div>
                      {order.notes && (
                        <p className="text-sm text-gray-600">
                          <strong>Observações:</strong> {order.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">Total: R$ {order.total.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : searchPhone && searchEmail && !isLoading ? (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Nenhum pedido encontrado</h3>
            <p className="text-muted-foreground">
              Não encontramos pedidos para estes dados. Verifique se digitou corretamente.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
