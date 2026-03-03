export type Product = {
  slug: string;
  name: string;
  short_desc: string;
  description: string;
  category: string;
  price_month_eur?: number | null;
};

export type StackProduct = {
  product_slug: string;
  product_name: string;
  product_short_desc: string;
  product_category: string;
  dosage_value?: number | null;
  dosage_unit: string;
  note: string;
};

export type Stack = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  products: StackProduct[];
};