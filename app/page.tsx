"use client"

import { useState, useEffect } from "react"
import { CartProvider } from "@/components/cart-provider"
import { CartSidebar } from "@/components/cart-sidebar" // Importe novamente
import { Toaster } from "@/components/ui/toaster"
import { ProductCard } from "@/components/product-card"
import { ProductModal } from "@/components/product-modal"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Banner } from "@/components/banner"
import { UserRegistration } from "@/components/user-registration"
import { collection, onSnapshot, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  category: string
  size?: string
  brand?: string
  stock?: number
  featured?: boolean
  sold?: boolean
}

export default function HomePage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [userData, setUserData] = useState<{ name: string; phone: string; address: string } | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const savedUserData = localStorage.getItem("userData")
    if (savedUserData) {
      setUserData(JSON.parse(savedUserData))
    }

    const q = query(collection(db, "products"), orderBy("name"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData: Product[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        // Filter out sold products client-side to avoid composite index requirement
        if (!data.sold) {
          productsData.push({ id: doc.id, ...data } as Product)
        }
      })

      setProducts(productsData)
      setIsLoadingProducts(false)
    })

    return () => unsubscribe()
  }, [])

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product)
    setIsProductModalOpen(true)
  }

  const handleUserRegistration = (data: { name: string; phone: string; address: string }) => {
    localStorage.setItem("userData", JSON.stringify(data))
    setUserData(data)
  }

  const handleClearUserData = () => {
    localStorage.removeItem("userData")
    setUserData(null)
  }

  // Filtrar produtos baseado no termo de pesquisa
  const filteredProducts = products.filter((product) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower) ||
      (product.size && product.size.toLowerCase().includes(searchLower)) ||
      (product.brand && product.brand.toLowerCase().includes(searchLower))
    )
  })

  // Agrupar produtos por categoria para melhor organização
  const groupedProducts = filteredProducts.reduce(
    (acc, product) => {
      const category = product.category
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(product)
      return acc
    },
    {} as Record<string, Product[]>,
  )

  const categories = Object.keys(groupedProducts).sort()

  return (
    <CartProvider>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-2 py-4">
          {/* Hero Section */}
          <div className="text-center mb-4">
            <p className="text-muted-foreground text-sm">Encontre tudo o que você precisa, entrega rápida e segura</p>
          </div>

          {/* Banners Promocionais */}
          <Banner />

          {/* User Registration/Greeting Section */}
          {userData ? (
            <div className="bg-card border rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Olá, {userData.name}! 👋</h2>
                  <p className="text-xs text-muted-foreground">{userData.phone}</p>
                  <p className="text-xs text-muted-foreground">{userData.address}</p>
                </div>
                <button onClick={handleClearUserData} className="text-xs text-muted-foreground hover:text-foreground">
                  Alterar
                </button>
              </div>
            </div>
          ) : (
            <UserRegistration onRegister={handleUserRegistration} />
          )}

          {/* Search Bar */}
          {!isLoadingProducts && products.length > 0 && (
            <div className="mb-4">
              <div className="relative max-w-md mx-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Pesquisar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 text-sm border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg
                      className="h-4 w-4 text-muted-foreground hover:text-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Products Grid or No Stock Message */}
          {isLoadingProducts ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-xs text-muted-foreground">Carregando produtos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-card border rounded-lg p-4 max-w-md mx-auto">
                <div className="mb-3">
                  <div className="w-12 h-12 mx-auto mb-2 bg-muted rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">Loja sem produtos</h3>
                <p className="text-xs text-muted-foreground mb-3">Nossa loja está sendo preparada. Volte mais tarde!</p>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-card border rounded-lg p-4 max-w-md mx-auto">
                <div className="mb-3">
                  <div className="w-12 h-12 mx-auto mb-2 bg-muted rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">Nenhum produto encontrado</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Não encontramos produtos para "<span className="font-medium">{searchTerm}</span>".
                </p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="bg-primary text-primary-foreground px-3 py-1 text-sm rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Ver todos
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 mb-4">
              {/* Mostrar produtos agrupados por categoria ou lista simples */}
              {searchTerm ? (
                // Se há pesquisa, mostrar lista simples com 5 produtos por linha
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isSelected={false}
                      onSelect={() => handleProductSelect(product)}
                      compact={true}
                    />
                  ))}
                </div>
              ) : (
                // Se não há pesquisa, mostrar agrupado por categoria
                categories.map((category) => (
                  <div key={category} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-foreground capitalize">{category}</h2>
                      <span className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full text-xs">
                        {groupedProducts[category].length}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                      {groupedProducts[category].map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          isSelected={false}
                          onSelect={() => handleProductSelect(product)}
                          compact={true}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>

        <Footer />

        {/* VisionX Footer */}
        <div className="bg-black text-white">
          <div className="container mx-auto px-2 py-2">
            <div className="text-center">
              <p className="text-xs">
                Criado por{" "}
                <a
                  href="https://visionxma.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-white hover:text-gray-300 transition-colors underline"
                >
                  VisionX
                </a>
              </p>
            </div>
          </div>
        </div>

        <ProductModal
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          product={selectedProduct}
          userData={userData}
        />

        {/* Carrinho Sidebar Flutuante */}
        <div className="fixed bottom-4 right-4 z-50">
          <CartSidebar userData={userData} />
        </div>

        {/* Toast notifications */}
        <Toaster />
      </div>
    </CartProvider>
  )
}