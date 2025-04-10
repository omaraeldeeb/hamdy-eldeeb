import ProductCard from "@/components/shared/product/product-card";
import {
  getAllProducts,
  getAllCategoriesFromProducts,
  getAllBrandsFromProducts,
} from "@/lib/actions/product.actions";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import FilterSidebar from "@/components/shared/filters/filter-sidebar";
import SortSelect from "@/components/shared/filters/sort-select";
import MobileFilterDrawer from "@/components/shared/filters/mobile-filter-drawer";
import Pagination from "@/components/shared/pagination";

const prices = [
  {
    name: "$1 to $50",
    value: "1-50",
  },
  {
    name: "$51 to $100",
    value: "51-100",
  },
  {
    name: "$101 to $200",
    value: "101-200",
  },
  {
    name: "$201 to $500",
    value: "201-500",
  },
  {
    name: "$501 to $1000",
    value: "501-1000",
  },
];

const ratings = [4, 3, 2, 1];

const sortOrders = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "lowest" },
  { label: "Price: High to Low", value: "highest" },
  { label: "Customer Rating", value: "rating" },
];

export async function generateMetadata(props: {
  searchParams: Promise<{
    q: string;
    category: string;
    brand: string; // Add brand to metadata
    price: string;
    rating: string;
  }>;
}) {
  const {
    q = "all",
    category = "all",
    brand = "all", // Add brand with default value
    price = "all",
    rating = "all",
  } = await props.searchParams;

  const isQuerySet = q && q !== "all" && q.trim() !== "";
  const isCategorySet =
    category && category !== "all" && category.trim() !== "";
  const isBrandSet = brand && brand !== "all" && brand.trim() !== ""; // Add brand check
  const isPriceSet = price && price !== "all" && price.trim() !== "";
  const isRatingSet = rating && rating !== "all" && rating.trim() !== "";

  if (isQuerySet || isCategorySet || isBrandSet || isPriceSet || isRatingSet) {
    return {
      title: `
      Search ${isQuerySet ? q : ""} 
      ${isCategorySet ? `: Category ${category}` : ""}
      ${isBrandSet ? `: Brand ${brand}` : ""}
      ${isPriceSet ? `: Price ${price}` : ""}
      ${isRatingSet ? `: Rating ${rating}` : ""}`,
    };
  } else {
    return {
      title: "Search Products",
    };
  }
}

