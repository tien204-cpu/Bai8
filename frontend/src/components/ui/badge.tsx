import { cn } from "@/lib/utils"
import type { OrderStatus } from "@/types"

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-warning/10 text-warning-foreground border-warning/20' },
  CONFIRMED: { label: 'Confirmed', className: 'bg-primary/10 text-primary border-primary/20' },
  PROCESSING: { label: 'Processing', className: 'bg-primary/10 text-primary border-primary/20' },
  SHIPPED: { label: 'Shipped', className: 'bg-accent/10 text-accent-foreground border-accent/20' },
  DELIVERED: { label: 'Delivered', className: 'bg-success/10 text-success border-success/20' },
  CANCELLED: { label: 'Cancelled', className: 'bg-destructive/10 text-destructive border-destructive/20' },
}

export function Badge({ status, className }: { status: OrderStatus; className?: string }) {
  const config = statusConfig[status]
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", config.className, className)}>
      {config.label}
    </span>
  )
}

export function SimpleBadge({ children, variant = 'default', className }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'destructive'; className?: string }) {
  const variants = {
    default: 'bg-secondary text-secondary-foreground',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning-foreground',
    destructive: 'bg-destructive/10 text-destructive',
  }
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  )
}
