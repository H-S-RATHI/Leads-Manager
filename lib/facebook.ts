import crypto from "crypto"

export function verifyFacebookSignature(payload: string, signature: string): boolean {
  const expectedSignature = crypto.createHmac("sha256", process.env.FACEBOOK_APP_SECRET!).update(payload).digest("hex")

  return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expectedSignature, "hex"))
}

export async function fetchLeadFromFacebook(leadgenId: string) {
  const response = await fetch(
    `https://graph.facebook.com/v16.0/${leadgenId}?access_token=${process.env.FACEBOOK_ACCESS_TOKEN}`,
  )

  if (!response.ok) {
    throw new Error("Failed to fetch lead from Facebook")
  }

  return response.json()
}

export function hashUserData(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex")
}

export async function sendConversionEvent(eventData: any) {
  const payload = {
    data: [eventData],
    test_event_code: process.env.FACEBOOK_TEST_EVENT_CODE,
  }

  const response = await fetch(
    `https://graph.facebook.com/v16.0/${process.env.FACEBOOK_PIXEL_ID}/events?access_token=${process.env.FACEBOOK_CONVERSIONS_ACCESS_TOKEN}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  )

  if (!response.ok) {
    throw new Error("Failed to send conversion event")
  }

  return response.json()
}
