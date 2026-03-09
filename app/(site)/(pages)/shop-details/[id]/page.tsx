import React from "react";
import ShopDetails from "@/components/ShopDetails";
import { Metadata } from "next";
import { getProduct } from "@/app/server_action/products";
import { notFound } from "next/navigation";
import { Product as FrontendProduct } from "@/types/product";

export const metadata: Metadata = {
  title: "Shop Details Page | NextCommerce Nextjs E-commerce template",
  description: "This is Shop Details Page for NextCommerce Template",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

const mapProductToFrontend = (p: any): FrontendProduct => ({
  id: p.id,
  title: p.name,
  reviews: 0,
  price: Number(p.price) || 0,
  discountedPrice: Math.max(0, Number(p.price) - Number(p.discount || 0)),
  description: p.description || "",
  category: p.category?.name || "Uncategorized",
  imgs: {
    thumbnails: p.images?.length 
        ? p.images.map((img: any) => img.media?.url) 
        : ["/images/products/product-1-sm-1.png"],
    previews: p.images?.length 
        ? p.images.map((img: any) => img.media?.url) 
        : ["/images/products/product-1-bg-1.png"],
  }
});

const ShopDetailsPage = async ({ params }: PageProps) => {
  const { id } = await params;
  let rawProduct = null;

  try {
    rawProduct = await getProduct(id);
  } catch (error) {
    return notFound();
  }

  if (!rawProduct) {
    return notFound();
  }

  const frontendProduct = mapProductToFrontend(rawProduct);

  return (
    <main>
      <ShopDetails product={frontendProduct} />
    </main>
  );
};

export default ShopDetailsPage;
