"use client";
import { Review } from "@/types";
import Link from "next/link";
import { useState, useEffect } from "react";
import ReviewForm from "./review-form";
import { getReviews } from "@/lib/actions/review.actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarIcon, UserIcon } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import Rating from "@/components/shared/product/rating";

const ReviewList = ({
  userId,
  productId,
  productSlug,
}: {
  userId: string;
  productId: string;
  productSlug: string;
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const loadReviews = async () => {
      const res = await getReviews({ productId });
      setReviews(res.data);
    };
    loadReviews();
  }, [productId]);

  // Reload reviews after submitting a new review or updating an existing one
  const reload = async () => {
    const res = await getReviews({ productId });
    setReviews([...res.data]);
  };

  return (
    <div className="space-y-4">
      {reviews.length === 0 && <div>No reviews yet.</div>}
      {userId ? (
        <>
          <ReviewForm
            userId={userId}
            productId={productId}
            onReviewSubmitted={reload}
          />
        </>
      ) : (
        <div>
          Please{" "}
          <Link
            className="text-blue-700 px-2"
            href={`/sign-in?callbackUrl=/product/${productSlug}`}
          >
            sign in
          </Link>
          to write a review.
        </div>
      )}
      <div className="flex flex-col gap-3">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardHeader>
              <div className="flex-between">
                <CardTitle>{review.title}</CardTitle>
              </div>
              <CardDescription>{review.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 tex-sm text-muted-foreground">
                <Rating value={review.rating} />
                <div className="flex items-center">
                  <UserIcon className="mr-1 h-4 w-4" />
                  {review.user ? review.user.name : "User"}
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="mr-1 h-4 w-4" />
                  {formatDateTime(review.createdAt).dateTime}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
