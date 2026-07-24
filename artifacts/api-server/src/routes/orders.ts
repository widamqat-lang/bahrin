import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable, productsTable } from "@workspace/db";
import { CreateOrderBody } from "@workspace/api-zod";

const router = Router();

router.post("/orders", async (req, res, next) => {
  try {
    const body = CreateOrderBody.parse(req.body);

    const products = await db
      .select({
        id: productsTable.id,
        name: productsTable.name,
      })
      .from(productsTable)
      .where(eq(productsTable.id, body.productId));

    const product = products[0];
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const paymentStatus =
      body.paymentStatus ??
      (body.paymentMethod === "pay_now" ? "pending" : "not_required");

    const [order] = await db
      .insert(ordersTable)
      .values({
        productId: body.productId,
        productName: product.name,
        quantity: body.quantity,
        customerName: body.customerName,
        phone: body.phone,
        address: body.address,
        pickupDate: body.pickupDate.toISOString().slice(0, 10),
        paymentMethod: body.paymentMethod,
        paymentStatus,
        status: "new",
      })
      .returning();

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

export default router;
