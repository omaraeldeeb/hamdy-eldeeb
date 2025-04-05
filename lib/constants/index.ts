export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Hamdy ElDeeb";
export const APP_DESCRIPTION =
  process.env.APP_DESCRIPTION || "Hamdy ElDeeb sanitaryware Store";
export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
export const LATEST_PRODUCTS_LIMIT =
  Number(process.env.LATEST_PRODUCTS_LIMIT) || 4;

export const signInDefaultValues = {
  email: "",
  password: "",
};

export const signUpDefaultValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export const shippingAddressDefaultValues = {
  fullName: "",
  streetAddress: "",
  city: "",
  postalCode: "",
  country: "",
};

export const PAYMENT_METHODS = process.env.PAYMENT_METHODS
  ? process.env.PAYMENT_METHODS.split(", ")
  : ["PayPal", "Stripe", "CashOnDelivery"];

export const DEFAULT_PAYMENT_METHOD =
  process.env.DEFAULT_PAYMENT_METHOD || "PayPal";

export const PAGE_SIZE = Number(process.env.PAGE_SIZE) || 10;

// Updated with new fields for Arabic support and new product features
export const productDefaultValues = {
  name: "",
  nameAr: "",
  slug: "",
  slugAr: "",
  description: "",
  descriptionAr: "",
  categoryId: "",
  brandId: "",
  price: "0",
  discount: null,
  stock: 0,
  images: [],
  isFeatured: false,
  isLimitedTimeOffer: false,
  isNewArrival: false,
  banner: null,
};

// Added categoryDefaultValues for forms
export const categoryDefaultValues = {
  name: "",
  nameAr: "",
  slug: "",
  slugAr: "",
  description: "",
  descriptionAr: "",
  image: "",
  parentId: "",
  level: 1,
};

// Added brandDefaultValues for forms
export const brandDefaultValues = {
  name: "",
  nameAr: "",
  slug: "",
  slugAr: "",
  description: "",
  descriptionAr: "",
  logo: null,
  banner: null,
};

export const USER_ROLES = process.env.USER_ROLES
  ? process.env.USER_ROLES.split(", ")
  : ["admin", "user"];

export const reviewFormDefaultValues = {
  title: "",
  comment: "",
  rating: 0,
};

export const SENDER_EMAIL = process.env.SENDER_EMAIL || "onboarding@resend.dev";
