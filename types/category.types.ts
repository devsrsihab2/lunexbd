export type Category = {
  id: number;
  slug: string;
  name: string;
  description?: string;
  image?: { src: string; alt?: string };
  count?: number;
  seo?: {
    title?: string;
    description?: string;
    image?: string;
  };
};
