"use client"

import { useState, useEffect } from "react"
import { X, CreditCard, Banknote, Smartphone, Truck, Home, Plus, MapPin } from "lucide-react"
import type { Product } from "@/e-comerce/app/page"

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  selectedProducts: Product[]
  totalPrice: number
  userData: { name: string; phone: string; address: string } | null
}

interface CheckoutData {
  paymentMethod: "pix" | "card" | "cash" | ""
  deliveryMethod: "delivery" | "pickup" | ""
  selectedAddress: string
}

interface SavedAddress {
  id: string
  name: string
  address: string
}

export function CheckoutModal({ isOpen, onClose, selectedProducts, totalPrice, userData }: CheckoutModalProps) {
  const [step, setStep] = useState<"payment" | "delivery">("payment")
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    paymentMethod: "",
    deliveryMethod: "",
    selectedAddress: "",
  })

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState({ name: "", address: "" })
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("savedAddresses")
    if (saved) {
      setSavedAddresses(JSON.parse(saved))
    }
  }, [])

  const saveAddressesToStorage = (addresses: SavedAddress[]) => {
    localStorage.setItem("savedAddresses", JSON.stringify(addresses))
    setSavedAddresses(addresses)
  }

  if (isProcessing) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-background rounded-lg p-8 text-center max-w-sm w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">Preparando sua mensagem...</h3>
          <p className="text-muted-foreground text-sm">Aguarde 1 segundo</p>
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  const handlePaymentSelect = (method: "pix" | "card" | "cash") => {
    setCheckoutData((prev) => ({ ...prev, paymentMethod: method }))
    setStep("delivery")
  }

  const handleDeliverySelect = (method: "delivery" | "pickup") => {
    setCheckoutData((prev) => ({ ...prev, deliveryMethod: method, selectedAddress: "" }))
  }

  const handleSaveAddress = () => {
    if (!newAddress.name.trim() || !newAddress.address.trim()) return

    const address: SavedAddress = {
      id: Date.now().toString(),
      name: newAddress.name.trim(),
      address: newAddress.address.trim(),
    }

    const updatedAddresses = [...savedAddresses, address]
    saveAddressesToStorage(updatedAddresses)
    setNewAddress({ name: "", address: "" })
    setShowAddressForm(false)
  }

  const handleFinishOrder = () => {
    if (!checkoutData.paymentMethod || !checkoutData.deliveryMethod) return

    setIsProcessing(true)

    setTimeout(() => {
      const products = selectedProducts.map((p) => `• ${p.name} - R$ ${p.price.toFixed(2)}`).join("\n")
      const paymentMethodText = {
        pix: "PIX",
        card: "Cartão",
        cash: "Dinheiro",
      }[checkoutData.paymentMethod]

      const deliveryMethodText = {
        delivery: "Entrega sem taxa",
        pickup: "Retirada no local",
      }[checkoutData.deliveryMethod]

      let addressText = ""
      let customerInfo = ""

      if (userData) {
        customerInfo = `*Cliente:* ${userData.name}\n*Telefone:* ${userData.phone}\n`

        if (checkoutData.deliveryMethod === "delivery") {
          if (checkoutData.selectedAddress) {
            const selectedAddr = savedAddresses.find((addr) => addr.id === checkoutData.selectedAddress)
            addressText = selectedAddr ? selectedAddr.address : userData.address
          } else {
            addressText = userData.address
          }
        } else {
          addressText = "Retirada no local"
        }
      } else {
        addressText = checkoutData.deliveryMethod === "delivery" ? "Endereço a combinar" : "Retirada no local"
      }

      const message = `🛒 *NOVO PEDIDO - SITE*

${customerInfo}*Produtos:*
${products}

*Total:* R$ ${totalPrice.toFixed(2)}
*Pagamento:* ${paymentMethodText}
*Entrega:* ${deliveryMethodText}
*Endereço:* ${addressText}

📱 *Pedido realizado pelo site*
Obrigado pelo seu pedido! 🙏`

      const whatsappUrl = `https://wa.me/5599984680391?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, "_blank")

      setIsProcessing(false)
      onClose()
    }, 1000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-background rounded-t-lg sm:rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">{step === "payment" ? "Forma de Pagamento" : "Entrega"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {step === "payment" && (
            <div className="space-y-3">
              <h3 className="font-medium mb-4">Selecione a forma de pagamento:</h3>

              <button
                onClick={() => handlePaymentSelect("pix")}
                className="w-full flex items-center gap-3 p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <Smartphone className="h-5 w-5 text-primary" />
                <span>PIX</span>
              </button>

              <button
                onClick={() => handlePaymentSelect("card")}
                className="w-full flex items-center gap-3 p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <CreditCard className="h-5 w-5 text-primary" />
                <span>Cartão</span>
              </button>

              <button
                onClick={() => handlePaymentSelect("cash")}
                className="w-full flex items-center gap-3 p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <Banknote className="h-5 w-5 text-primary" />
                <span>Dinheiro</span>
              </button>
            </div>
          )}

          {step === "delivery" && (
            <div className="space-y-4">
              <h3 className="font-medium">Selecione o tipo de entrega:</h3>

              <div className="space-y-3">
                <button
                  onClick={() => handleDeliverySelect("delivery")}
                  className={`w-full flex items-center gap-3 p-4 border rounded-lg transition-colors ${
                    checkoutData.deliveryMethod === "delivery"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary hover:bg-primary/5"
                  }`}
                >
                  <Truck className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <div>Entrega sem taxa</div>
                    <div className="text-xs text-muted-foreground">Pedreiras-MA e Trizedela do Vale</div>
                  </div>
                </button>

                <button
                  onClick={() => handleDeliverySelect("pickup")}
                  className={`w-full flex items-center gap-3 p-4 border rounded-lg transition-colors ${
                    checkoutData.deliveryMethod === "pickup"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary hover:bg-primary/5"
                  }`}
                >
                  <Home className="h-5 w-5 text-primary" />
                  <span>Retirada no local</span>
                </button>
              </div>

              {checkoutData.deliveryMethod === "delivery" && userData && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Selecione o endereço de entrega:</h4>

                  {/* Default user address */}
                  <button
                    onClick={() => setCheckoutData((prev) => ({ ...prev, selectedAddress: "" }))}
                    className={`w-full flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                      checkoutData.selectedAddress === ""
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary hover:bg-primary/5"
                    }`}
                  >
                    <MapPin className="h-4 w-4 text-primary" />
                    <div className="text-left flex-1">
                      <div className="font-medium text-sm">Endereço principal</div>
                      <div className="text-xs text-muted-foreground">{userData.address}</div>
                    </div>
                  </button>

                  {/* Saved addresses */}
                  {savedAddresses.map((address) => (
                    <button
                      key={address.id}
                      onClick={() => setCheckoutData((prev) => ({ ...prev, selectedAddress: address.id }))}
                      className={`w-full flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                        checkoutData.selectedAddress === address.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary hover:bg-primary/5"
                      }`}
                    >
                      <MapPin className="h-4 w-4 text-primary" />
                      <div className="text-left flex-1">
                        <div className="font-medium text-sm">{address.name}</div>
                        <div className="text-xs text-muted-foreground">{address.address}</div>
                      </div>
                    </button>
                  ))}

                  {/* Add new address button */}
                  {!showAddressForm && (
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="w-full flex items-center gap-3 p-3 border border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <Plus className="h-4 w-4 text-primary" />
                      <span className="text-sm">Adicionar novo endereço</span>
                    </button>
                  )}

                  {/* Add address form */}
                  {showAddressForm && (
                    <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                      <h5 className="font-medium text-sm">Novo endereço:</h5>
                      <input
                        type="text"
                        placeholder="Nome (ex: Casa, Trabalho, Mãe)"
                        value={newAddress.name}
                        onChange={(e) => setNewAddress((prev) => ({ ...prev, name: e.target.value }))}
                        className="w-full p-2 border border-border rounded text-sm"
                      />
                      <textarea
                        placeholder="Endereço completo"
                        value={newAddress.address}
                        onChange={(e) => setNewAddress((prev) => ({ ...prev, address: e.target.value }))}
                        className="w-full p-2 border border-border rounded text-sm h-20 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveAddress}
                          disabled={!newAddress.name.trim() || !newAddress.address.trim()}
                          className="flex-1 bg-primary text-primary-foreground py-2 px-3 rounded text-sm font-medium disabled:opacity-50"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => {
                            setShowAddressForm(false)
                            setNewAddress({ name: "", address: "" })
                          }}
                          className="flex-1 bg-muted text-muted-foreground py-2 px-3 rounded text-sm font-medium"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!userData && checkoutData.deliveryMethod === "delivery" && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Faça seu cadastro na tela inicial para facilitar a entrega
                  </p>
                </div>
              )}

              <div className="border-t border-border pt-4 mt-6">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total:</span>
                  <span>R$ {totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleFinishOrder}
                disabled={!checkoutData.deliveryMethod}
                className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Finalizar no WhatsApp
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
