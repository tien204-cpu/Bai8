import { useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { ShoppingCart, Search, User, Menu, X, LogOut, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'

export function ClientLayout() {
  const { state, logout } = useStore()
  const [mobileMenu, setMobileMenu] = useState(false)
  const navigate = useNavigate()
  const cartCount = state.cart.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">S</span>
              </div>
              <span className="text-xl font-bold text-foreground">ShopVerse</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth">Products</Link>
              <Link to="/products?category=1" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth">Electronics</Link>
              <Link to="/products?category=2" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth">Fashion</Link>
              <Link to="/products?category=3" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth">Home</Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/products')} className="hidden sm:flex">
              <Search className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="icon" className="relative" onClick={() => navigate('/cart')}>
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full gradient-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>

            {state.user ? (
              <div className="flex items-center gap-2">
                {state.user.role === 'ADMIN' && (
                  <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>Admin</Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => navigate('/orders')}>
                  <Package className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { logout(); navigate('/'); }} className="gap-1.5">
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign in</Button>
                <Button size="sm" onClick={() => navigate('/register')}>Sign up</Button>
              </div>
            )}

            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {mobileMenu && (
          <div className="md:hidden border-t bg-background p-4 animate-fade-in">
            <nav className="flex flex-col gap-3">
              <Link to="/products" onClick={() => setMobileMenu(false)} className="text-sm font-medium py-2">All Products</Link>
              <Link to="/products?category=1" onClick={() => setMobileMenu(false)} className="text-sm font-medium py-2">Electronics</Link>
              <Link to="/products?category=2" onClick={() => setMobileMenu(false)} className="text-sm font-medium py-2">Fashion</Link>
              <Link to="/products?category=3" onClick={() => setMobileMenu(false)} className="text-sm font-medium py-2">Home & Living</Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t bg-secondary/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-foreground">S</span>
                </div>
                <span className="text-lg font-bold">ShopVerse</span>
              </div>
              <p className="text-sm text-muted-foreground">Your destination for quality products and seamless shopping.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Shop</h4>
              <div className="flex flex-col gap-2">
                <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">All Products</Link>
                <Link to="/products?category=1" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">Electronics</Link>
                <Link to="/products?category=2" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">Fashion</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Account</h4>
              <div className="flex flex-col gap-2">
                <Link to="/orders" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">My Orders</Link>
                <Link to="/cart" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">Cart</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Support</h4>
              <div className="flex flex-col gap-2">
                <span className="text-sm text-muted-foreground">help@shopverse.com</span>
                <span className="text-sm text-muted-foreground">1900-1234</span>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-xs text-muted-foreground">
            &copy; 2024 ShopVerse. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
