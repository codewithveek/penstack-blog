import { db } from "@/db";
import { setupStatus } from "@/db/schemas";
import { eq } from "drizzle-orm";

export async function checkSetupStatus(): Promise<{
    isCompleted: boolean;
    requiresSetup: boolean;
}> {
    try {
        const [status] = await db
            .select()
            .from(setupStatus)
            .limit(1);

        if (!status) {
            return {
                isCompleted: false,
                requiresSetup: true,
            };
        }

        return {
            isCompleted: status.is_completed,
            requiresSetup: !status.is_completed,
        };
    } catch (error) {
        return {
            isCompleted: false,
            requiresSetup: true,
        };
    }
}

export async function markSetupComplete(): Promise<void> {
    const [existing] = await db.select().from(setupStatus).limit(1);

    if (existing) {
        await db
            .update(setupStatus)
            .set({
                is_completed: true,
                completed_at: new Date(),
                setup_version: "1.0.0",
            })
            .where(eq(setupStatus.id, existing.id));
    } else {
        await db.insert(setupStatus).values({
            is_completed: true,
            completed_at: new Date(),
            setup_version: "1.0.0",
        });
    }
}
