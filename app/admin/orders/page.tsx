import { auth } from "@/auth";
import { deleteOrder, getAllOrders } from "@/lib/actions/order.actions";
import { Metadata } from "next";
import { requireAdmin } from "@/lib/auth-guard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import Pagination from "@/components/shared/pagination";
import { formatCurrency, formatDateTime, formatId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import DeleteDialog from "@/components/shared/delete-dialog";

export const metadata: Metadata = {
  title: "Admin Orders",
};

const AdminOrdersPage = async (props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParams = await props.searchParams;
  await requireAdmin();

  // Use destructuring pattern for consistency
  const { page: pageParam, query: queryParam } = searchParams;

  const page = typeof pageParam === "string" ? Number(pageParam) : 1;
  const query = typeof queryParam === "string" ? queryParam : "";

  const session = await auth();

  if (session?.user?.role !== "admin") throw new Error("Unauthorized");

  const orders = await getAllOrders({
    page: Number(page),
    limit: 10,
    query,
  });

  return (
    <div className="space-y-2 ">
      <div className="flex items-center gap-3">
        <h1 className="h2-bold">Orders</h1>
        {query && (
          <div>
            Filltered by <i>&quot;{query}&quot;</i>{" "}
            <Link href="/admin/orders">
              <Button variant="outline" size="sm" className="ml-2">
                Remove Filter
              </Button>
            </Link>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>DATE</TableHead>
              <TableHead>BUYER</TableHead>
              <TableHead>TOTAL</TableHead>
              <TableHead>PAID</TableHead>
              <TableHead>DELIVERED</TableHead>
              <TableHead>ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.data.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{formatId(order.id)}</TableCell>
                <TableCell>
                  {formatDateTime(order.createdAt).dateTime}
                </TableCell>
                <TableCell>{order.user.name}</TableCell>
                <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                <TableCell>
                  {order.isPaid && order.paidAt
                    ? formatDateTime(order.paidAt).dateTime
                    : "Not Paid"}
                </TableCell>
                <TableCell>
                  {order.isDelivered && order.deliveredAt
                    ? formatDateTime(order.deliveredAt).dateTime
                    : "Not Delivered"}
                </TableCell>
                <TableCell>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/order/${order.id}`}>Details</Link>
                  </Button>
                  <DeleteDialog id={order.id} action={deleteOrder} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {orders.totalPages > 1 && (
          <Pagination
            page={Number(page) || 1}
            totalPages={orders?.totalPages}
          />
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;
