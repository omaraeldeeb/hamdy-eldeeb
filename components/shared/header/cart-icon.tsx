"use client";

import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { getMyCart } from "@/lib/actions/cart.actions";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const CartIcon = () => {
  const [itemCount, setItemCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchCartData = async () => {
    try {
      setIsLoading(true);
      const cart = await getMyCart();

      // More strict check for empty cart
      if (cart?.items && Array.isArray(cart.items) && cart.items.length > 0) {
        const totalItems = cart.items.reduce(
          (sum, item) => sum + (item.qty || 0),
          0
        );
        setItemCount(totalItems);
      } else {
        setItemCount(0);
      }
    } catch (error) {
      console.error("Error fetching cart data:", error);
      setItemCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCartData();

    const handleCartUpdate = () => {
      fetchCartData();
      router.refresh(); // Force router refresh on cart updates
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, [router]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <ShoppingCart size={26} strokeWidth={2} className="text-foreground" />

      {!isLoading && itemCount > 0 && (
        <span
          className={cn(
            "absolute -top-2 -right-2",
            "flex items-center justify-center",
            "min-w-[16px] h-[16px]",
            "text-[9px] font-bold",
            "bg-red-500 text-white",
            "rounded-full px-[2px]",
            "border border-background",
            "leading-none"
          )}
          aria-label={`${itemCount} items in cart`}
        >
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </div>
  );
};

export default CartIcon;
