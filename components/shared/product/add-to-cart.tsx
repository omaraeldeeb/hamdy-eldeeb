"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Loader } from "lucide-react";
import { Cart, CartItem } from "@/types";
import { toast } from "sonner";
import {
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
} from "@/lib/actions/cart.actions";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";

interface AddToCartProps {
  cart: Cart | undefined;
  item: CartItem;
}

const AddToCart = ({ cart, item }: AddToCartProps) => {
  const [isPending, startTransition] = useTransition();
  // Track local quantity for input control
  const [inputQuantity, setInputQuantity] = useState<number | string>("");

  const triggerCartUpdate = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    }
  };

  const handleAddToCart = async () => {
    startTransition(async () => {
      const res = await addItemToCart(item);

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      triggerCartUpdate();
      toast.success(res.message);
    });
  };

  const handleIncreaseQuantity = async () => {
    startTransition(async () => {
      // Create a modified item with qty of 1 to just add one
      const singleItem = { ...item, qty: 1 };
      const res = await addItemToCart(singleItem);

      if (res.success) {
        triggerCartUpdate();
      } else {
        toast.error(res.message);
      }
    });
  };

  const handleDecreaseQuantity = async () => {
    startTransition(async () => {
      const res = await removeItemFromCart(item.productId);

      if (res.success) {
        triggerCartUpdate();
      } else {
        toast.error(res.message);
      }
    });
  };

  // Update cart with the manually entered quantity
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // First update local state for controlled input
    const value = e.target.value;
    setInputQuantity(value);
  };

  const handleQuantityBlur = () => {
    // On blur, if the quantity is valid, update the cart
    if (inputQuantity === "" || isNaN(Number(inputQuantity))) {
      // Reset to current quantity if invalid
      setInputQuantity(existItem?.qty || "");
      return;
    }

    const newQty = Number(inputQuantity);
    if (newQty <= 0) {
      setInputQuantity(existItem?.qty || "");
      return;
    }

    // If item exists, update quantity directly using our new function
    if (existItem) {
      startTransition(async () => {
        const res = await updateCartItemQuantity(item.productId, newQty);

        if (res.success) {
          triggerCartUpdate();
          toast.success(res.message);
        } else {
          toast.error(res.message);
          setInputQuantity(existItem.qty);
        }
      });
    }
  };

  // Handle keydown to update on Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur(); // Trigger blur event which calls handleQuantityBlur
    }
  };

  // Check if item is in cart
  const existItem = cart?.items?.find((x) => x.productId === item.productId);

  // On first render or when existItem changes, update input quantity
  useEffect(() => {
    if (existItem) {
      setInputQuantity(existItem.qty);
    }
  }, [existItem]);

  // If item exists in cart, show plus/minus controls with input
  if (existItem) {
    return (
      <div className="flex items-center gap-2 w-full">
        <Button
          onClick={handleDecreaseQuantity}
          variant="outline"
          className="p-2 h-10"
          disabled={isPending}
        >
          {isPending ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Minus className="w-4 h-4" />
          )}
        </Button>

        <Input
          type="number"
          value={inputQuantity}
          onChange={handleQuantityChange}
          onBlur={handleQuantityBlur}
          onKeyDown={handleKeyDown}
          className="w-16 text-center px-1"
          min="1"
          disabled={isPending}
        />

        <Button
          onClick={handleIncreaseQuantity}
          variant="outline"
          className="p-2 h-10"
          disabled={isPending}
        >
          {isPending ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </Button>
      </div>
    );
  }

  // If item doesn't exist in cart, show Add to Cart button
  return (
    <Button
      className="w-full"
      type="button"
      onClick={handleAddToCart}
      disabled={isPending}
    >
      {isPending ? (
        <Loader className="w-4 h-4 animate-spin" />
      ) : (
        <Plus className="w-4 h-4 mr-2" />
      )}
      Add To Cart
    </Button>
  );
};

export default AddToCart;
