"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";
import { useEffect, useState, useRef, useMemo } from "react";
import { Deal } from "@/types";
import { Clock, ShoppingBag, Timer } from "lucide-react";

// Function to calculate the time remaining
const calculateTimeRemaining = (targetDate: Date) => {
  const currentTime = new Date();
  const timeDifference = Math.max(Number(targetDate) - Number(currentTime), 0);
  return {
    days: Math.floor(timeDifference / (1000 * 60 * 60 * 24)),
    hours: Math.floor(
      (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    ),
    minutes: Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((timeDifference % (1000 * 60)) / 1000),
  };
};

interface DealCountdownProps {
  deal?: Deal;
  buttonLink?: string;
}

// Separated component for showing the countdown when we have a deal
function ActiveDealCountdown({
  deal,
  buttonLink = "/search",
}: {
  deal: Deal;
  buttonLink?: string;
}) {
  const [time, setTime] = useState<ReturnType<typeof calculateTimeRemaining>>();
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize the date objects to prevent re-renders
  const dates = useMemo(() => {
    return {
      targetDate: new Date(deal.targetDate),
      startDate: new Date(deal.startDate),
    };
  }, [deal.targetDate, deal.startDate]);

  // Use the memoized values
  const title = deal.titleEn;
  const description = deal.descriptionEn;
  const imageUrl = deal.imageUrl;

  useEffect(() => {
    // Cleanup previous interval if it exists
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Check if the deal is active based on start date and target date
    const now = new Date();
    const isWithinTimeframe = now >= dates.startDate && now <= dates.targetDate;
    setIsActive(deal.isActive && isWithinTimeframe);

    setTime(calculateTimeRemaining(dates.targetDate));

    intervalRef.current = setInterval(() => {
      const newTime = calculateTimeRemaining(dates.targetDate);
      setTime(newTime);

      if (
        newTime.days === 0 &&
        newTime.hours === 0 &&
        newTime.minutes === 0 &&
        newTime.seconds === 0
      ) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setIsActive(false);
      }
    }, 1000);

    // Cleanup function for the useEffect
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [deal.isActive, dates]); // Using the memoized dates object

  // Don't show the countdown if it's not active
  if (!isActive) {
    return null;
  }

  if (!time) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-2 my-20">
        <div className="flex flex-col gap-2 justify-center">
          <h3 className="text-3xl font-bold">Loading Countdown...</h3>
        </div>
      </section>
    );
  }

  if (
    time.days === 0 &&
    time.hours === 0 &&
    time.minutes === 0 &&
    time.seconds === 0
  ) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-2 my-20">
        <div className="flex flex-col gap-2 justify-center">
          <h3 className="text-3xl font-bold">Deal Has Ended</h3>
          <p>
            This deal is no longer available. Check out our latest promotions!
          </p>

          <div className="text-center">
            <Button asChild>
              <Link href={buttonLink}>View Products</Link>
            </Button>
          </div>
        </div>
        <div className="flex justify-center">
          <Image src={imageUrl} alt="promotion" width={300} height={200} />
        </div>
      </section>
    );
  }

  // Enhanced design for active deals
  return (
    <section className="my-20 overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-blue-900 shadow-lg">
      <div className="container mx-auto py-10 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col gap-6 text-center md:text-left order-2 md:order-1">
            <div className="inline-flex items-center px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-medium mb-2 max-w-max mx-auto md:mx-0">
              <Timer className="h-4 w-4 mr-2" />
              Limited Time Offer
            </div>

            <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-5xl">
              {title}
              <span className="block mt-1 text-blue-600 dark:text-blue-400">
                Special Deal
              </span>
            </h2>

            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-xl">
              {description}
            </p>

            <div className="mt-2">
              <div className="flex justify-center md:justify-start">
                <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-6 max-w-md">
                  <TimeBlock label="Days" value={time?.days || 0} />
                  <TimeBlock label="Hours" value={time?.hours || 0} />
                  <TimeBlock label="Minutes" value={time?.minutes || 0} />
                  <TimeBlock label="Seconds" value={time?.seconds || 0} />
                </div>
              </div>

              <Button
                asChild
                size="lg"
                className="relative overflow-hidden group bg-blue-600 hover:bg-blue-700 transition-all duration-300 px-8 py-6 text-lg font-medium"
              >
                <Link href={buttonLink}>
                  <span className="relative z-10 flex items-center">
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Shop Now
                    <span className="absolute -right-12 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:-right-6 transition-all duration-300">
                      →
                    </span>
                  </span>
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative md:h-96 order-1 md:order-2">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-xl" />
            <div className="relative h-64 md:h-80 w-full overflow-hidden rounded-xl">
              <div className="absolute top-4 right-4 z-10 bg-white/90 dark:bg-gray-800/90 rounded-full p-3 shadow-lg">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>

              <div className="absolute -right-6 -top-6 w-24 h-24 bg-yellow-400 dark:bg-yellow-500 rounded-full flex items-center justify-center rotate-12 z-10 shadow-lg">
                <div className="text-center rotate-[-12deg]">
                  <p className="font-bold text-sm leading-none">Limited</p>
                  <p className="font-bold text-sm leading-none mt-1">Offer!</p>
                </div>
              </div>

              <Image
                src={imageUrl}
                alt={title || "promotion"}
                fill
                className="object-cover transform transition-transform duration-700 hover:scale-105"
                sizes="(max-width: 768px) 100vw, 600px"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Styled time block component for the countdown
const TimeBlock = ({ label, value }: { label: string; value: number }) => (
  <div className="flex flex-col items-center">
    <div className="relative w-full aspect-square">
      <div className="absolute inset-0 bg-blue-600 dark:bg-blue-700 rounded-lg shadow-inner opacity-10"></div>
      <div className="absolute inset-0.5 bg-white dark:bg-gray-800 rounded-md flex items-center justify-center">
        <span className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400">
          {value.toString().padStart(2, "0")}
        </span>
      </div>
    </div>
    <span className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">
      {label}
    </span>
  </div>
);

// Main component that decides which view to show
const DealCountdown = ({
  deal,
  buttonLink = "/search",
}: DealCountdownProps) => {
  // If no deal exists, show a better designed "Coming Soon" message
  if (!deal) {
    return (
      <section className="my-20 overflow-hidden rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-gray-800 dark:to-gray-900">
        <div className="container px-4 py-16 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col gap-6 text-center md:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium mb-2 max-w-max mx-auto md:mx-0">
                <Clock className="h-4 w-4 mr-2" />
                Coming Soon
              </div>

              <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-5xl">
                Exciting Deals <br className="hidden sm:inline" />
                <span className="text-blue-600 dark:text-blue-400">
                  On The Way
                </span>
              </h2>

              <p className="max-w-md mx-auto md:mx-0 text-gray-600 dark:text-gray-300 md:text-lg">
                We&apos;re preparing some exclusive offers just for you. Stay
                tuned for special promotions on premium products that you
                won&apos;t want to miss!
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Button asChild size="lg" className="font-medium">
                  <Link href={buttonLink}>Browse Current Products</Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="font-medium"
                >
                  <Link href="/contact">Notify Me</Link>
                </Button>
              </div>
            </div>

            <div className="relative h-64 md:h-80 w-full overflow-hidden rounded-xl shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-500/20 z-10 rounded-xl" />
              <div className="absolute top-4 right-4 z-20 bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg">
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
              <Image
                src="/images/coming-soon-deals.jpg"
                alt="Upcoming deals"
                fill
                className="object-cover transform hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  // Fallback if the image doesn't exist
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/promo.jpg";
                }}
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent h-1/3 z-10"></div>
              <div className="absolute bottom-4 left-4 z-20">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Limited Time Offers
                </span>
              </div>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                Special Discounts
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Exclusive prices coming soon
              </p>
            </div>
            <div className="p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                Limited Offers
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                For our loyal customers
              </p>
            </div>
            <div className="p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                Bundle Deals
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Save more when buying sets
              </p>
            </div>
            <div className="p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                Premium Selections
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Curated products at special prices
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // If we have a deal, show the countdown component
  return <ActiveDealCountdown deal={deal} buttonLink={buttonLink} />;
};

export default DealCountdown;
