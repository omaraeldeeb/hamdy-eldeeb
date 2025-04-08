"use client";
import { Cart, CartItem } from "@/types";
import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import {
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  deleteItemFromCart,
} from "@/lib/actions/cart.actions";
import { ArrowRight, Loader, Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const CartTable = ({ cart }: { cart?: Cart }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [quantities, setQuantities] = useState<Record<string, number | string>>(
    {}
  );

  // Initialize quantities from cart items
  useEffect(() => {
    if (cart?.items) {
      const initialQuantities: Record<string, number> = {};
      cart.items.forEach((item) => {
        initialQuantities[item.productId] = item.qty;
      });
      setQuantities(initialQuantities);
    }
  }, [cart]);

  const triggerCartUpdate = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    }
  };

  // Create a new increaseQuantity function that adds just one item
  const increaseQuantity = (item: CartItem) => {
    startTransition(async () => {
      // Create a modified item with qty of 1 to just add one
      const singleItem = { ...item, qty: 1 };
      const res = await addItemToCart(singleItem);
      if (res.success) {
        triggerCartUpdate();
        setQuantities((prev) => ({
          ...prev,
          [item.productId]:
            typeof prev[item.productId] === "number"
              ? (prev[item.productId] as number) + 1
              : item.qty + 1,
        }));
      } else {
        toast.error(res.message);
      }
    });
  };

  const decreaseQuantity = (item: CartItem) => {
    startTransition(async () => {
      const res = await removeItemFromCart(item.productId);
      if (res.success) {
        triggerCartUpdate();
        setQuantities((prev) => ({
          ...prev,
          [item.productId]:
            typeof prev[item.productId] === "number" &&
            (prev[item.productId] as number) > 1
              ? (prev[item.productId] as number) - 1
              : 1,
        }));
      } else {
        toast.error(res.message);
      }
    });
  };

  const handleQuantityChange = (productId: string, value: string) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: value,
    }));
  };

  const handleQuantityBlur = (item: CartItem) => {
    const newQtyValue = quantities[item.productId];
    const newQty = Number(newQtyValue);

    if (isNaN(newQty) || newQty <= 0) {
      // Reset to current quantity
      setQuantities((prev) => ({
        ...prev,
        [item.productId]: item.qty,
      }));
      return;
    }

    // No change needed
    if (newQty === item.qty) return;

    startTransition(async () => {
      const res = await updateCartItemQuantity(item.productId, newQty);

      if (res.success) {
        triggerCartUpdate();
        toast.success(res.message);
      } else {
        toast.error(res.message);
        setQuantities((prev) => ({
          ...prev,
          [item.productId]: item.qty,
        }));
      }
    });
  };

  const handleDeleteItem = (item: CartItem) => {
    startTransition(async () => {
      const res = await deleteItemFromCart(item.productId);
      if (res.success) {
        triggerCartUpdate();
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur(); // Trigger blur event which calls handleQuantityBlur
    }
  };

  return (
    <>
      <h1 className="py-4 h2-bold">Shopping Cart</h1>
      {!cart || cart.items.length === 0 ? (
        <div>
          Cart is empty. <Link href="/">Go Shopping</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-4 md:gap-5">
          <div className="overflow-x-auto md:col-span-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.items.map((item) => (
                  <TableRow key={item.slug}>
                    <TableCell>
                      <Link
                        href={`/product/${item.slug}`}
                        className="flex items-center"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={50}
                          height={50}
                        />
                        <span className="px-2">{item.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="flex items-center justify-center gap-2">
                      <Button
                        disabled={isPending}
                        variant="outline"
                        type="button"
                        onClick={() => decreaseQuantity(item)}
                      >
                        {isPending ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Minus className="w-4 h-4" />
                        )}
                      </Button>

                      <Input
                        type="number"
                        value={quantities[item.productId] || item.qty}
                        onChange={(e) =>
                          handleQuantityChange(item.productId, e.target.value)
                        }
                        onBlur={() => handleQuantityBlur(item)}
                        onKeyDown={handleKeyDown}
                        className="w-16 text-center px-1"
                        min="1"
                        disabled={isPending}
                      />

                      <Button
                        disabled={isPending}
                        variant="outline"
                        type="button"
                        onClick={() => increaseQuantity(item)}
                      >
                        {isPending ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">${item.price}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        disabled={isPending}
                        variant="destructive"
                        size="sm"
                        type="button"
                        onClick={() => handleDeleteItem(item)}
                      >
                        {isPending ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Card>
            <CardContent className="p-4 gap-4">
              <div className="pb-3 text-xl">
                Subtotal ({cart.items.reduce((acc, item) => acc + item.qty, 0)}
                ):
                <span className="font-bold">
                  {formatCurrency(cart.itemsPrice)}
                </span>
              </div>
              <Button
                className="w-full"
                disabled={isPending}
                onClick={() =>
                  startTransition(() => router.push("/shipping-address"))
                }
              >
                {isPending ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 mr-2" />
                )}
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default CartTable;
