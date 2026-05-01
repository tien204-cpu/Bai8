import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, Grid3X3, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useStore } from '@/lib/store'
import { formatPrice, cn } from '@/lib/utils'

export function ProductListPage() {
  const { state, addToCart } = useStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [sortBy, setSortBy] = useState('newest')
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const filtered = useMemo(() => {
    let products = [...state.products]
    if (search) {
      const q = search.toLowerCase()
      products = products.filter((p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
    }
    if (selectedCategory) {
      products = products.filter((p) => p.categoryId === selectedCategory)
    }
    switch (sortBy) {
      case 'price-asc': products.sort((a, b) => a.price - b.price); break
      case 'price-desc': products.sort((a, b) => b.price - a.price); break
      case 'name': products.sort((a, b) => a.name.localeCompare(b.name)); break
      default: products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
    return products
  }, [state.products, search, selectedCategory, sortBy])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-64 shrink-0">
          <div className="sticky top-24 space-y-6">
            <div>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Categories</h4>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={cn("w-full text-left text-sm px-3 py-2 rounded-lg transition-smooth", !selectedCategory ? "bg-primary text-primary-foreground" : "hover:bg-secondary")}
                >
                  All Categories
                </button>
                {state.categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn("w-full text-left text-sm px-3 py-2 rounded-lg transition-smooth flex justify-between", selectedCategory === cat.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary")}
                  >
                    <span>{cat.name}</span>
                    <span className="opacity-60">{cat._count?.products}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Sort By</h4>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name: A-Z</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              Showing <strong>{filtered.length}</strong> products
            </p>
            <div className="flex items-center gap-1">
              <Button variant={view === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setView('grid')}>
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setView('list')}>
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-1">No products found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((product) => (
                <Card key={product.id} className="group overflow-hidden hover:shadow-card-hover cursor-pointer animate-fade-in" onClick={() => navigate(`/products/${product.id}`)}>
                  <div className="aspect-square bg-secondary/50 relative overflow-hidden">
                    <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  </div>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">{product.category?.name}</p>
                    <h3 className="font-semibold text-sm mb-1 line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary">{formatPrice(product.price)}</span>
                      <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); addToCart(product); }}>Add</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-card-hover cursor-pointer animate-fade-in" onClick={() => navigate(`/products/${product.id}`)}>
                  <div className="flex">
                    <div className="w-32 h-32 bg-secondary/50 shrink-0">
                      <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <CardContent className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{product.category?.name}</p>
                        <h3 className="font-semibold text-sm">{product.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{product.description}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-primary">{formatPrice(product.price)}</span>
                        <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); addToCart(product); }}>Add to Cart</Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
