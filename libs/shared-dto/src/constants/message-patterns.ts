// ============================================
// User Service - TCP Message Patterns
// ============================================
export const USER_PATTERNS = {
  REGISTER: 'user.register',
  LOGIN: 'user.login',
  REFRESH_TOKEN: 'user.refreshToken',
  GET_PROFILE: 'user.getProfile',
  UPDATE_PROFILE: 'user.updateProfile',
  FIND_ALL: 'user.findAll',
  FIND_ONE: 'user.findOne',
  UPDATE_ROLE: 'user.updateRole',
  DELETE: 'user.delete',
} as const;

// ============================================
// Product Service - TCP Message Patterns
// ============================================
export const PRODUCT_PATTERNS = {
  // Products
  CREATE: 'product.create',
  FIND_ALL: 'product.findAll',
  FIND_ONE: 'product.findOne',
  UPDATE: 'product.update',
  DELETE: 'product.delete',
  SEARCH: 'product.search',
  // Categories
  CATEGORY_CREATE: 'category.create',
  CATEGORY_FIND_ALL: 'category.findAll',
  CATEGORY_FIND_ONE: 'category.findOne',
  CATEGORY_UPDATE: 'category.update',
  CATEGORY_DELETE: 'category.delete',
  // Inventory
  RESERVE_INVENTORY: 'product.reserveInventory',
  RELEASE_INVENTORY: 'product.releaseInventory',
  GET_INVENTORY: 'product.getInventory',
  UPDATE_INVENTORY: 'product.updateInventory',
} as const;

// ============================================
// Order Service - TCP Message Patterns
// ============================================
export const ORDER_PATTERNS = {
  // Cart
  CART_GET: 'cart.get',
  CART_ADD_ITEM: 'cart.addItem',
  CART_UPDATE_ITEM: 'cart.updateItem',
  CART_REMOVE_ITEM: 'cart.removeItem',
  CART_CLEAR: 'cart.clear',
  // Orders
  CREATE: 'order.create',
  FIND_ALL: 'order.findAll',
  FIND_BY_USER: 'order.findByUser',
  FIND_ONE: 'order.findOne',
  UPDATE_STATUS: 'order.updateStatus',
  CANCEL: 'order.cancel',
} as const;

// ============================================
// Payment Service - TCP Message Patterns
// ============================================
export const PAYMENT_PATTERNS = {
  CREATE: 'payment.create',
  FIND_BY_ORDER: 'payment.findByOrder',
  FIND_BY_USER: 'payment.findByUser',
  STRIPE_WEBHOOK: 'payment.stripeWebhook',
  VNPAY_CALLBACK: 'payment.vnpayCallback',
} as const;
