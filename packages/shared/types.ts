export type Product = {
  slug: string;
  name: string;
  short_desc: string;
  description: string;
  category: string;
  price_month_eur?: number | null;
};

export type Stack = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
};