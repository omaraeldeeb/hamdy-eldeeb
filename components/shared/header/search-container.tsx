import { getAllCategoriesFromProducts } from "@/lib/actions/product.actions";
import Search from "./search";

export default async function SearchContainer() {
  // Fetch categories on the server
  const categories = await getAllCategoriesFromProducts();

  // Pass them to the client component
  return <Search categories={categories} />;
}
