export interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  category: string;
  category_id: number; // Assuming a foreign key to categories table
  rating?: number;
  review_count?: number;
  description?: string;
}

export interface Category {
  id: number;
  name: string;
  icon?: string; // Optional icon for the category
  color?: string; // Optional color for the category
}
