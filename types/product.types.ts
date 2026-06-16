export type ProductImage = {
  id?: number;
  src: string;
  thumbnail?: string;
  alt?: string;
};

export type ProductAttribute = {
  name: string;
  options: string[];
  variation?: boolean;
};

export type ProductSwatchType =
  | "select"
  | "color"
  | "image"
  | "button"
  | "radio";

export type ProductSwatchTerm = {
  id?: number | null;
  name: string;
  slug: string;
  type: ProductSwatchType;
  color?: string;
  image?: string;
  taxonomy?: string;
  attribute?: string;
};

export type ProductSwatchAttribute = {
  name: string;
  slug: string;
  taxonomy?: string;
  type: ProductSwatchType;
  terms: ProductSwatchTerm[];
};

export type ProductVariation = {
  id: number;
  price: string;
  regularPrice?: string;
  salePrice?: string;
  stockStatus: string;
  attributes: Record<string, string>;
  image?: ProductImage;
};

export type ProductFilterOption = {
  id?: number | string;
  name: string;
  slug: string;
  count?: number;
};
export type Product = {
  id: number;
  slug: string;
  name: string;
  type: "simple" | "variable" | string;
  price: string;
  regularPrice?: string;
  salePrice?: string;
  shortDescription?: string;
  description?: string;
  sku?: string;
  stockStatus?: string;
  averageRating?: string;
  reviewCount?: number;
  images: ProductImage[];
  categories?: { id: number; name: string; slug: string }[];
  attributes?: ProductAttribute[];
  variations?: ProductVariation[];

  /**
   * Headless Woo Variation Swatches data.
   * Comes from:
   * /wp-json/lunex/v1/products/{id}/swatches
   */
  swatches?: ProductSwatchAttribute[];
};

export type ProductReview = {
  id: number;
  productId: number;
  reviewer: string;
  reviewerEmail?: string;
  review: string;
  rating: number;
  verified: boolean;
  dateCreated?: string;
};

export type ProductQuery = {
  page?: string;
  search?: string;
  category?: string;
  brand?: string;
  sort?: string;
  min_price?: string;
  max_price?: string;
  stock_status?: string;
  rating?: string;
  [key: string]: string | undefined;
};
