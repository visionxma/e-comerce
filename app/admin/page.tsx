// app/admin/page.tsx

"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Trash2, Edit, Plus, Save, X, LogOut, Image as ImageIcon, Eye, EyeOff, 
  Upload, Search, Filter, AlertCircle, ShoppingBag, Image, CheckCircle, Package
} from "lucide-react"
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
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [loginError, setLoginError] = useState("")
  const [uploadingImages, setUploadingImages] = useState<boolean[]>([])
  
  // Separar produtos vendidos e não vendidos
  const availableProducts = products.filter(product => !product.sold)
  const soldProducts = products.filter(product => product.sold)
  
    const [newProduct, setNewProduct] = useState<Omit<Product, "id">>({
    name: "",
    description: "",
    price: 0,
    images: [],
    category: "",
    size: "",
    brand: "",
    stock: 0,
    featured: false,
    sold: false
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

  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Obter categorias únicas dos produtos
  const categories = ["all", ...new Set(availableProducts.map(product => product.category).filter(Boolean))]

  // Filtrar produtos
  const filteredProducts = availableProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
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
    setLoginError("")
    try {
      await signInWithEmailAndPassword(auth, loginData.email, loginData.password)
    } catch (error: any) {
      console.error("Erro no login:", error)
      setLoginError(error.message || "Erro ao fazer login. Verifique suas credenciais.")
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Erro no logout:", error)
    }
  }

  const handleAddProduct = async () => {
    if (!newProduct.name || newProduct.price <= 0 || !newProduct.category || newProduct.images.length === 0) {
      alert("Preencha os campos obrigatórios: Nome, Preço, Categoria e pelo menos uma imagem.")
      return
    }
    
    try {
      await addDoc(collection(db, "products"), newProduct)
      setNewProduct({
        name: "",
        description: "",
        price: 0,
        images: [],
        category: "",
        size: "",
        brand: "",
        stock: 0,
        featured: false,
        sold: false
      })
      setIsAddingNew(false)
    } catch (error) {
      console.error("Erro ao adicionar produto:", error)
      alert("Erro ao adicionar produto.")
    }
  }

  const handleAddBanner = async () => {
    if (!newBanner.title || !newBanner.imageUrl) {
      alert("Preencha os campos obrigatórios: Título e Imagem.")
      return
    }
    
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
      console.error("Erro ao adicionar banner:", error)
      alert("Erro ao adicionar banner.")
    }
  }

  const handleEditProduct = async (product: Product) => {
    try {
      const productRef = doc(db, "products", product.id)
      await updateDoc(productRef, {
        name: product.name,
        description: product.description,
        price: product.price,
        images: product.images,
        category: product.category,
        size: product.size,
        brand: product.brand,
        stock: product.stock,
        featured: product.featured,
        sold: product.sold
      })
      setEditingProduct(null)
    } catch (error) {
      console.error("Erro ao editar produto:", error)
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
      console.error("Erro ao editar banner:", error)
      alert("Erro ao editar banner.")
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.")) {
      try {
        await deleteDoc(doc(db, "products", id))
      } catch (error) {
        console.error("Erro ao excluir produto:", error)
        alert("Erro ao excluir produto.")
      }
    }
  }

  const markAsSold = async (productId: string, sold: boolean) => {
    try {
      const productRef = doc(db, "products", productId)
      await updateDoc(productRef, { sold })
      
      const action = sold ? "marcado como vendido" : "marcado como disponível"
      console.log(`Produto ${action}`)
    } catch (error) {
      console.error("Erro ao atualizar status de venda:", error)
      alert("Erro ao atualizar status de venda.")
    }
  }

  const handleDeleteBanner = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este banner? Esta ação não pode ser desfeita.")) {
      try {
        await deleteDoc(doc(db, "banners", id))
      } catch (error) {
        console.error("Erro ao excluir banner:", error)
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
      console.error("Erro ao alterar status do banner:", error)
      alert("Erro ao alterar status do banner.")
    }
  }

  const uploadImage = async (file: File, index: number) => {
    try {
      // Atualiza o estado para mostrar que está carregando
      const newUploadingImages = [...uploadingImages]
      newUploadingImages[index] = true
      setUploadingImages(newUploadingImages)

      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", "banners_unsigned")

      const response = await fetch("https://api.cloudinary.com/v1_1/dqvjdppqs/image/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Falha no upload da imagem")

      const data = await response.json()
      
      const newImages = [...newProduct.images]
      newImages[index] = data.secure_url
      setNewProduct({ ...newProduct, images: newImages })

      // Remove o estado de carregamento
      newUploadingImages[index] = false
      setUploadingImages(newUploadingImages)
      
      return data.secure_url
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error)
      alert("Erro ao fazer upload da imagem. Tente novamente.")
      
      // Remove o estado de carregamento em caso de erro
      const newUploadingImages = [...uploadingImages]
      newUploadingImages[index] = false
      setUploadingImages(newUploadingImages)
      return null
    }
  }

  const uploadBannerImage = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", "banners_unsigned")

      const response = await fetch("https://api.cloudinary.com/v1_1/dqvjdppqs/image/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Falha no upload da imagem")

      const data = await response.json()
      setNewBanner({ ...newBanner, imageUrl: data.secure_url })
      
      return data.secure_url
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error)
      alert("Erro ao fazer upload da imagem. Tente novamente.")
      return null
    }
  }

  const addProductImage = () => {
    if (newProduct.images.length < 3) {
      setNewProduct({ ...newProduct, images: [...newProduct.images, ""] })
      setUploadingImages([...uploadingImages, false])
    }
  }

  const removeProductImage = (index: number) => {
    const newImages = newProduct.images.filter((_, i) => i !== index)
    const newUploadingImages = uploadingImages.filter((_, i) => i !== index)
    setNewProduct({ ...newProduct, images: newImages })
    setUploadingImages(newUploadingImages)
  }

  const handleFileSelect = (index: number, files: FileList | null) => {
    if (files && files[0]) {
      uploadImage(files[0], index)
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="bg-primary rounded-full p-3">
                <ShoppingBag className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Acesso Administrativo</CardTitle>
            <CardDescription className="text-center">
              Entre com suas credenciais para acessar o painel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erro</AlertTitle>
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  placeholder="admin@exemplo.com"
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="Sua senha"
                  required
                  className="h-11"
                />
              </div>
              <Button type="submit" className="w-full h-11 text-base">
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
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Painel Administrativo</h1>
            <p className="text-muted-foreground">Gerencie seus produtos e banners promocionais</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 self-start sm:self-auto">
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Produtos ({availableProducts.length} disponíveis, {soldProducts.length} vendidos)
            </TabsTrigger>
            <TabsTrigger value="banners" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Banners ({banners.filter(b => b.isActive).length} ativos)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h2 className="text-2xl font-semibold">Gerenciar Produtos</h2>
              <Button onClick={() => setIsAddingNew(true)} className="flex items-center gap-2 self-start sm:self-auto">
                <Plus className="w-4 h-4" />
                Adicionar Produto
              </Button>
            </div>

            {/* Filtros e busca */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar produtos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-[180px]">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Filtrar por categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas categorias</SelectItem>
                        {categories.filter(cat => cat !== "all").map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Formulário para adicionar novo produto */}
            {isAddingNew && (
              <Card>
                <CardHeader>
                  <CardTitle>Adicionar Novo Produto</CardTitle>
                  <CardDescription>Preencha os dados do novo produto</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome do Produto *</Label>
                      <Input
                        id="name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        placeholder="Ex: Smartphone Samsung Galaxy"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Preço (R$) *</Label>
  <Input
    id="price"
    type="number"
    step="0.01"
    min="0"
    value={newProduct.price === 0 ? "" : newProduct.price}
    onChange={(e) => setNewProduct({ 
      ...newProduct, 
      price: e.target.value === "" ? 0 : Number.parseFloat(e.target.value) 
    })}
    placeholder="299.99"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria *</Label>
                      <Input
                        id="category"
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        placeholder="Ex: Eletrônicos"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="size">Tamanho/Especificação</Label>
                      <Input
                        id="size"
                        value={newProduct.size}
                        onChange={(e) => setNewProduct({ ...newProduct, size: e.target.value })}
                        placeholder="Ex: M, 128GB"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand">Marca</Label>
                      <Input
                        id="brand"
                        value={newProduct.brand}
                        onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                        placeholder="Ex: Samsung, Nike"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock">Estoque</Label>
  <Input
    id="stock"
    type="number"
    min="0"
    value={newProduct.stock === 0 ? "" : newProduct.stock}
    onChange={(e) => setNewProduct({ 
      ...newProduct, 
      stock: e.target.value === "" ? 0 : Number.parseInt(e.target.value) || 0 
    })}
    placeholder="Quantidade em estoque"
                        placeholder="Quantidade em estoque"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição do Produto</Label>
                    <Textarea
                      id="description"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      placeholder="Descrição detalhada do produto..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Imagens do Produto (até 3 imagens) *</Label>
                    <div className="space-y-4">
                      {newProduct.images.map((image, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Imagem {index + 1}</span>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeProductImage(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-4">
                            <input
                              type="file"
                              accept="image/*"
                              ref={el => fileInputRefs.current[index] = el}
                              onChange={(e) => handleFileSelect(index, e.target.files)}
                              className="hidden"
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              className="flex items-center gap-2"
                              onClick={() => fileInputRefs.current[index]?.click()}
                              disabled={uploadingImages[index]}
                            >
                              {uploadingImages[index] ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                                  Enviando...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4" />
                                  Selecionar Imagem
                                </>
                              )}
                            </Button>
                          </div>
                          {image && (
                            <div className="mt-2">
                              <img
                                src={image}
                                alt={`Preview ${index + 1}`}
                                className="w-32 h-32 object-contain border rounded-md"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {newProduct.images.length < 3 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addProductImage}
                          className="w-full flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Adicionar Imagem ({newProduct.images.length}/3)
                        </Button>
                      )}
                      </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={newProduct.featured}
                      onCheckedChange={(checked) => setNewProduct({ ...newProduct, featured: checked })}
                    />
                    <Label htmlFor="featured">Produto em Destaque</Label>
                  </div>
                  <div className="flex gap-2 pt-4">
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
            {filteredProducts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">
                    {searchTerm || selectedCategory !== "all" ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || selectedCategory !== "all" 
                      ? "Tente ajustar os filtros de busca ou categoria" 
                      : "Adicione seu primeiro produto para começar!"}
                  </p>
                  <Button onClick={() => setIsAddingNew(true)} className="flex items-center gap-2 mx-auto">
                    <Plus className="w-4 h-4" />
                    Adicionar Produto
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className={`overflow-hidden ${product.featured ? 'border-primary border-2' : ''}`}>
                    <div className="relative">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      {product.featured && (
                        <Badge className="absolute top-2 left-2 bg-primary">Destaque</Badge>
                      )}
                      {product.stock !== undefined && product.stock <= 0 && (
                        <Badge variant="destructive" className="absolute top-2 right-2">Sem Estoque</Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      {editingProduct?.id === product.id ? (
                        <div className="space-y-3">
                          <Input
                            value={editingProduct.name}
                            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                            placeholder="Nome do produto"
                          />
<div className="grid grid-cols-2 gap-2">
  <Input
    type="number"
    step="0.01"
    value={editingProduct.price === 0 ? "" : editingProduct.price}
    onChange={(e) =>
      setEditingProduct({ 
        ...editingProduct, 
        price: e.target.value === "" ? 0 : Number.parseFloat(e.target.value) || 0 
      })
    }
    placeholder="Preço"
  />
  <Input
    value={editingProduct.category}
    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
    placeholder="Categoria"
  />
</div>                          <div className="flex gap-2">
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
                          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-lg font-bold text-primary">R$ {product.price.toFixed(2)}</p>
                            {product.stock !== undefined && (
                              <Badge variant={product.stock > 0 ? "outline" : "destructive"}>
                                {product.stock > 0 ? `${product.stock} em estoque` : "Sem estoque"}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 mb-3">
                            <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                            {product.brand && <Badge variant="outline" className="text-xs">{product.brand}</Badge>}
                            {product.size && <Badge variant="outline" className="text-xs">{product.size}</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                          <div className="flex gap-2 mb-3">
                            <Button
                              size="sm"
                              variant={product.sold ? "outline" : "default"}
                              onClick={() => markAsSold(product.id, !product.sold)}
                              className={`flex items-center gap-1 flex-1 ${
                                product.sold 
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                  : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                              }`}
                            >
                              <CheckCircle className="w-3 h-3" />
                              {product.sold ? 'Marcar Disponível' : 'Marcar como Vendido'}
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingProduct(product)}
                              className="flex items-center gap-1 flex-1"
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
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Seção de produtos vendidos */}
            {soldProducts.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-muted-foreground" />
                  <h3 className="text-xl font-semibold text-muted-foreground">
                    Produtos Vendidos ({soldProducts.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {soldProducts.map((product) => (
                    <Card key={product.id} className="opacity-60 border-dashed">
                      <div className="relative">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-48 object-cover grayscale"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                            <ImageIcon className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        <Badge className="absolute top-2 left-2 bg-green-600">VENDIDO</Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
                        <p className="text-lg font-bold text-primary mb-2">R$ {product.price.toFixed(2)}</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsSold(product.id, false)}
                            className="flex items-center gap-1 flex-1 bg-blue-100 text-blue-800 hover:bg-blue-200"
                          >
                            <Package className="w-3 h-3" />
                            Marcar Disponível
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="banners" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h2 className="text-2xl font-semibold">Gerenciar Banners Promocionais</h2>
              <Button onClick={() => setIsAddingBanner(true)} className="flex items-center gap-2 self-start sm:self-auto">
                <Plus className="w-4 h-4" />
                Adicionar Banner
              </Button>
            </div>

            {/* Formulário para adicionar novo banner */}
            {isAddingBanner && (
              <Card>
                <CardHeader>
                  <CardTitle>Criar Novo Banner Promocional</CardTitle>
                  <CardDescription>Configure o banner para suas campanhas promocionais</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="banner-title">Título do Banner *</Label>
                      <Input
                        id="banner-title"
                        value={newBanner.title}
                        onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                        placeholder="Ex: MEGA PROMOÇÃO - 50% OFF"
                      />
                    </div>
                    <div className="space-y-2">
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
                    <div className="space-y-2">
                      <Label htmlFor="banner-start">Data de Início</Label>
                      <Input
                        id="banner-start"
                        type="date"
                        value={newBanner.startDate}
                        onChange={(e) => setNewBanner({ ...newBanner, startDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="banner-end">Data de Fim</Label>
                      <Input
                        id="banner-end"
                        type="date"
                        value={newBanner.endDate}
                        onChange={(e) => setNewBanner({ ...newBanner, endDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="banner-bg">Cor de Fundo</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="banner-bg"
                          type="color"
                          value={newBanner.backgroundColor}
                          onChange={(e) => setNewBanner({ ...newBanner, backgroundColor: e.target.value })}
                          className="w-12 h-12 p-1"
                        />
                        <Input
                          value={newBanner.backgroundColor}
                          onChange={(e) => setNewBanner({ ...newBanner, backgroundColor: e.target.value })}
                          placeholder="#059669"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="banner-text-color">Cor do Texto</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="banner-text-color"
                          type="color"
                          value={newBanner.textColor}
                          onChange={(e) => setNewBanner({ ...newBanner, textColor: e.target.value })}
                          className="w-12 h-12 p-1"
                        />
                        <Input
                          value={newBanner.textColor}
                          onChange={(e) => setNewBanner({ ...newBanner, textColor: e.target.value })}
                          placeholder="#ffffff"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="banner-description">Descrição</Label>
                    <Textarea
                      id="banner-description"
                      value={newBanner.description}
                      onChange={(e) => setNewBanner({ ...newBanner, description: e.target.value })}
                      placeholder="Descrição da promoção..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="banner-image">Imagem do Banner *</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="banner-image"
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (file) await uploadBannerImage(file)
                        }}
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex items-center gap-2"
                        onClick={() => {
                          const input = document.getElementById('banner-image') as HTMLInputElement
                          input?.click()
                        }}
                      >
                        <Upload className="w-4 h-4" />
                        Upload
                      </Button>
                    </div>
                    {newBanner.imageUrl && (
                      <div className="mt-2">
                        <img
                          src={newBanner.imageUrl}
                          alt="Preview"
                          className="w-full h-40 object-contain border rounded-md"
                        />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
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
                  <div className="flex gap-2 pt-4">
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
            {banners.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Nenhum banner criado</h3>
                  <p className="text-muted-foreground mb-4">
                    Crie banners promocionais para destacar suas ofertas especiais!
                  </p>
                  <Button onClick={() => setIsAddingBanner(true)} className="flex items-center gap-2 mx-auto">
                    <Plus className="w-4 h-4" />
                    Criar Primeiro Banner
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {banners.map((banner) => (
                  <Card key={banner.id} className={`${!banner.isActive ? 'opacity-70' : ''}`}>
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
                        <div className="flex flex-col md:flex-row items-start gap-4">
                          {banner.imageUrl ? (
                            <img
                              src={banner.imageUrl}
                              alt={banner.title}
                              className="w-full md:w-48 h-32 object-cover rounded"
                            />
                          ) : (
                            <div className="w-full md:w-48 h-32 bg-gray-200 flex items-center justify-center rounded">
                              <ImageIcon className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{banner.title}</h3>
                              <Badge className={
                                banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }>
                                {banner.isActive ? 'Ativo' : 'Inativo'}
                              </Badge>
                              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                Prioridade: {banner.priority}
                              </Badge>
                            </div>
                            {banner.description && (
                              <p className="text-sm text-muted-foreground mb-2">{banner.description}</p>
                            )}
                            {banner.startDate && (
                              <p className="text-xs text-muted-foreground">
                                Período: {banner.startDate} {banner.endDate && `até ${banner.endDate}`}
                              </p>
                            )}
                            {banner.linkUrl && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Link: <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{banner.linkUrl}</a>
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2 self-start md:self-auto">
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
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-8 p-6 bg-muted rounded-lg">
          <h3 className="font-semibold mb-3 text-lg">Informações do Sistema:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">📦 Gerenciamento de Produtos</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Adicione, edite ou remova produtos</li>
                <li>• Controle de estoque e preços</li>
                <li>• Destaque produtos especiais</li>
                <li>• Organize por categorias</li>
                <li>• Marque produtos como vendidos</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🎯 Gerenciamento de Banners</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Crie campanhas promocionais</li>
                <li>• Defina datas e prioridades</li>
                <li>• Customize cores e estilos</li>
                <li>• Ative/desative conforme necessidade</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}