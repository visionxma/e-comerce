"use client"

import { X, Star, Package, Truck, Shield, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"
import { CartButton } from "./cart-button"
import { CheckoutModal } from "./checkout-modal"
import { ProductCard } from "./product-card"
import type { Product } from "@/app/page"
import { collection, onSnapshot, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
}

export function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [otherProducts, setOtherProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)

  useEffect(() => {
    if (isOpen) {
      const q = query(collection(db, "products"), orderBy("name"))
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const productsData: Product[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          // Filter out sold products and current product
          if (!data.sold && doc.id !== product?.id) {
            productsData.push({ id: doc.id, ...data } as Product)
          }
        })

        // Shuffle products randomly
        const shuffled = productsData.sort(() => 0.5 - Math.random())
        setOtherProducts(shuffled.slice(0, 10)) // Show max 10 products
        setIsLoadingProducts(false)
      })

      return () => unsubscribe()
    }
  }, [isOpen, product?.id])

  if (!isOpen || !product) return null

  const images = product.images && product.images.length > 0 ? product.images : ["/placeholder.svg"]

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleBuyNow = () => {
    const message = `🛒 *INTERESSE EM PRODUTO*

*Produto:* ${product.name}
*Preço:* R$ ${product.price.toFixed(2)}
*Categoria:* ${product.category}
${product.size ? `*Tamanho:* ${product.size}\n` : ""}${product.brand ? `*Marca:* ${product.brand}\n` : ""}
*Descrição:* ${product.description}

📱 *Interesse demonstrado pelo site*
Gostaria de mais informações sobre este produto! 🙏`

    const whatsappUrl = `https://wa.me/5599984680391?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
    onClose()
  }

  const handleDirectBuy = () => {
    setShowCheckoutModal(true)
  }

  return (
    <>
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
        {/* Header with close button */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b z-10">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-lg font-bold text-gray-900 truncate">{product.name}</h1>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="pb-6">
          {/* Product image section */}
          <div className="relative h-80 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
            <img
              src={images[currentImageIndex] || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-full object-cover"
            />

            {/* Navigation for carousel */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors duration-300"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors duration-300"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* Image indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                        index === currentImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Category badge */}
            <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              {product.category}
            </div>

            {/* Stock badge */}
            {product.stock !== undefined && (
              <div
                className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${
                  product.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                {product.stock > 0 ? `${product.stock} em estoque` : "Sem estoque"}
              </div>
            )}
          </div>

          {/* Product details */}
          <div className="p-6 space-y-6">
            {/* Title and price */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">{product.name}</h2>
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-blue-600">R$ {product.price.toFixed(2)}</span>
                {product.featured && (
                  <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
                    <Star className="h-4 w-4 fill-current" />
                    <span>Destaque</span>
                  </div>
                )}
              </div>
            </div>

            {/* Product info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.brand && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Marca</p>
                    <p className="font-semibold text-gray-900">{product.brand}</p>
                  </div>
                </div>
              )}

              {product.size && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Tamanho/Especificação</p>
                    <p className="font-semibold text-gray-900">{product.size}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Descrição do Produto</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Benefits */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Vantagens da sua compra:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-blue-800">
                  <Truck className="h-4 w-4" />
                  <span>Entrega sem taxa</span>
                </div>
                <div className="flex items-center gap-2 text-blue-800">
                  <Shield className="h-4 w-4" />
                  <span>Produto garantido</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {/* Primary: Direct buy button */}
              <button
                onClick={handleDirectBuy}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
              >
                Comprar Agora
              </button>

              {/* Secondary: Add to cart */}
              <CartButton
                product={product}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-xl font-semibold text-base flex items-center justify-center gap-3 hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
              />

              {/* Tertiary: WhatsApp */}
              <button
                onClick={handleBuyNow}
                className="w-full bg-gradient-to-r from-gray-600 to-black text-white py-3 px-6 rounded-xl font-semibold text-base flex items-center justify-center gap-3 hover:from-gray-700 hover:to-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
              >
                Comprar Direto no WhatsApp
              </button>

              <p className="text-center text-sm text-gray-600">
                🔒 Escolha sua forma preferida de compra • Entrega garantida
              </p>
            </div>
          </div>

          <div className="px-6 pb-6">
            <div className="border-t pt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Outros Produtos</h3>

              {isLoadingProducts ? (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-xs text-muted-foreground">Carregando produtos...</p>
                </div>
              ) : otherProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {otherProducts.map((otherProduct) => (
                    <ProductCard
                      key={otherProduct.id}
                      product={otherProduct}
                      isSelected={false}
                      onSelect={() => {
                        // Close current modal and open new one with selected product
                        onClose()
                        // Small delay to allow modal to close before opening new one
                        setTimeout(() => {
                          const event = new CustomEvent("openProductModal", {
                            detail: { product: otherProduct },
                          })
                          window.dispatchEvent(event)
                        }, 100)
                      }}
                      compact={true}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">Nenhum outro produto disponível</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Checkout modal */}
      <CheckoutModal isOpen={showCheckoutModal} onClose={() => setShowCheckoutModal(false)} directProduct={product} />
    </>
  )
}
