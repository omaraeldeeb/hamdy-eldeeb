import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { getAllCategoriesFromProducts } from "@/lib/actions/product.actions";
import { ChevronRight, MenuIcon } from "lucide-react";
import Link from "next/link";

const CategoryDrawer = async () => {
  // Get hierarchical categories using the updated getAllCategoriesFromProducts function
  const categories = await getAllCategoriesFromProducts();

  return (
    <Drawer direction="left">
      <DrawerTrigger asChild>
        <Button variant="outline">
          <MenuIcon />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full max-w-sm">
        <DrawerHeader>
          <DrawerTitle>Select a category</DrawerTitle>
          <div className="space-y-1 mt-4">
            {categories.map((parentCategory) => (
              <div key={parentCategory.id} className="mb-2">
                {/* Parent category - Use category name, not ID */}
                <Button
                  variant="ghost"
                  className="w-full justify-start font-medium"
                  asChild
                >
                  <DrawerClose asChild>
                    <Link
                      href={`/search?category=${encodeURIComponent(parentCategory.category)}`}
                    >
                      {parentCategory.category} ({parentCategory._count})
                    </Link>
                  </DrawerClose>
                </Button>

                {/* Child categories */}
                {parentCategory.children &&
                  parentCategory.children.length > 0 && (
                    <div className="pl-4 border-l border-border ml-3 mt-1 space-y-1">
                      {parentCategory.children.map((childCategory) => (
                        <Button
                          key={childCategory.id}
                          variant="ghost"
                          className="w-full justify-start text-sm"
                          asChild
                        >
                          <DrawerClose asChild>
                            <Link
                              href={`/search?category=${encodeURIComponent(childCategory.category)}`}
                            >
                              <ChevronRight className="h-3 w-3 mr-1 inline" />
                              {childCategory.category} ({childCategory._count})
                            </Link>
                          </DrawerClose>
                        </Button>
                      ))}
                    </div>
                  )}
              </div>
            ))}
          </div>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
};

export default CategoryDrawer;
