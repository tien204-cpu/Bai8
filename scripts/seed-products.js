const { PrismaClient } = require('../apps/product-service/src/generated/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:password@localhost:5432/ecommerce_products'
    }
  }
});

async function seed() {
  const count = await prisma.category.count();
  if (count > 0) {
    console.log('Data already exists, count: ' + count);
    await prisma.$disconnect();
    return;
  }
  
  console.log('Seeding data...');
  
  const elec = await prisma.category.create({data:{name:'Electronics',description:'Gadgets and devices',slug:'electronics'}});
  const fashion = await prisma.category.create({data:{name:'Fashion',description:'Clothing and accessories',slug:'fashion'}});
  const home = await prisma.category.create({data:{name:'Home & Living',description:'Furniture and decor',slug:'home-living'}});
  const sports = await prisma.category.create({data:{name:'Sports',description:'Sport equipment',slug:'sports'}});

  await prisma.product.create({data:{name:'iPhone 15 Pro',description:'Latest Apple smartphone with titanium design',price:999,sku:'IP15P-001',imageUrls:['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400'],categoryId:elec.id,inventory:{create:{quantity:50,reservedQuantity:0}}}});
  await prisma.product.create({data:{name:'MacBook Air M3',description:'Thin and light laptop with M3 chip',price:1099,sku:'MBA-M3-001',imageUrls:['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'],categoryId:elec.id,inventory:{create:{quantity:30,reservedQuantity:0}}}});
  await prisma.product.create({data:{name:'Samsung 4K TV 55"',description:'Crystal clear 4K display with smart features',price:599,sku:'TV-SAM-55-001',imageUrls:['https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400'],categoryId:elec.id,inventory:{create:{quantity:20,reservedQuantity:0}}}});
  await prisma.product.create({data:{name:'Classic White T-Shirt',description:'100% cotton premium white t-shirt',price:25,sku:'TSHIRT-WHT-001',imageUrls:['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'],categoryId:fashion.id,inventory:{create:{quantity:100,reservedQuantity:0}}}});
  await prisma.product.create({data:{name:'Slim Fit Jeans',description:'Modern slim fit denim jeans',price:55,sku:'JEANS-SLM-001',imageUrls:['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400'],categoryId:fashion.id,inventory:{create:{quantity:80,reservedQuantity:0}}}});
  await prisma.product.create({data:{name:'Running Shoes',description:'Lightweight performance running shoes',price:89,sku:'SHOES-RUN-001',imageUrls:['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'],categoryId:sports.id,inventory:{create:{quantity:60,reservedQuantity:0}}}});
  await prisma.product.create({data:{name:'Yoga Mat Premium',description:'Non-slip premium yoga mat',price:35,sku:'YOGA-MAT-001',imageUrls:['https://images.unsplash.com/photo-1601925228133-d46ab6e63d5c?w=400'],categoryId:sports.id,inventory:{create:{quantity:150,reservedQuantity:0}}}});
  await prisma.product.create({data:{name:'Desk Lamp LED',description:'Adjustable LED desk lamp with USB charging',price:45,sku:'LAMP-LED-001',imageUrls:['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400'],categoryId:home.id,inventory:{create:{quantity:70,reservedQuantity:0}}}});

  console.log('Seeding done! 4 categories and 8 products created.');
  await prisma.$disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });
