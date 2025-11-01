import { decryptKey, encryptKey } from "@/lib/encryption";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { text, action } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (action === "encrypt") {
      const encrypted = encryptKey(text);
      return NextResponse.json({ result: encrypted });
    }

    if (action === "decrypt") {
      const decrypted = decryptKey(text);
      return NextResponse.json({ result: decrypted });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "encrypt" or "decrypt"' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process encryption/decryption" },
      { status: 500 }
    );
  }
}
