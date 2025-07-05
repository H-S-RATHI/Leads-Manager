# Environment Variables Setup

## Updated .env File

Add this to your `.env.local` file (or create it if it doesn't exist):

```env
# Database
MONGODB_URI=mongodb+srv://golusingh967586:SpSzUaANPHZhx0t5@clusterforcrm.sayeela.mongodb.net/?retryWrites=true&w=majority&appName=ClusterForCRM

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Facebook Integration
FACEBOOK_APP_SECRET=4f0e7eb442a5302fdffdb78e8cbaf6bd

# System User Token (NEW - Recommended)
FACEBOOK_SYSTEM_USER_TOKEN=EAAigaE9IpxABPEAX0oKrTfZB9SLJanUX1Ik7s5DAcvyZCMFqx1qGj2kLkZAIvyn6kVWHgS99bBBsPoIkFMmBOJihokU8hPmJrmDrhOYstDZAcHuzelfyGZAGo6NBYZAnNtJeFcm5EjQwtAOq3ZCxutpEaN2eDBTZAujij11kZBbjCNrKqhs3IDDGBDcDYPjU4EwZDZD

# Legacy Tokens (Keep as fallback during transition)
FACEBOOK_ACCESS_TOKEN=EAAigaE9IpxABPOxisHuzSLmEtZBqPJ4ZBmtQkwNuZABoy11ZBM7xuXnHQVVHZAylDwiYZCN2anyj2ZC0xK78poeIhM9W5d0PMmBDnUJt5ADOGViPgvRGRUcaLhFo8qpKR4hoU4OpWSTI3ky2cUHVk1cUcdzLu5RadQi7keyOW0kR4YCZCkuauLuVSR1xaKpg4oOjuEjoD5TTjvnvlvtZB8QRbR6rUgQiXl1NqIQX2KATy
FACEBOOK_CONVERSIONS_ACCESS_TOKEN=EAAJ852zjLH4BPHcZBMZAsAURcrJCdNY67C28yas5NxLouutKlwLVNOG6l2RvV87F66dGcQq3ZBXCmjwvMh1QMuMgJjxl4coXtyMZBPyRwoXQlTKujXaD9JFz8JG00CBw5z5JKGjxYa341E1ZBXxnSd1CVZCwNMoSI8BIZBtLGdiixmtA5lM17wcedvZBZBZC6sTwZDZD

# Facebook Configuration
FACEBOOK_VERIFY_TOKEN=your-verify-token
FACEBOOK_PIXEL_ID=744231038161969
FACEBOOK_TEST_EVENT_CODE=your-test-event-code
```

## Key Changes

1. **Added `FACEBOOK_SYSTEM_USER_TOKEN`** - Your new system user token
2. **Kept existing tokens** - As fallback during transition
3. **Updated comments** - To clarify which tokens are new vs legacy

## What This Enables

With the system user token, your application can now:

✅ **Fetch real ad insights** from your "Ad Account RED"  
✅ **Access lead data** from your Facebook page  
✅ **Send conversion events** using your "RED pixel Account"  
✅ **Manage multiple assets** from one token  
✅ **Longer token lifespan** (no expiration)  

## Testing the Setup

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Check the console logs** - You should see:
   ```
   [Facebook] Using System User token
   ```

3. **Test ad insights** - Go to `/dashboard/ads` and select your ad account

4. **Test lead webhooks** - Your existing webhook will now use the system user token

## Production Deployment

When deploying to production (Vercel, etc.), add the `FACEBOOK_SYSTEM_USER_TOKEN` to your environment variables.

### Vercel Setup:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `FACEBOOK_SYSTEM_USER_TOKEN` with your token value
3. Deploy

## Security Notes

- ✅ The system user token is more secure than page tokens
- ✅ It has the correct permissions for your assets
- ✅ It won't expire like page tokens
- ⚠️ Keep it secure and don't share it publicly

## Troubleshooting

If you see errors:
1. Check that the token is correctly copied
2. Verify the token has the right permissions
3. Check the console logs for detailed error messages
4. Ensure your Facebook app is properly configured 