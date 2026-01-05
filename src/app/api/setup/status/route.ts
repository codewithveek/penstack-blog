import { NextRequest, NextResponse } from "next/server";
import { checkSetupStatus } from "@/lib/setup/check-setup-status";

export async function GET(req: NextRequest) {
    try {
        const status = await checkSetupStatus();

        return NextResponse.json({
            data: status,
            message: "Setup status retrieved successfully",
        });
    } catch (error) {
        return NextResponse.json(
            {
                data: null,
                error: "Failed to check setup status",
            },
            { status: 500 }
        );
    }
}
