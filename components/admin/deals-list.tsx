"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Deal } from "@/types";
import { format } from "date-fns";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteDeal, endDeal } from "@/lib/actions/deal-actions";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Pencil, Trash, XCircle } from "lucide-react"; // Remove unused CheckCircle2
import { Badge } from "../ui/badge";

interface DealsListProps {
  deals: Deal[];
}

export default function DealsList({ deals }: DealsListProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isEnding, setIsEnding] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const result = await deleteDeal(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Deal deleted successfully");
        router.refresh();
      }
    } catch {
      toast.error("Failed to delete deal");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEndDeal = async (id: string) => {
    setIsEnding(id);
    try {
      const result = await endDeal(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Deal ended successfully");
        router.refresh();
      }
    } catch {
      toast.error("Failed to end deal");
    } finally {
      setIsEnding(null);
    }
  };

  const getDealStatus = (deal: Deal) => {
    const now = new Date();
    const start = new Date(deal.startDate);
    const end = new Date(deal.targetDate);

    if (!deal.isActive) {
      return "inactive";
    } else if (now < start) {
      return "scheduled";
    } else if (now > end) {
      return "expired";
    } else {
      return "active";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deals</CardTitle>
        <CardDescription>
          Manage promotional deals and countdowns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Button asChild>
            <Link href="/admin/deals/create">Create New Deal</Link>
          </Button>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No deals found
                  </TableCell>
                </TableRow>
              ) : (
                deals.map((deal) => {
                  const status = getDealStatus(deal);
                  return (
                    <TableRow key={deal.id}>
                      <TableCell className="font-medium">
                        {deal.titleEn}
                      </TableCell>
                      <TableCell>
                        {format(new Date(deal.startDate), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {format(new Date(deal.targetDate), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            status === "active"
                              ? "default"
                              : status === "scheduled"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/deals/${deal.id}`}>
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </Button>

                        {status === "active" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isEnding === deal.id}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                End
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>End Deal</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to end this deal? It
                                  will no longer be visible to users.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleEndDeal(deal.id)}
                                >
                                  End Deal
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={isDeleting === deal.id}
                            >
                              <Trash className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Deal</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this deal? This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(deal.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