export default async function SearchPage(props: {
  searchParams: Promise<{
    query?: string;
    category?: string;
    brand?: string; // Add brand parameter
    price?: string;
    rating?: string;
    page?: string;
    sort?: string;
    limit?: string;
    isLimitedTimeOffer?: string;
    isNewArrival?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const {
    query: q = "all",
    category = "all",
    brand = "all", // Add brand with default value
    price = "all",
    rating = "all",
    sort = "newest",
    page = "1",
  } = searchParams;

  // Parse additional filter parameters
  const isLimitedTimeOffer = searchParams.isLimitedTimeOffer === "true";
  const isNewArrival = searchParams.isNewArrival === "true";

  // Construct filter url - modified to support removing individual filters and brand
  const getFilterUrl = ({
    q: newQ,
    c,
    b, // Add brand parameter
    p,
    s,
    r,
    pg,
  }: {
    q?: string;
    c?: string;
    b?: string; // Add brand type
    p?: string;
    s?: string;
    r?: string;
    pg?: string;
  }) => {
    const params = new URLSearchParams();

    // Helper function to ensure we always have a string
    const ensureString = (value: string | string[] | undefined): string => {
      if (Array.isArray(value)) return value[0];
      return value || "";
    };

    // Handle query parameter
    const queryValue = newQ !== undefined ? newQ : q;
    if (queryValue && queryValue !== "all") {
      params.append("q", ensureString(queryValue));
    }

    // Handle category parameter
    const categoryValue = c !== undefined ? c : category;
    if (categoryValue && categoryValue !== "all") {
      params.append("category", ensureString(categoryValue));
    }

    // Handle brand parameter
    const brandValue = b !== undefined ? b : brand;
    if (brandValue && brandValue !== "all") {
      params.append("brand", ensureString(brandValue));
    }

    // Handle price parameter
    const priceValue = p !== undefined ? p : price;
    if (priceValue && priceValue !== "all") {
      params.append("price", ensureString(priceValue));
    }

    // Handle rating parameter
    const ratingValue = r !== undefined ? r : rating;
    if (ratingValue && ratingValue !== "all") {
      params.append("rating", ensureString(ratingValue));
    }

    // Handle sort parameter
    const sortValue = s !== undefined ? s : sort;
    if (sortValue && sortValue !== "newest") {
      params.append("sort", ensureString(sortValue));
    }

    // Handle page parameter
    const pageValue = pg !== undefined ? pg : page;
    if (pageValue && pageValue !== "1") {
      params.append("page", ensureString(pageValue));
    }

    return `/search?${params.toString() || ""}`;
  };

  // Use correct parameters for the new API with proper string handling
  const products = await getAllProducts({
    query: q && q !== "all" ? q.toString() : "",
    categoryId:
      category && category !== "all" ? category.toString() : undefined,
    // Add brand parameter to API call
    brand: brand && brand !== "all" ? brand.toString() : undefined,
    price: price && price !== "all" ? price.toString() : undefined,
    rating: rating && rating !== "all" ? rating.toString() : undefined,
    sort: sort && sort !== "newest" ? sort.toString() : undefined,
    page: Number(page || "1"),
    isLimitedTimeOffer,
    isNewArrival,
  });

  // Use the correct methods to get categories and brands
  const categories = await getAllCategoriesFromProducts();
  const brands = await getAllBrandsFromProducts(); // Get all brands

  // Count active filters
  const activeFiltersCount = [
    q !== "all" && q !== "",
    category !== "all" && category !== "",
    brand !== "all" && brand !== "", // Add brand to filter count
    price !== "all" && price !== "",
    rating !== "all" && rating !== "",
  ].filter(Boolean).length;

  return (
    <div className="w-full">
      {/* Mobile Filter Drawer - only visible on small screens */}
      <div className="md:hidden mb-4">
        <MobileFilterDrawer
          categories={categories}
          brands={brands} // Pass brands to mobile drawer
          prices={prices}
          ratings={ratings}
          currentCategory={category}
          currentBrand={brand} // Pass current brand
          currentPrice={price}
          currentRating={rating}
          baseUrl="/search"
          query={q}
          sort={sort}
          page={page}
        />
      </div>

      <div className="grid md:grid-cols-5 md:gap-5">
        {/* Desktop Filter sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <FilterSidebar
            categories={categories}
            brands={brands} // Pass brands to sidebar
            prices={prices}
            ratings={ratings}
            currentCategory={category}
            currentBrand={brand} // Pass current brand
            currentPrice={price}
            currentRating={rating}
            baseUrl="/search"
            query={q}
            sort={sort}
            page={page}
          />
        </div>

        {/* Products area */}
        <div className="space-y-4 md:col-span-4">
          {/* Active filters and sort */}
          <div className="bg-card text-card-foreground rounded-lg shadow-sm p-4 border border-border">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Active filters */}
              <div className="flex flex-wrap gap-2 items-center">
                {activeFiltersCount > 0 ? (
                  <>
                    <span className="text-sm text-muted-foreground">
                      Active filters:
                    </span>
                    {q !== "all" && q !== "" && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 dark:bg-secondary dark:text-secondary-foreground"
                      >
                        Search: {q}
                        <Link
                          href={getFilterUrl({ q: "all" })}
                          className="ml-1 hover:text-destructive"
                        >
                          ✕
                        </Link>
                      </Badge>
                    )}
                    {category !== "all" && category !== "" && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        Category: {category}
                        <Link
                          href={getFilterUrl({ c: "all" })}
                          className="ml-1 hover:text-destructive"
                        >
                          ✕
                        </Link>
                      </Badge>
                    )}
                    {brand !== "all" && brand !== "" && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        Brand: {brand}
                        <Link
                          href={getFilterUrl({ b: "all" })}
                          className="ml-1 hover:text-destructive"
                        >
                          ✕
                        </Link>
                      </Badge>
                    )}
                    {price !== "all" && price !== "" && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        Price: {price}
                        <Link
                          href={getFilterUrl({ p: "all" })}
                          className="ml-1 hover:text-destructive"
                        >
                          ✕
                        </Link>
                      </Badge>
                    )}
                    {rating !== "all" && rating !== "" && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        Rating: {rating}+ stars
                        <Link
                          href={getFilterUrl({ r: "all" })}
                          className="ml-1 hover:text-destructive"
                        >
                          ✕
                        </Link>
                      </Badge>
                    )}
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No filters applied
                  </span>
                )}
              </div>

              {/* Sort dropdown - now a client component */}
              <SortSelect
                sortOrders={sortOrders}
                currentSort={sort}
                baseUrl="/search"
                query={q}
                category={category}
                brand={brand} // Add brand to sort select
                price={price}
                rating={rating}
                page={page}
              />
            </div>
          </div>

          {/* Products grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {products.data.length === 0 ? (
              <div className="col-span-full py-12 text-center">
                <div className="text-xl font-medium">No products found</div>
                <p className="text-muted-foreground mt-2">
                  Try changing your filters or search
                </p>
              </div>
            ) : (
              products.data.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    ...product,
                    discount: product.discount
                      ? Number(product.discount)
                      : null,
                    // Convert rating from string to number
                    rating: Number(product.rating),
                  }}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {products.totalPages > 1 && (
            <Pagination
              page={Number(page)}
              totalPages={products.totalPages}
              urlParamName="page"
            />
          )}
        </div>
      </div>
    </div>
  );
}
