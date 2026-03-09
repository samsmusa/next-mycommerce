import React from "react";
import Hero from "./Hero";
import Categories from "./Categories";
import NewArrival from "./NewArrivals";
import PromoBanner from "./PromoBanner";
import BestSeller from "./BestSeller";
import CounDown from "./Countdown";
import Testimonials from "./Testimonials";
import Newsletter from "../Common/Newsletter";

import { getCategories } from "@/app/server_action/categories";
import { getProducts, getBestSellingProducts } from "@/app/server_action/products";
import { Product as FrontendProduct } from "@/types/product";
import { Category as FrontendCategory } from "@/types/category";

const mapProductToFrontend = (p: any): FrontendProduct => ({
  id: p.id,
  title: p.name,
  reviews: 0, // Mock reviews since schema doesn't have it directly attached yet
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

const mapCategoryToFrontend = (c: any): FrontendCategory => ({
  id: c.id,
  title: c.name,
  img: c.image || "/images/categories/categories-01.png", // Use mock images if not present
});

const Home = async () => {
  // Fetch initial data concurrently
  const [categoriesRes, newArrivalsRes, bestSellersRes] = await Promise.all([
    getCategories({ limit: 8 }),
    getProducts({ limit: 4 }), // New arrivals (getProducts orders by createdAt desc)
    getBestSellingProducts({ limit: 6 }), // Best sellers
  ]);

  const categories = categoriesRes.data.map(mapCategoryToFrontend);
  const newArrivals = newArrivalsRes.data.map(mapProductToFrontend);
  const bestSellers = bestSellersRes.data.map(mapProductToFrontend);

  return (
    <main>
      <Hero />
      <Categories categories={categories} />
      <NewArrival products={newArrivals} />
      <PromoBanner />
      <BestSeller products={bestSellers} />
      <CounDown />
      <Testimonials />
      <Newsletter />
    </main>
  );
};

export default Home;
