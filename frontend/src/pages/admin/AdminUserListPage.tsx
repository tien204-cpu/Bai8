import { useState, useEffect } from 'react'
import { Plus, Trash2, UserPlus, Shield, ShieldCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { SimpleBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStore } from '@/lib/store'

export function AdminUserListPage() {
  const { state, fetchUsers, addUser, deleteUser, updateUserRole } = useStore()
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteUser(id)
    }
  }

  const handleToggleRole = async (user: any) => {
    const newRole = user.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN'
    await updateUserRole(user.id, newRole)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">{state.users.length} registered users</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <UserPlus className="h-4 w-4 mr-2" /> Add User
        </Button>
      </div>

      {showForm && (
        <UserForm
          onClose={() => setShowForm(false)}
          onSubmit={async (data) => {
            await addUser(data)
            setShowForm(false)
          }}
        />
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-secondary/30">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">User</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Email</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Role</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.users.map((user) => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-secondary/20 transition-smooth">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center">
                          <span className="text-xs font-bold text-primary-foreground">{user.firstName[0]}</span>
                        </div>
                        <span className="text-sm font-medium">{user.firstName} {user.lastName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <SimpleBadge variant={user.role === 'ADMIN' ? 'default' : 'success'}>{user.role}</SimpleBadge>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleToggleRole(user)}>
                          {user.role === 'ADMIN' ? <Shield className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
                        </Button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <SimpleBadge variant={user.isActive ? 'success' : 'destructive'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </SimpleBadge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(user.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
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

function UserForm({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: any) => Promise<void> }) {
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'CUSTOMER',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await onSubmit(form)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="animate-scale-in mb-6">
      <CardContent className="p-6">
        <h3 className="font-semibold mb-4">Add New User</h3>
        {error && <p className="text-sm text-destructive mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Email / Username" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <Input label="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
          <Input label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Role</label>
            <select 
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" 
              value={form.role} 
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="CUSTOMER">Customer</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="sm:col-span-2 flex justify-end gap-3 mt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create User'}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
