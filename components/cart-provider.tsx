"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { toast } from "@/hooks/use-toast"

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  category: string
  size?: string
  brand?: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (product: any) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Carregar carrinho do localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error("Erro ao carregar carrinho:", error)
      }
    }
  }, [])

  // Salvar carrinho no localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items))
  }, [items])

  const addItem = (product: any) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === product.id)
      
      if (existingItem) {
        toast({
          title: "Quantidade atualizada",
          description: `${product.name} - quantidade aumentada para ${existingItem.quantity + 1}`,
        })
        return currentItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        const newItem: CartItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || "/placeholder.svg",
          quantity: 1,
          category: product.category,
          size: product.size,
          brand: product.brand,
        }
        
        toast({
          title: "Produto adicionado",
          description: `${product.name} foi adicionado ao carrinho`,
        })
        
        return [...currentItems, newItem]
      }
    })
  }

  const removeItem = (productId: string) => {
    setItems(currentItems => {
      const item = currentItems.find(item => item.id === productId)
      if (item) {
        toast({
          title: "Produto removido",
          description: `${item.name} foi removido do carrinho`,
        })
      }
      return currentItems.filter(item => item.id !== productId)
    })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
    toast({
      title: "Carrinho limpo",
      description: "Todos os itens foram removidos do carrinho",
    })
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
      isOpen,
      setIsOpen,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
