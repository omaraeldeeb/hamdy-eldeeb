import DealCountdown from "@/components/deal-countdown";
import HeroSection from "@/components/hero-section";
import IconBoxes from "@/components/icon-boxes";
import ProductCarousel from "@/components/shared/product/product-carousel";
import ProductList from "@/components/shared/product/product-list";
import ViewAllProductsButton from "@/components/view-all-products-button";
import { getActiveDeals } from "@/lib/actions/deal-actions";
import {
  getFeaturedProducts,
  getLatestProducts,
} from "@/lib/actions/product.actions";

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();
  const latestProducts = await getLatestProducts();

  // Fetch active deals for the homepage
  const { deals: activeDeals } = await getActiveDeals();
  const activeDeal =
    activeDeals && activeDeals.length > 0 ? activeDeals[0] : undefined;

  return (
    <>
      <HeroSection />
      <DealCountdown deal={activeDeal} />
      {featuredProducts.length > 0 && (
        <ProductCarousel data={featuredProducts} />
      )}
      <ProductList data={latestProducts} title="Newest Arrivals" limit={4} />
      <ViewAllProductsButton />
      <IconBoxes />
    </>
  );
}
