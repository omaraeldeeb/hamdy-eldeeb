import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getProductBySlug } from "@/lib/actions/product.actions";
import { notFound } from "next/navigation";
import ProductPrice from "@/components/shared/product/product-price";
import ProductImages from "@/components/shared/product/product-images";
import AddToCart from "@/components/shared/product/add-to-cart";
import { getMyCart } from "@/lib/actions/cart.actions";
import { auth } from "@/auth";
import ReviewList from "./review-list";
import Rating from "@/components/shared/product/rating";
import { formatCurrency } from "@/lib/utils";

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  // Calculate discounted price if a discount exists
  const hasDiscount = product.discount && Number(product.discount) > 0;
  const discountedPrice = hasDiscount
    ? Number(product.price) * (1 - Number(product.discount) / 100)
    : null;

  const session = await auth();
  const userId = session?.user?.id;

  const cart = await getMyCart();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Product images */}
        <ProductImages images={product.images} />

        {/* Product details */}
        <div className="space-y-4">
          {/* Product name in English and Arabic */}
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            {product.nameAr && (
              <p className="text-xl text-right" dir="rtl">
                {product.nameAr}
              </p>
            )}
          </div>

          {/* Category and brand info */}
          <div className="flex flex-wrap gap-2">
            {product.category && (
              <Badge variant="outline" className="text-sm">
                Category: {product.category.name}
              </Badge>
            )}
            {product.brand && (
              <Badge variant="outline" className="text-sm">
                Brand: {product.brand.name}
              </Badge>
            )}
          </div>

          {/* Rating display */}
          <div className="flex items-center gap-2">
            <Rating value={Number(product.rating)} />
            <span className="text-sm text-gray-500">
              ({product.numReviews} reviews)
            </span>
          </div>

          {/* Price display with discount */}
          <div className="text-xl font-semibold">
            {hasDiscount ? (
              <div className="flex items-center gap-2">
                <span className="text-red-600">
                  {formatCurrency(discountedPrice!)}
                </span>
                <span className="text-gray-500 line-through text-sm">
                  {formatCurrency(Number(product.price))}
                </span>
                <Badge className="bg-green-500">
                  {Number(product.discount)}% OFF
                </Badge>
              </div>
            ) : (
              <span>{formatCurrency(Number(product.price))}</span>
            )}
          </div>

          {/* Special tags */}
          <div className="flex flex-wrap gap-2">
            {product.isNewArrival && (
              <Badge className="bg-blue-500">New Arrival</Badge>
            )}
            {product.isLimitedTimeOffer && (
              <Badge className="bg-red-500">Limited Time Offer</Badge>
            )}
          </div>

          {/* Description in English and Arabic */}
          <div>
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="mt-2">{product.description}</p>
            {product.descriptionAr && (
              <div className="mt-4">
                <h2 className="text-lg font-semibold text-right">الوصف</h2>
                <p className="mt-2 text-right" dir="rtl">
                  {product.descriptionAr}
                </p>
              </div>
            )}
          </div>

          {/* Add to cart section */}
          <div>
            <Card>
              <CardContent className="p-4 ">
                <div className="mb-2 flex justify-between">
                  <div>Price</div>
                  <div>
                    <ProductPrice value={Number(product.price)} />
                  </div>
                </div>
                <div className="mb-2 flex justify-between">
                  <div>Status</div>
                  {product.stock > 0 ? (
                    <Badge variant="outline">In Stock</Badge>
                  ) : (
                    <Badge variant="destructive">Out of Stock</Badge>
                  )}
                </div>
                {product.stock > 0 && (
                  <div className="flex-center">
                    <AddToCart
                      cart={cart}
                      item={{
                        productId: product.id,
                        name: product.name,
                        slug: product.slug,
                        price: product.price,
                        qty: 1,
                        image: product.images[0]?.url || "",
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="h2-bold">Customer Reviews</h2>
        <ReviewList
          userId={userId || ""}
          productId={product.id}
          productSlug={product.slug}
        />
      </section>
    </div>
  );
}
