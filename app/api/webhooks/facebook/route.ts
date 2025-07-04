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
    const body = await request.text()
    const signature = request.headers.get("x-hub-signature-256")?.replace("sha256=", "") || ""

    // Verify Facebook signature
    if (!verifyFacebookSignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 })
    }

    const data = JSON.parse(body)

    await connectDB()

    // Process each entry
    for (const entry of data.entry) {
      for (const change of entry.changes) {
        if (change.field === "leadgen") {
          const leadgenId = change.value.leadgen_id
          const formId = change.value.form_id

          try {
            // Fetch lead details from Facebook
            const leadData = await fetchLeadFromFacebook(leadgenId)

            // Extract field data
            const fieldData: any = {}
            leadData.field_data?.forEach((field: any) => {
              fieldData[field.name.toLowerCase()] = field.values[0]
            })

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
            })

            // Log activity
            await Activity.create({
              user: null, // System action
              action: "lead_received",
              details: {
                leadId: lead._id,
                leadgenId,
                formId,
                source: "facebook_webhook",
              },
            })

            console.log("Lead created:", lead._id)
          } catch (error) {
            console.error("Error processing lead:", error)

            // Log error
            await Activity.create({
              user: null,
              action: "lead_processing_error",
              details: {
                leadgenId,
                formId,
                error: error instanceof Error ? error.message : "Unknown error",
              },
            })
          }
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
