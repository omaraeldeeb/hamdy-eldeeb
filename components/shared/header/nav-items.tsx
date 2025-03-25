import { getAllCategoriesFromProducts } from "@/lib/actions/product.actions";
import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const NavItems = async () => {
  const categories = await getAllCategoriesFromProducts();

  return (
    <nav className="hidden lg:flex items-center gap-6">
      {/* Home link */}
      <Link
        href="/"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary"
        )}
      >
        Home
      </Link>

      {/* Shop link */}
      <Link
        href="/search"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary"
        )}
      >
        Shop
      </Link>

      {/* Show top 4 categories */}
      {categories.slice(0, 4).map((cat) => (
        <Link
          key={cat.category}
          href={`/search?category=${cat.category}`}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary"
          )}
        >
          {cat.category}
        </Link>
      ))}

      {/* About link */}
      <Link
        href="/about"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary"
        )}
      >
        About
      </Link>

      {/* Contact link */}
      <Link
        href="/contact"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary"
        )}
      >
        Contact
      </Link>
    </nav>
  );
};

export default NavItems;
