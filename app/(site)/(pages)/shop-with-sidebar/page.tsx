import React from "react";
import ShopWithSidebar from "@/components/ShopWithSidebar";
import { Metadata } from "next";
import { getProductsByFilter } from "@/app/server_action/products";
import { getCategories } from "@/app/server_action/categories";

export const metadata: Metadata = {
  title: "Shop Page | NextCommerce Nextjs E-commerce template",
  description: "This is Shop Page for NextCommerce Template",
};

interface ShopPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const mapProductToFrontend = (p: any) => ({
  id: p.id,
  title: p.name,
  reviews: 0,
  price: Number(p.price) || 0,
  discountedPrice: Math.max(0, Number(p.price) - Number(p.discount || 0)),
  imgs: {
    thumbnails: p.images?.length 
        ? p.images.map((img: any) => img.media?.url) 
        : ["/images/products/product-1-sm-1.png"],
    previews: p.images?.length 
        ? p.images.map((img: any) => img.media?.url) 
        : ["/images/products/product-1-bg-1.png"],
  }
});

const ShopWithSidebarPage = async ({ searchParams }: ShopPageProps) => {
  const params = await searchParams;
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1;
  const categoryId = typeof params.category === 'string' ? params.category : undefined;
  const search = typeof params.search === 'string' ? params.search : undefined;
  
  const limit = 9;
  const skip = (page - 1) * limit;

  // Fetch initial data concurrently
  const [productsRes, categoriesRes] = await Promise.all([
    getProductsByFilter({ skip, take: limit, categoryId, search, isActive: true }),
    getCategories({ limit: 50 }),
  ]);

  const frontendProducts = productsRes.products.map(mapProductToFrontend);
  
  const frontendCategories = categoriesRes.data.map(c => ({
    id: c.id,
    name: c.name,
    products: c._count?.products || 0,
    isRefined: categoryId === c.id,
  }));

  const pagination = {
    page: productsRes.page,
    total: productsRes.total,
    totalPages: Math.ceil(productsRes.total / limit),
    limit
  };

  return (
    <main>
      <ShopWithSidebar 
        initialProducts={frontendProducts}
        categories={frontendCategories}
        pagination={pagination}
      />
    </main>
  );
};

export default ShopWithSidebarPage;
