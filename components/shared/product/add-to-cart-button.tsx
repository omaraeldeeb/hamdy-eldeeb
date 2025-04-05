"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartItem } from "@/types";
import { addItemToCart } from "@/lib/actions/cart.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AddToCartButtonProps {
  productId: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  stock: number;
}

export default function AddToCartButton({
  productId,
  name,
  price,
  image,
  slug,
  stock,
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAddToCart = async () => {
    if (stock <= 0) return;

    setIsLoading(true);
    try {
      // Create cart item object using the format expected by cart.actions
      // Convert price to string if the CartItem type expects a string
      const cartItem: CartItem = {
        productId,
        name,
        price: String(price), // Convert to string if CartItem.price is a string
        image,
        slug,
        qty: quantity,
      };

      // Call server action to add item to cart
      const result = await addItemToCart(cartItem);

      if (result.success) {
        toast.success(result.message || `Added ${quantity} of ${name} to cart`);

        // Refresh the page to reflect cart changes
        router.refresh();
      } else {
        toast.error(result.message || "Failed to add item to cart");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error("Error adding to cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= stock) {
      setQuantity(value);
    }
  };

  const increaseQuantity = () => {
    if (quantity < stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div>
      <div className="flex items-center mb-4">
        <button
          onClick={decreaseQuantity}
          className="px-3 py-1 border border-gray-300 rounded-l-md bg-gray-100 hover:bg-gray-200"
          disabled={quantity <= 1 || isLoading}
          type="button"
        >
          -
        </button>
        <Input
          type="number"
          min="1"
          max={stock}
          value={quantity}
          onChange={handleQuantityChange}
          className="w-16 text-center rounded-none border-y border-gray-300"
          disabled={isLoading}
        />
        <button
          onClick={increaseQuantity}
          className="px-3 py-1 border border-gray-300 rounded-r-md bg-gray-100 hover:bg-gray-200"
          disabled={quantity >= stock || isLoading}
          type="button"
        >
          +
        </button>
      </div>
      <Button
        onClick={handleAddToCart}
        className="w-full bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded"
        disabled={stock === 0 || isLoading}
      >
        {isLoading ? "Adding..." : stock > 0 ? "Add to Cart" : "Out of Stock"}
      </Button>
    </div>
  );
}
