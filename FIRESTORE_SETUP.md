# Configuração do Firebase Firestore

## Erro de Índice Detectado

O erro que você está enfrentando indica que o Firestore precisa de um índice composto para a query que busca produtos:

\`\`\`javascript
const q = query(
  collection(db, "products"), 
  where("sold", "!=", true),
  orderBy("sold"),
  orderBy("name")
)
\`\`\`

## Solução do Índice

### Opção 1: Criar via Console (Recomendado)
1. Acesse o link fornecido no erro: https://console.firebase.google.com/v1/r/project/gaseagua-9d387/firestore/indexes?create_composite=...
2. Clique em "Criar Índice" 
3. O Firebase criará automaticamente o índice necessário

### Opção 2: Criar via Firebase CLI
Execute o comando no terminal:
\`\`\`bash
firebase deploy --only firestore:indexes
\`\`\`

### Opção 3: Configuração Manual
No Console do Firebase:
1. Vá para Firestore Database
2. Clique na aba "Indexes" 
3. Clique em "Create Index"
4. Configure:
   - **Collection ID**: products
   - **Fields**:
     - sold: Ascending
     - name: Ascending
   - **Query Scope**: Collection

## Estrutura do Banco de Dados

### Coleção: products
\`\`\`javascript
{
  id: string,
  name: string,           // Nome do produto (obrigatório)
  description: string,    // Descrição do produto
  price: number,          // Preço em reais (obrigatório)
  images: string[],       // Array de URLs das imagens (1-3 imagens)
  category: string,       // Categoria do produto (obrigatório)
  size: string,          // Tamanho/especificação
  brand: string,         // Marca do produto
  stock: number,         // Quantidade em estoque
  featured: boolean,     // Produto em destaque
  sold: boolean          // Produto vendido
}
\`\`\`

### Coleção: banners
\`\`\`javascript
{
  id: string,
  title: string,          // Título do banner (obrigatório)
  description: string,    // Descrição do banner
  imageUrl: string,       // URL da imagem (obrigatório)
  linkUrl: string,        // URL de destino do banner
  isActive: boolean,      // Banner ativo (obrigatório)
  priority: number,       // Prioridade 1-10 (obrigatório)
  startDate: string,      // Data de início (YYYY-MM-DD)
  endDate: string,        // Data de fim (YYYY-MM-DD)
  backgroundColor: string, // Cor de fundo hex
  textColor: string,      // Cor do texto hex
  createdAt: timestamp    // Data de criação
}
\`\`\`

## Regras de Segurança

As regras do Firestore foram configuradas para:

### Produtos:
- **Leitura**: Permitida para todos (produtos são públicos)
- **Escrita**: Apenas usuários autenticados (administradores)
- **Validação**: Campos obrigatórios e tipos de dados

### Banners:
- **Leitura**: Permitida para todos (banners são públicos)
- **Escrita**: Apenas usuários autenticados (administradores)
- **Validação**: Campos obrigatórios e tipos de dados

## Queries Utilizadas no Sistema

### 1. Produtos Disponíveis (Página Principal)
\`\`\`javascript
const q = query(
  collection(db, "products"), 
  where("sold", "!=", true),
  orderBy("sold"),
  orderBy("name")
)
\`\`\`
**Índice necessário**: sold (asc), name (asc)

### 2. Banners Ativos
\`\`\`javascript
const bannersQuery = query(
  collection(db, "banners"),
  where("isActive", "==", true),
  orderBy("priority", "desc")
)
\`\`\`
**Índice necessário**: isActive (asc), priority (desc)

### 3. Todos os Produtos (Admin)
\`\`\`javascript
const productsQuery = query(
  collection(db, "products"), 
  orderBy("name")
)
\`\`\`
**Índice necessário**: name (asc) - criado automaticamente

### 4. Todos os Banners (Admin)
\`\`\`javascript
const bannersQuery = query(
  collection(db, "banners"), 
  orderBy("priority", "desc")
)
\`\`\`
**Índice necessário**: priority (desc) - criado automaticamente

## Como Aplicar as Regras

1. Copie o conteúdo do arquivo `firestore.rules`
2. No Console do Firebase:
   - Vá para Firestore Database
   - Clique na aba "Rules"
   - Cole as regras
   - Clique em "Publish"

## Configuração de Autenticação

O sistema usa Firebase Authentication para controle de acesso administrativo:
- Email/senha para login de administradores
- Apenas usuários autenticados podem modificar dados
- Leitura pública para produtos e banners

## Monitoramento

Para monitorar o uso e performance:
1. Acesse o Console do Firebase
2. Vá para Firestore Database
3. Monitore na aba "Usage" e "Monitoring"

## Backup e Segurança

Recomendações:
- Configure backups automáticos no Console
- Monitore as regras de segurança regularmente
- Use variáveis de ambiente para configurações sensíveis
