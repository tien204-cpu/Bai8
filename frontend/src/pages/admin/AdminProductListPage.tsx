import { useState } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { SimpleBadge } from '@/components/ui/badge'
import { useStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types'

export function AdminProductListPage() {
  const { state, deleteProduct } = useStore()
  const [search, setSearch] = useState('')
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [showForm, setShowForm] = useState(false)

  const filtered = state.products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">{state.products.length} total products</p>
        </div>
        <Button onClick={() => { setEditProduct(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {showForm && (
        <ProductForm
          product={editProduct}
          onClose={() => { setShowForm(false); setEditProduct(null); }}
        />
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-secondary/30">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Product</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">SKU</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Category</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Price</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Stock</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} className="border-b last:border-0 hover:bg-secondary/20 transition-smooth">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary/50 overflow-hidden shrink-0">
                          <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-sm font-medium line-clamp-1">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{product.sku}</td>
                    <td className="px-4 py-3 text-sm">{product.category?.name}</td>
                    <td className="px-4 py-3 text-sm font-medium text-right">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3 text-right">
                      <SimpleBadge variant={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'destructive'}>
                        {product.stock}
                      </SimpleBadge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditProduct(product); setShowForm(true); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteProduct(product.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ProductForm({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { state, addProduct, updateProduct } = useStore()
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    sku: product?.sku || '',
    categoryId: product?.categoryId || state.categories[0]?.id || '',
    stock: product?.stock || 0,
    imageUrls: product?.imageUrls || [],
  })
  const [imagePreview, setImagePreview] = useState<string>(product?.imageUrls[0] || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setImagePreview(base64String)
        setForm({ ...form, imageUrls: [base64String] })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!form.name?.trim()) {
      setError('Product name is required')
      return
    }
    if (!form.sku?.trim()) {
      setError('SKU is required')
      return
    }
    if (form.price <= 0) {
      setError('Price must be greater than 0')
      return
    }
    if (!form.categoryId) {
      setError('Please select a category')
      return
    }
    if (!product && !form.imageUrls.length) {
      setError('Please upload a product image')
      return
    }

    setIsSubmitting(true)
    try {
      if (product) {
        const { stock, ...updateData } = form
        await updateProduct(product.id, updateData)
      } else {
        await addProduct({
          name: form.name,
          description: form.description,
          price: form.price,
          sku: form.sku,
          categoryId: form.categoryId,
          imageUrls: form.imageUrls,
          initialStock: form.stock,
        })
      }
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to save product')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="animate-scale-in">
      <CardContent className="p-6">
        <h3 className="font-semibold mb-4">{product ? 'Edit Product' : 'Add New Product'}</h3>
        {error && <div className="mb-4 p-3 bg-destructive/10 border border-destructive text-destructive rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required disabled={isSubmitting} />
          <Input label="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required disabled={isSubmitting} />
          <Input label="Price (VND)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required disabled={isSubmitting} />
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Category</label>
            <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm disabled:opacity-50" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} disabled={isSubmitting}>
              {state.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <Input label="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} disabled={isSubmitting} />
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Product Image (Local File only)</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-secondary/50 border overflow-hidden flex items-center justify-center shrink-0">
                {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <Plus className="h-6 w-6 text-muted-foreground" />}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isSubmitting}
                className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:opacity-90 cursor-pointer disabled:opacity-50"
              />
            </div>
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm disabled:opacity-50" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} disabled={isSubmitting} />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : (product ? 'Update' : 'Create')} Product</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
