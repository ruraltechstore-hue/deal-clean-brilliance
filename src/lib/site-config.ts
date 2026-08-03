/**
 * ADMIN SETTINGS
 * Everything a store owner may need to change lives in this single file.
 * Later these values can be moved into a database (see db-schema.ts).
 */

export const brand = {
  name: "DEAL Cleaning Products",
  company: "SP Enterprises",
  address: "Katedan, Hyderabad",
  logoUrl: "/assets/deal-logo.png",
};

export const products = [
  {
    id: "deal-clean-500ml",
    name: "DEAL CLEAN – All in One",
    size: "500 ml",
    /** Product price in INR — edit here */
    price: 200,
    /** Set to false to show "Out of Stock" */
    available: true,
    stock: 250,
    imageUrl: "/assets/bottle2.png",
    description:
      "A powerful multipurpose cleaning solution designed to clean, shine, and freshen a wide range of surfaces.",
  },
  {
    id: "deal-clean-5l",
    name: "DEAL CLEAN – All in One (Bulk)",
    size: "5 L",
    price: 1500,
    available: true,
    stock: 100,
    imageUrl: "/assets/bottle1.png",
    description:
      "Our powerful multipurpose cleaning solution in a bulk 5L container. Ideal for commercial or long-term home use.",
  },
];

/** Delivery charge in INR — edit here (0 = free delivery) */
export const deliveryCharge = 60;

export const contact = {
  phones: ["+91 6300553190", "+91 9848855075"],
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
