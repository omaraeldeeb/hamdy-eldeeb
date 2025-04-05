import { formatCurrency } from "@/lib/utils";

export interface ProductPriceProps {
  value: number;
  discounted?: boolean;
}

const ProductPrice = ({ value, discounted = false }: ProductPriceProps) => {
  return (
    <div className={`font-semibold ${discounted ? "text-red-600" : ""}`}>
      {formatCurrency(value)}
    </div>
  );
};

export default ProductPrice;
