const { PrismaClient } = require('./src/generated/client');
const prisma = new PrismaClient();

async function seed() {
  try {
    const count = await prisma.category.count();
    if (count > 0) {
      console.log('Already has data: ' + count + ' categories');
      return;
    }

    console.log('Seeding categories and products...');

    const elec = await prisma.category.create({
      data: { name: 'Electronics', description: 'Gadgets and devices' }
    });
    const fashion = await prisma.category.create({
      data: { name: 'Fashion', description: 'Clothing and accessories' }
    });
    const home = await prisma.category.create({
      data: { name: 'Home & Living', description: 'Furniture and decor' }
    });
    const sports = await prisma.category.create({
      data: { name: 'Sports', description: 'Sport equipment' }
    });

    const products = [
      { name: 'iPhone 15 Pro', description: 'Latest Apple smartphone with titanium design', price: 999, sku: 'IP15P-001', images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400'], cat: elec.id, qty: 50 },
      { name: 'MacBook Air M3', description: 'Thin and light laptop with M3 chip', price: 1099, sku: 'MBA-M3-001', images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'], cat: elec.id, qty: 30 },
      { name: 'Wireless Headphones', description: 'Premium noise-cancelling headphones', price: 299, sku: 'HEAD-BT-001', images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'], cat: elec.id, qty: 40 },
      { name: 'Classic White T-Shirt', description: '100% cotton premium t-shirt', price: 25, sku: 'TSHIRT-WHT-001', images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'], cat: fashion.id, qty: 100 },
      { name: 'Slim Fit Jeans', description: 'Modern slim fit denim jeans', price: 55, sku: 'JEANS-SLM-001', images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400'], cat: fashion.id, qty: 80 },
      { name: 'Running Shoes', description: 'Lightweight performance running shoes', price: 89, sku: 'SHOES-RUN-001', images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'], cat: sports.id, qty: 60 },
      { name: 'Yoga Mat Premium', description: 'Non-slip thick yoga mat', price: 35, sku: 'YOGA-MAT-001', images: ['https://images.unsplash.com/photo-1601925228133-d46ab6e63d5c?w=400'], cat: sports.id, qty: 150 },
      { name: 'LED Desk Lamp', description: 'Adjustable LED desk lamp with USB charging', price: 45, sku: 'LAMP-LED-001', images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400'], cat: home.id, qty: 70 },
    ];

    for (const p of products) {
      await prisma.product.create({
        data: {
          name: p.name,
          description: p.description,
          price: p.price,
          sku: p.sku,
          imageUrls: p.images,
          categoryId: p.cat,
          inventory: { create: { quantity: p.qty, reservedQuantity: 0 } }
        }
      });
      console.log('Created product: ' + p.name);
    }

    console.log('Done! 4 categories and 8 products seeded successfully.');
  } catch (e) {
    console.error('Seed error:', e.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
