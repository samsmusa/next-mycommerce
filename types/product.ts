export type Product = {
  id: string;
  title: string;
  reviews: number;
  price: number;
  discountedPrice: number;
  description?: string;
  category?: string;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};
