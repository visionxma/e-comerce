"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "@/components/product-card"
import { CheckoutModal } from "@/components/checkout-modal"
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
  image: string
  category: string
  size?: string
  brand?: string
  stock?: number
  featured?: boolean
}

export default function HomePage() {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([])
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
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
        productsData.push({ id: doc.id, ...doc.data() } as Product)
      })

      setProducts(productsData)
      setIsLoadingProducts(false)
    })

    return () => unsubscribe()
  }, [])

  const handleProductSelect = (product: Product) => {
    setSelectedProducts((prev) => {
      const exists = prev.find((p) => p.id === product.id)
      if (exists) {
        return prev.filter((p) => p.id !== product.id)
      } else {
        return [...prev, product]
      }
    })
  }

  const handleCheckout = () => {
    if (selectedProducts.length > 0) {
      setIsCheckoutOpen(true)
    }
  }

  const handleUserRegistration = (data: { name: string; phone: string; address: string }) => {
    localStorage.setItem("userData", JSON.stringify(data))
    setUserData(data)
  }

  const handleClearUserData = () => {
    localStorage.removeItem("userData")
    setUserData(null)
  }

  const totalPrice = selectedProducts.reduce((sum, product) => sum + product.price, 0)

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
  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const category = product.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(product)
    return acc
  }, {} as Record<string, Product[]>)

  const categories = Object.keys(groupedProducts).sort()

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">E-Commerce Express</h1>
          <p className="text-muted-foreground">Encontre tudo o que você precisa, entrega rápida e segura</p>
        </div>

        {/* Banners Promocionais */}
        <Banner />

        {/* User Registration/Greeting Section */}
        {userData ? (
          <div className="bg-card border rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Olá, {userData.name}! 👋</h2>
                <p className="text-sm text-muted-foreground">{userData.phone}</p>
                <p className="text-sm text-muted-foreground">{userData.address}</p>
              </div>
              <button onClick={handleClearUserData} className="text-sm text-muted-foreground hover:text-foreground">
                Alterar dados
              </button>
            </div>
          </div>
        ) : (
          <UserRegistration onRegister={handleUserRegistration} />
        )}

        {/* Search Bar */}
        {!isLoadingProducts && products.length > 0 && (
          <div className="mb-6">
            <div className="relative max-w-md mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Pesquisar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-muted-foreground hover:text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Products Grid or No Stock Message */}
        {isLoadingProducts ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando produtos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-card border rounded-lg p-8 max-w-md mx-auto">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Loja sem produtos</h3>
              <p className="text-muted-foreground mb-4">
                Nossa loja está sendo preparada com novos produtos. Volte mais tarde para conferir as novidades!
              </p>
              <p className="text-sm text-muted-foreground">
                Em breve teremos uma grande variedade de produtos para você.
              </p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-card border rounded-lg p-8 max-w-md mx-auto">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum produto encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Não encontramos produtos que correspondam à sua pesquisa "<span className="font-medium">{searchTerm}</span>".
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Ver todos os produtos
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 mb-6">
            {/* Mostrar produtos agrupados por categoria ou lista simples */}
            {searchTerm ? (
              // Se há pesquisa, mostrar lista simples
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isSelected={selectedProducts.some((p) => p.id === product.id)}
                    onSelect={() => handleProductSelect(product)}
                  />
                ))}
              </div>
            ) : (
              // Se não há pesquisa, mostrar agrupado por categoria
              categories.map((category) => (
                <div key={category} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-foreground capitalize">
                      {category}
                    </h2>
                    <span className="bg-muted text-muted-foreground px-2 py-1 rounded-full text-sm">
                      {groupedProducts[category].length} {groupedProducts[category].length === 1 ? 'item' : 'itens'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupedProducts[category].map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isSelected={selectedProducts.some((p) => p.id === product.id)}
                        onSelect={() => handleProductSelect(product)}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Floating Cart Button */}
        {selectedProducts.length > 0 && (
          <div className="fixed bottom-4 left-4 right-4 z-50">
            <button
              onClick={handleCheckout}
              className="w-full bg-primary text-primary-foreground py-4 px-6 rounded-lg shadow-lg font-semibold text-lg flex items-center justify-between"
            >
              <span>
                Finalizar Pedido ({selectedProducts.length} {selectedProducts.length === 1 ? 'item' : 'itens'})
              </span>
              <span>R$ {totalPrice.toFixed(2)}</span>
            </button>
          </div>
        )}
      </main>

      <Footer />

      {/* VisionX Footer */}
      <div className="bg-black text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="text-center">
            <p className="text-sm">
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

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedProducts={selectedProducts}
        totalPrice={totalPrice}
        userData={userData}
      />
    </div>
  )
}