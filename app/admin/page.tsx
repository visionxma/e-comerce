"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2, Edit, Plus, Save, X, LogOut, Image as ImageIcon, Eye, EyeOff } from "lucide-react"
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth"
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import type { Product } from "../page"

interface Banner {
  id: string
  title: string
  description: string
  imageUrl: string
  linkUrl?: string
  isActive: boolean
  priority: number
  startDate?: string
  endDate?: string
  backgroundColor?: string
  textColor?: string
  createdAt: Date
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [isAddingBanner, setIsAddingBanner] = useState(false)
  const [activeTab, setActiveTab] = useState("products")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  
  const [newProduct, setNewProduct] = useState<Omit<Product, "id">>({
    name: "",
    description: "",
    price: 0,
    image: "",
    category: "",
    size: "",
  })

  const [newBanner, setNewBanner] = useState<Omit<Banner, "id" | "createdAt">>({
    title: "",
    description: "",
    imageUrl: "",
    linkUrl: "",
    isActive: true,
    priority: 1,
    startDate: "",
    endDate: "",
    backgroundColor: "#059669",
    textColor: "#ffffff",
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      // Products listener
      const productsQuery = query(collection(db, "products"), orderBy("name"))
      const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
        const productsData: Product[] = []
        snapshot.forEach((doc) => {
          productsData.push({ id: doc.id, ...doc.data() } as Product)
        })
        setProducts(productsData)
      })

