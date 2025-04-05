import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import qs from "query-string";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Type for possible Decimal-like objects
interface DecimalLike {
  toString(): string;
  s?: number;
  e?: number;
  d?: unknown[];
  toNumber?: () => number;
}

// Check if value is Decimal-like
function isDecimalLike(value: unknown): value is DecimalLike {
  if (typeof value !== "object" || value === null) return false;

  // Check for constructor name
  const constructorName = (value as object).constructor?.name;
  if (constructorName === "Decimal" || constructorName === "PrismaDecimal") {
    return true;
  }

  // Check for toNumber method
  if (
    "toNumber" in value &&
    typeof (value as { toNumber: unknown }).toNumber === "function"
  ) {
    return true;
  }

  // Check for Decimal structure
  if (
    "s" in value &&
    typeof (value as { s: unknown }).s === "number" &&
    "e" in value &&
    typeof (value as { e: unknown }).e === "number" &&
    "d" in value &&
    Array.isArray((value as { d: unknown }).d)
  ) {
    return true;
  }

  return false;
}

// Convert prisma object into regular js object
export function convertToPlainObject<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (key, value) => {
      // Check if value is null or undefined
      if (value === null || value === undefined) {
        return value;
      }

      // Convert Decimal objects to numbers
      if (isDecimalLike(value)) {
        try {
          // Try to use toNumber method if available
          if (typeof value.toNumber === "function") {
            return value.toNumber();
          }

          // Otherwise, convert to string and parse as float
          return parseFloat(String(value));
        } catch (error) {
          console.error("Error converting Decimal:", error);
          return 0; // Fallback value
        }
      }
      return value;
    })
  );
}

// Format number with decimal places
export function formatNumberWithDecimal(num: number): string {
  const [int, decimal] = num.toString().split(".");
  return decimal ? `${int}.${decimal.padEnd(2, "0")}` : `${int}.00`;
}

// Type for possible error objects
interface ErrorWithMessage {
  message: string | unknown;
  name?: string;
  errors?: Record<string, { message: string }>;
  meta?: {
    target?: string[];
  };
  code?: string;
}

// Format errors
export function formatError(error: unknown): string {
  const err = error as ErrorWithMessage;

  if (err.name === "ZodError" && err.errors) {
    // Handle Zod error
    const fieldErrors = Object.keys(err.errors).map(
      (field) => err.errors?.[field].message ?? "Validation error"
    );

    return fieldErrors.join(". ");
  } else if (
    err.name === "PrismaClientKnownRequestError" &&
    err.code === "P2002" &&
    err.meta?.target
  ) {
    // Handle Prisma error
    const field = err.meta.target[0] ?? "Field";
    return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  } else {
    // Handle other errors
    const errorMessage =
      typeof err.message === "string"
        ? err.message
        : "An unknown error occurred";

    return errorMessage;
  }
}

// Round number to 2 decimal places
export function round2(value: number | string): number {
  if (typeof value === "number") {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  } else if (typeof value === "string") {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  } else {
    throw new Error("Invalid value");
  }
}

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

// Format Number
const NUMBER_FORMATTER = new Intl.NumberFormat("en-US");

export function formatNumber(number: number): string {
  return NUMBER_FORMATTER.format(number);
}

// Format currency using a formatter
export function formatCurrency(amount: number | string | null): string {
  if (typeof amount === "number") {
    return CURRENCY_FORMATTER.format(amount);
  } else if (typeof amount === "string") {
    return CURRENCY_FORMATTER.format(Number(amount));
  } else {
    return "NaN";
  }
}

// Shorten UUID
export function formatId(id: string): string {
  return `...${id.substring(id.length - 6)}`;
}

// Format data and times
export const formatDateTime = (
  dateString: Date
): {
  dateTime: string;
  dateOnly: string;
  timeOnly: string;
} => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // abbreviated month name (e.g., 'Oct')
    day: "numeric", // numeric day of the month (e.g., '25')
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // numeric year (e.g., '2023')
    day: "numeric", // numeric day of the month (e.g., '25')
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };
  const formattedDateTime: string = new Date(dateString).toLocaleString(
    "en-US",
    dateTimeOptions
  );
  const formattedDate: string = new Date(dateString).toLocaleString(
    "en-US",
    dateOptions
  );
  const formattedTime: string = new Date(dateString).toLocaleString(
    "en-US",
    timeOptions
  );
  return {
    dateTime: formattedDateTime,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };
};

// Form the pagination links
export function formUrlQuery({
  params,
  key,
  value,
}: {
  params: string;
  key: string;
  value: string | null;
}): string {
  // Parse the query string into an object
  const query = qs.parse(params);

  query[key] = value;

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query,
    },
    { skipNull: true }
  );
}
