import DealCountdown from "@/components/deal-countdown";
import HeroSection from "@/components/hero-section";
import IconBoxes from "@/components/icon-boxes";
import ProductCarousel from "@/components/shared/product/product-carousel";
import ProductList from "@/components/shared/product/product-list";
import ViewAllProductsButton from "@/components/view-all-products-button";
import { getActiveDeals } from "@/lib/actions/deal-actions";
import {
  getFeaturedProducts,
  getNewArrivalProducts,
  getLimitedTimeOfferProducts,
} from "@/lib/actions/product.actions";

export default async function Home() {
  // Fetch products with proper typing
  const featuredProducts = await getFeaturedProducts();
  const newArrivalProducts = await getNewArrivalProducts();
  const limitedTimeOfferProducts = await getLimitedTimeOfferProducts();

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
      {newArrivalProducts.length > 0 && (
        <ProductList
          data={newArrivalProducts}
          title="New Arrivals"
          limit={12}
          carousel={true}
        />
      )}
      {limitedTimeOfferProducts.length > 0 && (
        <ProductList
          data={limitedTimeOfferProducts}
          title="Limited Time Offers"
          limit={12}
          carousel={true}
        />
      )}
      <ViewAllProductsButton />
      <IconBoxes />
    </>
  );
}
