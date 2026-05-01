import { useState, useEffect } from 'react'
import { FolderTree, Plus, Pencil, Trash2, X, ChevronRight, Package, Search, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'
import { api } from '@/lib/api'
import type { Category, Product } from '@/types'

interface CategoryFormData {
  name: string
  description: string
}

export function AdminCategoryPage() {
  const { state, fetchCategories } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>({ name: '', description: '' })
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // View products in category
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null)
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  const openAdd = () => {
    setEditingCategory(null)
    setFormData({ name: '', description: '' })
    setFormError('')
    setShowForm(true)
  }

  const openEdit = (cat: Category) => {
    setEditingCategory(cat)
    setFormData({ name: cat.name, description: cat.description || '' })
    setFormError('')
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingCategory(null)
    setFormData({ name: '', description: '' })
    setFormError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) { setFormError('Category name is required'); return }
    setIsSubmitting(true)
    setFormError('')
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, formData)
      } else {
        await api.post('/categories', formData)
      }
      await fetchCategories()
      closeForm()
    } catch (err: any) {
      setFormError(err.message || 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return
    setDeletingId(id)
    try {
      await api.delete(`/categories/${id}`)
      await fetchCategories()
      if (viewingCategory?.id === id) setViewingCategory(null)
    } catch (err: any) {
      alert(err.message || 'Failed to delete category')
    } finally {
      setDeletingId(null)
    }
  }

  const viewProducts = async (cat: Category) => {
    setViewingCategory(cat)
    setLoadingProducts(true)
    setCategoryProducts([])
    try {
      const res = await api.get<any>(`/products?categoryId=${cat.id}&limit=100`)
      setCategoryProducts(res.data || [])
    } catch (err: any) {
      setCategoryProducts([])
    } finally {
      setLoadingProducts(false)
    }
  }

  const filteredCategories = state.categories.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const categoryColors = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-green-500 to-green-600',
    'from-orange-500 to-orange-600',
    'from-pink-500 to-pink-600',
    'from-teal-500 to-teal-600',
  ]

  // Category Products View
  if (viewingCategory) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setViewingCategory(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{viewingCategory.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{viewingCategory.description}</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            {loadingProducts ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : categoryProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No products in this category</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-4">{categoryProducts.length} products found</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {categoryProducts.map(product => (
                    <div key={product.id} className="border rounded-xl overflow-hidden hover:shadow-md transition-all">
                      <div className="aspect-square bg-secondary/20 overflow-hidden">
                        {product.imageUrls?.[0] ? (
                          <img
                            src={product.imageUrls[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-medium text-sm line-clamp-2">{product.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">SKU: {product.sku}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-bold text-primary">${product.price.toLocaleString()}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {state.categories.length} categories total
          </p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md p-6 m-4 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <Button variant="ghost" size="icon" onClick={closeForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Category Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Electronics"
                  value={formData.name}
                  onChange={e => setFormData(d => ({ ...d, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Description</label>
                <textarea
                  placeholder="Brief description of this category..."
                  value={formData.description}
                  onChange={e => setFormData(d => ({ ...d, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              {formError && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-3 py-2 rounded-lg">
                  {formError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={closeForm} className="flex-1">Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderTree className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-1">No categories found</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {searchTerm ? 'Try a different search term' : 'Get started by adding your first category'}
            </p>
            {!searchTerm && (
              <Button onClick={openAdd} className="gap-2">
                <Plus className="h-4 w-4" /> Add Category
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat, idx) => (
            <Card key={cat.id} className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
              <CardContent className="p-0">
                {/* Color header */}
                <div className={`h-2 bg-gradient-to-r ${categoryColors[idx % categoryColors.length]}`} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${categoryColors[idx % categoryColors.length]} flex items-center justify-center shrink-0`}>
                      <FolderTree className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEdit(cat)}
                        title="Edit category"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(cat.id)}
                        disabled={deletingId === cat.id}
                        title="Delete category"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <h3 className="font-semibold">{cat.name}</h3>
                    {cat.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{cat.description}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Package className="h-3.5 w-3.5" />
                      <span>{(cat as any)._count?.products ?? 0} products</span>
                    </div>
                    <button
                      onClick={() => viewProducts(cat)}
                      className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      View products <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
