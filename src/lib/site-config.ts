/**
 * ADMIN SETTINGS
 * Everything a store owner may need to change lives in this single file.
 * Later these values can be moved into a database (see db-schema.ts).
 */

import bottle from "@/assets/deal-bottle.png.asset.json";
import logo from "@/assets/deal-logo.png.asset.json";

export const brand = {
  name: "DEAL Cleaning Products",
  company: "SP Enterprises",
  address: "Katedan, Hyderabad",
  logoUrl: logo.url,
};

export const product = {
  id: "deal-clean-500ml",
  name: "DEAL CLEAN – All in One",
  size: "500 ml",
  /** Product price in INR — edit here */
  price: 200,
  /** Set to false to show "Out of Stock" */
  available: true,
  stock: 250,
  imageUrl: bottle.url,
  description:
    "A powerful multipurpose cleaning solution designed to clean, shine, and freshen a wide range of surfaces.",
};

/** Delivery charge in INR — edit here (0 = free delivery) */
export const deliveryCharge = 60;

export const contact = {
  phones: ["+91 6300553190", "+91 9848855075"],
  whatsapp: "916300553190",
  email: "spenterprises.deal@gmail.com",
};

/**
 * Official dilution / usage instructions.
 * Replace this text with the manufacturer's confirmed instructions.
 */
export const usageInstructions =
  "[ADMIN: Add the official dilution and usage instructions here as printed on the product label.]";

export const sampleReviews = [
  {
    name: "Ramesh K.",
    city: "Hyderabad",
    rating: 5,
    text: "Easy to use and leaves the floor looking clean and fresh.",
  },
  {
    name: "Sunitha R.",
    city: "Secunderabad",
    rating: 5,
    text: "Useful for regular cleaning around the house. One bottle covers a lot.",
  },
  {
    name: "Imran S.",
    city: "Katedan",
    rating: 4,
    text: "Works well on tiles and kitchen platform. Pleasant after-cleaning feel.",
  },
  {
    name: "Priya M.",
    city: "Hyderabad",
    rating: 5,
    text: "We use it in our office every week. Surfaces look bright afterwards.",
  },
];

export const formatINR = (n: number) =>
  `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
