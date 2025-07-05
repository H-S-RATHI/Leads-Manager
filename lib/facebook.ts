import crypto from "crypto"

export function verifyFacebookSignature(payload: string, signature: string): boolean {
  const expectedSignature = crypto.createHmac("sha256", process.env.FACEBOOK_APP_SECRET!).update(payload).digest("hex")

  return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expectedSignature, "hex"))
}

// Get the appropriate access token - prioritize system user token if available
function getAccessToken(): string {
  // Prefer system user token if available, fallback to page token
  const systemToken = process.env.FACEBOOK_SYSTEM_USER_TOKEN
  const pageToken = process.env.FACEBOOK_ACCESS_TOKEN
  
  if (systemToken) {
    console.log("[Facebook] Using System User token")
    return systemToken
  }
  
  if (pageToken) {
    console.log("[Facebook] Using Page Access token (fallback)")
    return pageToken
  }
  
  throw new Error("No Facebook access token available")
}

export async function fetchLeadFromFacebook(leadgenId: string) {
  const accessToken = getAccessToken()

  console.log(`[Facebook] Fetching lead data for leadgenId: ${leadgenId}`)
  
  const response = await fetch(
    `https://graph.facebook.com/v23.0/${leadgenId}?access_token=${accessToken}`,
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[Facebook] Failed to fetch lead: ${response.status} - ${errorText}`)
    throw new Error(`Failed to fetch lead from Facebook: ${response.status}`)
  }

  const data = await response.json()
  console.log(`[Facebook] Successfully fetched lead data for ${leadgenId}`)
  return data
}

export function hashUserData(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex")
}

export async function sendConversionEvent(eventData: any) {
  const payload = {
    data: [eventData],
    test_event_code: process.env.FACEBOOK_TEST_EVENT_CODE,
  }

  // Use system user token for conversions if available, otherwise use dedicated conversions token
  const accessToken = process.env.FACEBOOK_SYSTEM_USER_TOKEN || process.env.FACEBOOK_CONVERSIONS_ACCESS_TOKEN || ""

  if (!accessToken) {
    throw new Error("No Facebook access token available for conversions")
  }

  console.log(`[Facebook] Sending conversion event: ${eventData.event_name}`)
  console.log(`[Facebook] Using pixel ID: ${process.env.FACEBOOK_PIXEL_ID}`)

  const response = await fetch(
    `https://graph.facebook.com/v23.0/${process.env.FACEBOOK_PIXEL_ID}/events?access_token=${accessToken}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[Facebook] Failed to send conversion: ${response.status} - ${errorText}`)
    throw new Error(`Failed to send conversion event: ${response.status}`)
  }

  const result = await response.json()
  console.log(`[Facebook] Successfully sent conversion event: ${eventData.event_name}`)
  return result
}

// New function for fetching ad insights with system user token
export async function fetchAdInsights(accountId: string, since: string, until: string) {
  const accessToken = getAccessToken()

  console.log(`[Facebook] Fetching ad insights for account: ${accountId}`)
  console.log(`[Facebook] Date range: ${since} to ${until}`)

  // Enhanced fields to get more detailed information
  const fields = [
    'impressions',
    'clicks', 
    'spend',
    'cpc',
    'cost_per_lead',
    'date_start',
    'date_stop',
    'account_name'
  ].join(',')

  const response = await fetch(
    `https://graph.facebook.com/v23.0/${accountId}/insights?fields=${fields}&time_range={'since':'${since}','until':'${until}'}&access_token=${accessToken}`,
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[Facebook] Failed to fetch ad insights: ${response.status} - ${errorText}`)
    throw new Error(`Failed to fetch ad insights from Facebook: ${response.status}`)
  }

  const data = await response.json()
  console.log(`[Facebook] Raw insights data:`, JSON.stringify(data, null, 2))
  
  // Get account currency information
  try {
    const accountResponse = await fetch(
      `https://graph.facebook.com/v23.0/${accountId}?fields=currency&access_token=${accessToken}`,
    )
    if (accountResponse.ok) {
      const accountData = await accountResponse.json()
      console.log(`[Facebook] Account currency: ${accountData.currency}`)
      
      // Add currency to each insight record
      if (data.data && data.data.length > 0) {
        data.data.forEach((insight: any) => {
          insight.account_currency = accountData.currency
        })
      }
    }
  } catch (error) {
    console.log(`[Facebook] Could not fetch account currency: ${error}`)
  }
  
  console.log(`[Facebook] Successfully fetched ad insights for account: ${accountId}`)
  return data
}

// Function to fetch ad accounts accessible by the system user
export async function fetchAdAccounts() {
  const accessToken = getAccessToken()

  console.log(`[Facebook] Fetching accessible ad accounts`)

  try {
    // Try the business manager endpoint first
    const response = await fetch(
      `https://graph.facebook.com/v23.0/me/adaccounts?fields=id,name,account_status&access_token=${accessToken}`,
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Facebook] Failed to fetch ad accounts: ${response.status} - ${errorText}`)
      throw new Error(`Failed to fetch ad accounts from Facebook: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.data && data.data.length > 0) {
      console.log(`[Facebook] Successfully fetched ${data.data.length} ad accounts via /me/adaccounts`)
      return data
    } else {
      // If no accounts via /me/adaccounts, try direct access to known accounts
      console.log(`[Facebook] No accounts via /me/adaccounts, trying direct access...`)
      
      // Your specific ad account
      const adAccountId = 'act_1055651882781854'
      const directResponse = await fetch(
        `https://graph.facebook.com/v23.0/${adAccountId}?fields=id,name,account_status&access_token=${accessToken}`,
      )

      if (directResponse.ok) {
        const directData = await directResponse.json()
        if (directData.id) {
          console.log(`[Facebook] Successfully accessed ad account directly: ${directData.name}`)
          return {
            data: [directData]
          }
        }
      }
      
      // Return empty data if no accounts found
      console.log(`[Facebook] No ad accounts accessible`)
      return { data: [] }
    }
  } catch (error) {
    console.error(`[Facebook] Error fetching ad accounts:`, error)
    return { data: [] }
  }
}

// Function to fetch pages accessible by the system user
export async function fetchPages() {
  const accessToken = getAccessToken()

  console.log(`[Facebook] Fetching accessible pages`)

  const response = await fetch(
    `https://graph.facebook.com/v23.0/me/accounts?fields=id,name,category&access_token=${accessToken}`,
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[Facebook] Failed to fetch pages: ${response.status} - ${errorText}`)
    throw new Error(`Failed to fetch pages from Facebook: ${response.status}`)
  }

  const data = await response.json()
  console.log(`[Facebook] Successfully fetched ${data.data?.length || 0} pages`)
  return data
}