      // Banners listener
      const bannersQuery = query(collection(db, "banners"), orderBy("priority", "desc"))
      const unsubscribeBanners = onSnapshot(bannersQuery, (snapshot) => {
        const bannersData: Banner[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          bannersData.push({ 
            id: doc.id, 
            ...data,
            createdAt: data.createdAt?.toDate() || new Date()
          } as Banner)
        })
        setBanners(bannersData)
      })

      return () => {
        unsubscribeProducts()
        unsubscribeBanners()
      }
    }
  }, [isAuthenticated])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signInWithEmailAndPassword(auth, loginData.email, loginData.password)
    } catch (error) {
      alert("Erro ao fazer login. Verifique suas credenciais.")
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      alert("Erro ao fazer logout.")
    }
  }

  const handleAddProduct = async () => {
    if (newProduct.name && newProduct.price > 0) {
      try {
        await addDoc(collection(db, "products"), newProduct)
        setNewProduct({
          name: "",
          description: "",
          price: 0,
          image: "",
          category: "",
          size: "",
        })
        setIsAddingNew(false)
      } catch (error) {
        alert("Erro ao adicionar produto.")
      }
    }
  }

  const handleAddBanner = async () => {
    if (newBanner.title && newBanner.imageUrl) {
      try {
        await addDoc(collection(db, "banners"), {
          ...newBanner,
          createdAt: new Date()
        })
        setNewBanner({
          title: "",
          description: "",
          imageUrl: "",
          linkUrl: "",
          isActive: true,
          priority: 1,
          startDate: "",
          endDate: "",
          backgroundColor: "#059669",
          textColor: "#ffffff",
        })
        setIsAddingBanner(false)
      } catch (error) {
        alert("Erro ao adicionar banner.")
      }
    }
  }

  const handleEditProduct = async (product: Product) => {
    try {
      const productRef = doc(db, "products", product.id)
      await updateDoc(productRef, {
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        category: product.category,
        size: product.size,
      })
      setEditingProduct(null)
    } catch (error) {
      alert("Erro ao editar produto.")
    }
  }

  const handleEditBanner = async (banner: Banner) => {
    try {
      const bannerRef = doc(db, "banners", banner.id)
      await updateDoc(bannerRef, {
        title: banner.title,
        description: banner.description,
        imageUrl: banner.imageUrl,
        linkUrl: banner.linkUrl,
        isActive: banner.isActive,
        priority: banner.priority,
        startDate: banner.startDate,
        endDate: banner.endDate,
        backgroundColor: banner.backgroundColor,
        textColor: banner.textColor,
      })
      setEditingBanner(null)
    } catch (error) {
      alert("Erro ao editar banner.")
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        await deleteDoc(doc(db, "products", id))
      } catch (error) {
        alert("Erro ao excluir produto.")
      }
    }
  }

  const handleDeleteBanner = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este banner?")) {
      try {
        await deleteDoc(doc(db, "banners", id))
      } catch (error) {
        alert("Erro ao excluir banner.")
      }
    }
  }

  const toggleBannerStatus = async (banner: Banner) => {
    try {
      const bannerRef = doc(db, "banners", banner.id)
      await updateDoc(bannerRef, {
        isActive: !banner.isActive
      })
    } catch (error) {
      alert("Erro ao alterar status do banner.")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Acesso Administrativo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  placeholder="admin@exemplo.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="Sua senha"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Painel Administrativo - Ecommerce</h1>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">Produtos ({products.length})</TabsTrigger>
            <TabsTrigger value="banners">Banners ({banners.filter(b => b.isActive).length} ativos)</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Gerenciar Produtos</h2>
              <Button onClick={() => setIsAddingNew(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Produto
              </Button>
            </div>

            {/* Formulário para adicionar novo produto */}
            {isAddingNew && (
              <Card>
                <CardHeader>
                  <CardTitle>Adicionar Novo Produto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome do Produto *</Label>
                      <Input
                        id="name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        placeholder="Ex: Smartphone Samsung Galaxy, Tênis Nike Air Max..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Preço (R$) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: Number.parseFloat(e.target.value) || 0 })}
                        placeholder="299.99"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Categoria *</Label>
                      <Input
                        id="category"
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        placeholder="Ex: Eletrônicos, Roupas, Casa & Jardim, Esportes..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="size">Tamanho/Especificação</Label>
                      <Input
                        id="size"
                        value={newProduct.size}
                        onChange={(e) => setNewProduct({ ...newProduct, size: e.target.value })}
                        placeholder="Ex: M, 128GB, 40cm, 500ml..."
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição do Produto</Label>
                    <Textarea
                      id="description"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      placeholder="Descrição detalhada do produto..."
                      rows={3}
                    />
                  </div>
<div>
  <Label htmlFor="image">Imagem do Produto</Label>
  <Input
    id="image"
    type="file"
    accept="image/*"
    onChange={async (e) => {
      const file = e.target.files?.[0]
      if (!file) return

      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", "banners_unsigned") // preset que vc mostrou

      // Faz upload direto no Cloudinary
      const res = await fetch("https://api.cloudinary.com/v1_1/dqvjdppqs/image/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      setNewProduct({ ...newProduct, image: data.secure_url }) // aqui fica a URL pública
    }}
  />
</div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddProduct} className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Salvar Produto
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddingNew(false)} className="flex items-center gap-2">
                      <X className="w-4 h-4" />
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lista de produtos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    {editingProduct?.id === product.id ? (
                      <div className="space-y-3">
                        <Input
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                          placeholder="Nome do produto"
                        />
                        <Input
                          type="number"
                          step="0.01"
                          value={editingProduct.price}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, price: Number.parseFloat(e.target.value) || 0 })
                          }
                          placeholder="Preço"
                        />
                        <Input
                          value={editingProduct.category}
                          onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                          placeholder="Categoria"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleEditProduct(editingProduct)}
                            className="flex items-center gap-1"
                          >
                            <Save className="w-3 h-3" />
                            Salvar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingProduct(null)}
                            className="flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-32 object-cover rounded mb-3"
                        />
                        <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                        <p className="text-lg font-bold text-primary mb-3">R$ {product.price.toFixed(2)}</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingProduct(product)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="banners" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Gerenciar Banners Promocionais</h2>
              <Button onClick={() => setIsAddingBanner(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Banner
              </Button>
            </div>

            {/* Formulário para adicionar novo banner */}
            {isAddingBanner && (
              <Card>
                <CardHeader>
                  <CardTitle>Criar Novo Banner Promocional</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="banner-title">Título do Banner *</Label>
                      <Input
                        id="banner-title"
                        value={newBanner.title}
                        onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                        placeholder="Ex: MEGA PROMOÇÃO - 50% OFF"
                      />
                    </div>
                    <div>
                      <Label htmlFor="banner-priority">Prioridade (1-10)</Label>
                      <Input
                        id="banner-priority"
                        type="number"
                        min="1"
                        max="10"
                        value={newBanner.priority}
                        onChange={(e) => setNewBanner({ ...newBanner, priority: parseInt(e.target.value) || 1 })}
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="banner-start">Data de Início</Label>
                      <Input
                        id="banner-start"
                        type="date"
                        value={newBanner.startDate}
                        onChange={(e) => setNewBanner({ ...newBanner, startDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="banner-end">Data de Fim</Label>
                      <Input
                        id="banner-end"
                        type="date"
                        value={newBanner.endDate}
                        onChange={(e) => setNewBanner({ ...newBanner, endDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="banner-bg">Cor de Fundo</Label>
                      <Input
                        id="banner-bg"
                        type="color"
                        value={newBanner.backgroundColor}
                        onChange={(e) => setNewBanner({ ...newBanner, backgroundColor: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="banner-text-color">Cor do Texto</Label>
                      <Input
                        id="banner-text-color"
                        type="color"
                        value={newBanner.textColor}
                        onChange={(e) => setNewBanner({ ...newBanner, textColor: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="banner-description">Descrição</Label>
                    <Textarea
                      id="banner-description"
                      value={newBanner.description}
                      onChange={(e) => setNewBanner({ ...newBanner, description: e.target.value })}
                      placeholder="Descrição da promoção..."
                      rows={2}
                    />
                  </div>
<div>
  <Label htmlFor="banner-image">Imagem do Banner *</Label>
  <Input
    id="banner-image"
    type="file"
    accept="image/*"
    onChange={async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Cria o FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "banners_unsigned"); // 🔹 troque pelo nome do preset unsigned que você criou no Cloudinary

      try {
        // Faz upload para o Cloudinary
        const res = await fetch("https://api.cloudinary.com/v1_1/dqvjdppqs/image/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        const url = data.secure_url; // URL pública da imagem

        // Atualiza estado do banner
        setNewBanner({ ...newBanner, imageUrl: url });
      } catch (error) {
        console.error("Erro ao enviar imagem para Cloudinary:", error);
      }
    }}
  />

  {/* Pré-visualização da imagem escolhida */}
  {newBanner.imageUrl && (
    <img
      src={newBanner.imageUrl}
      alt="Pré-visualização"
      className="mt-2 w-32 h-20 object-cover rounded"
    />
  )}
</div>
                  <div>
                    <Label htmlFor="banner-link">Link de Destino (opcional)</Label>
                    <Input
                      id="banner-link"
                      value={newBanner.linkUrl}
                      onChange={(e) => setNewBanner({ ...newBanner, linkUrl: e.target.value })}
                      placeholder="https://exemplo.com/promocao"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="banner-active"
                      checked={newBanner.isActive}
                      onCheckedChange={(checked) => setNewBanner({ ...newBanner, isActive: checked })}
                    />
                    <Label htmlFor="banner-active">Banner Ativo</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddBanner} className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Salvar Banner
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddingBanner(false)} className="flex items-center gap-2">
                      <X className="w-4 h-4" />
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lista de banners */}
            <div className="space-y-4">
              {banners.map((banner) => (
                <Card key={banner.id} className={`${!banner.isActive ? 'opacity-60' : ''}`}>
                  <CardContent className="p-4">
                    {editingBanner?.id === banner.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            value={editingBanner.title}
                            onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                            placeholder="Título do banner"
                          />
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={editingBanner.priority}
                            onChange={(e) => setEditingBanner({ ...editingBanner, priority: parseInt(e.target.value) || 1 })}
                            placeholder="Prioridade"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleEditBanner(editingBanner)}
                            className="flex items-center gap-1"
                          >
                            <Save className="w-3 h-3" />
                            Salvar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingBanner(null)}
                            className="flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <img
                          src={banner.imageUrl || "/placeholder.svg"}
                          alt={banner.title}
                          className="w-24 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{banner.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              banner.isActive ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                            }`}>
                              {banner.isActive ? 'Ativo' : 'Inativo'}
                            </span>
                            <span className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium">
                              Prioridade: {banner.priority}
                            </span>
                          </div>
                          {banner.description && (
                            <p className="text-sm text-muted-foreground mb-2">{banner.description}</p>
                          )}
                          {banner.startDate && (
                            <p className="text-xs text-muted-foreground">
                              Período: {banner.startDate} {banner.endDate && `até ${banner.endDate}`}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleBannerStatus(banner)}
                            className="flex items-center gap-1"
                          >
                            {banner.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            {banner.isActive ? 'Desativar' : 'Ativar'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingBanner(banner)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteBanner(banner.id)}
                            className="flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {banners.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Nenhum banner criado</h3>
                  <p className="text-muted-foreground mb-4">
                    Crie banners promocionais para destacar suas ofertas especiais!
                  </p>
                  <Button onClick={() => setIsAddingBanner(true)} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Criar Primeiro Banner
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Informações do Sistema:</h3>
          <p className="text-sm text-muted-foreground">
            • <strong>Produtos:</strong> Gerencie seu catálogo completo de produtos
            <br />• <strong>Banners:</strong> Crie campanhas promocionais com imagens e datas
            <br />• <strong>Prioridade:</strong> Banners com maior prioridade aparecem primeiro
            <br />• <strong>Status:</strong> Ative/desative banners sem precisar excluí-los
            <br />• <strong>Tempo real:</strong> Todas as alterações aparecem instantaneamente no site
          </p>
        </div>
      </div>
    </div>
  )
}