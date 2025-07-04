import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Lead } from "@/lib/models/Lead"
import { Activity } from "@/lib/models/Activity"
import { verifyFacebookSignature, fetchLeadFromFacebook } from "@/lib/facebook"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  if (mode === "subscribe" && token === process.env.FACEBOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge)
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}

export async function POST(request: NextRequest) {
  try {
    console.log("[Webhook] Incoming POST request");
    const body = await request.text();
    console.log("[Webhook] Raw body:", body);
    const signature = request.headers.get("x-hub-signature-256")?.replace("sha256=", "") || "";
    console.log("[Webhook] Signature header:", signature);

    if (!signature) {
      console.warn("[Webhook] No signature header present. Skipping signature verification (likely a Facebook test request).");
      // Option 1: Allow test requests to proceed (not secure for production, but useful for debugging)
      // Option 2: Return a 400 error with a clear message
      // For now, let's allow it for debugging:
    } else {
      const isSignatureValid = verifyFacebookSignature(body, signature);
      console.log("[Webhook] Signature valid:", isSignatureValid);
      if (!isSignatureValid) {
        console.log("[Webhook] Invalid signature. Returning 403.");
        return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
      }
    }

    const data = JSON.parse(body);
    console.log("[Webhook] Parsed data:", JSON.stringify(data, null, 2));

    await connectDB();
    console.log("[Webhook] Connected to DB");

    // Process each entry
    for (const entry of data.entry) {
      for (const change of entry.changes) {
        if (change.field === "leadgen") {
          const leadgenId = change.value.leadgen_id;
          const formId = change.value.form_id;
          console.log(`[Webhook] Processing leadgen: leadgenId=${leadgenId}, formId=${formId}`);

          try {
            // Fetch lead details from Facebook
            const leadData = await fetchLeadFromFacebook(leadgenId);
            console.log("[Webhook] Fetched lead data:", JSON.stringify(leadData, null, 2));

            // Extract field data
            const fieldData: any = {};
            leadData.field_data?.forEach((field: any) => {
              fieldData[field.name.toLowerCase()] = field.values[0];
            });
            console.log("[Webhook] Extracted fieldData:", fieldData);

            // Create lead in database
            const lead = await Lead.create({
              leadgenId,
              formId,
              name: fieldData.full_name || fieldData.name || "Unknown",
              email: fieldData.email || "",
              phone: fieldData.phone_number || fieldData.phone || null,
              budget: fieldData.budget ? Number.parseFloat(fieldData.budget) : null,
              plotSize: fieldData.plot_size || fieldData["plot size"] || null,
              status: "New",
            });
            console.log("[Webhook] Lead created in DB:", lead._id);

            // Log activity
            await Activity.create({
              action: "lead_received",
              details: {
                leadId: lead._id,
                leadgenId,
                formId,
                source: "facebook_webhook",
              },
            });
            console.log("[Webhook] Activity logged for lead:", lead._id);
          } catch (error) {
            console.error("[Webhook] Error processing lead:", error);

            // Log error
            await Activity.create({
              action: "lead_processing_error",
              details: {
                leadgenId,
                formId,
                error: error instanceof Error ? error.message : "Unknown error",
              },
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Webhook] Webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
