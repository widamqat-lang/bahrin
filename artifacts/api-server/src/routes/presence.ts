import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, presenceTable } from "@workspace/db";
import { UpdatePresenceBody } from "@workspace/api-zod";

const router = Router();

router.post("/presence", async (req, res, next) => {
  try {
    const body = UpdatePresenceBody.parse(req.body);
    const now = new Date();

    const existing = await db
      .select()
      .from(presenceTable)
      .where(eq(presenceTable.sessionId, body.sessionId));

    if (existing.length > 0) {
      await db
        .update(presenceTable)
        .set({
          page: body.page,
          label: body.label,
          customerName: body.customerName ?? null,
          lastSeenAt: now,
        })
        .where(eq(presenceTable.sessionId, body.sessionId));
    } else {
      await db.insert(presenceTable).values({
        sessionId: body.sessionId,
        page: body.page,
        label: body.label,
        customerName: body.customerName ?? null,
        lastSeenAt: now,
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
