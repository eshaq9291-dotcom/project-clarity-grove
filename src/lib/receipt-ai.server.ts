import { generateResponse, GatewayError } from "@lovable.dev/ai-gateway";

export type ReceiptData = {
  amount: number | null;
  currency: "YER" | "SAR" | "USD" | null;
  wallet: string | null;
  reference: string | null;
  notes: string | null;
};

/** Reads a transfer receipt image and extracts amount, currency, wallet and reference. */
export async function extractReceipt(dataUrl: string): Promise<{ ok: true; data: ReceiptData } | { ok: false; error: string }> {
  try {
    const res = await generateResponse({
      model: "openai/gpt-6-astra",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                "This is a Yemeni mobile-wallet or bank transfer receipt (e.g. Kuraimi, Jaib, OneCash, Floosak). " +
                "Extract the transferred amount as a plain number, its currency (YER, SAR or USD; Yemeni riyal = YER), " +
                "the wallet or bank name, and the transaction reference/number. Use null for anything not visible. " +
                "Put any doubts in notes (Arabic, short).",
            },
            { type: "input_image", image_url: dataUrl, detail: "high" },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "receipt",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["amount", "currency", "wallet", "reference", "notes"],
            properties: {
              amount: { type: ["number", "null"] },
              currency: { type: ["string", "null"], enum: ["YER", "SAR", "USD", null] },
              wallet: { type: ["string", "null"] },
              reference: { type: ["string", "null"] },
              notes: { type: ["string", "null"] },
            },
          },
        },
      },
    });
    let text = "";
    for (const item of res.output ?? []) {
      if (item.type === "message") {
        for (const c of item.content) if (c.type === "output_text") text += c.text;
      }
    }
    return { ok: true, data: JSON.parse(text) as ReceiptData };
  } catch (e) {
    if (e instanceof GatewayError) {
      console.error("receipt extraction failed", e.code, e.ids);
      return { ok: false, error: e.code };
    }
    console.error("receipt extraction failed", e);
    return { ok: false, error: "parse_failed" };
  }
}
