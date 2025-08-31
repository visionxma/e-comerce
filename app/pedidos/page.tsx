import { OrderStatus } from "@/components/order-status"
import { Header } from "@/components/header"

export default function PedidosPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <OrderStatus />
    </div>
  )
}
