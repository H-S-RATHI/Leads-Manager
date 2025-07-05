# Facebook System User Token Setup Guide

## Overview

This guide explains how to migrate from Page Access Tokens to System User Access Tokens for better security, scalability, and token management in your Leads Manager CRM.

## Benefits of System User Tokens

### ✅ Advantages
- **Longer Lifespan**: System User tokens don't expire (unlike page tokens)
- **Broader Permissions**: Can access multiple pages, ad accounts, and business assets
- **Better Security**: More secure for server-side applications
- **Scalability**: Can manage multiple Facebook assets from one token
- **Centralized Management**: Single token for all Facebook operations

### ⚠️ Considerations
- Requires Business Manager setup
- More complex initial configuration
- Requires proper permission scopes

## Setup Process

### 1. Business Manager Setup

1. **Create Business Manager** (if you don't have one):
   - Go to [Facebook Business Manager](https://business.facebook.com/)
   - Click "Create Account"
   - Follow the setup process

2. **Add Your Facebook App**:
   - In Business Manager → Settings → Business Settings
   - Go to "Accounts" → "Apps"
   - Add your existing Facebook app

3. **Add Your Ad Account**:
   - Go to "Accounts" → "Ad Accounts"
   - Add your existing ad account

### 2. Create System User

1. **Navigate to System Users**:
   - Business Manager → Settings → Business Settings
   - Go to "Users" → "System Users"

2. **Create New System User**:
   - Click "Add" → "Create a System User"
   - Name: "CRM Integration User"
   - Description: "System user for CRM lead management"

3. **Assign Permissions**:
   - **Ad Accounts**: Admin access to your ad account
   - **Apps**: Admin access to your Facebook app
   - **Pages**: Admin access to pages you want to manage
   - **Pixels**: Admin access to your conversion pixel

### 3. Generate Access Token

1. **Generate Token**:
   - Select your System User
   - Click "Generate New Token"
   - Select your app
   - Choose token expiration: "Never" (recommended)

2. **Required Permissions**:
   ```
   - ads_management
   - ads_read
   - business_management
   - leads_retrieval
   - pages_read_engagement
   - pages_show_list
   ```

3. **Copy the Token**:
   - Save the generated token securely
   - This token will be used in your environment variables

## Environment Variables Update

### Current Setup
```env
# Current tokens
FACEBOOK_ACCESS_TOKEN=EAAigaE9IpxABPOxisHuzSLmEtZBqPJ4ZBmtQkwNuZABoy11ZBM7xuXnHQVVHZAylDwiYZCN2anyj2ZC0xK78poeIhM9W5d0PMmBDnUJt5ADOGViPgvRGRUcaLhFo8qpKR4hoU4OpWSTI3ky2cUHVk1cUcdzLu5RadQi7keyOW0kR4YCZCkuauLuVSR1xaKpg4oOjuEjoD5TTjvnvlvtZB8QRbR6rUgQiXl1NqIQX2KATy
FACEBOOK_CONVERSIONS_ACCESS_TOKEN=EAAJ852zjLH4BPHcZBMZAsAURcrJCdNY67C28yas5NxLouutKlwLVNOG6l2RvV87F66dGcQq3ZBXCmjwvMh1QMuMgJjxl4coXtyMZBPyRwoXQlTKujXaD9JFz8JG00CBw5z5JKGjxYa341E1ZBXxnSd1CVZCwNMoSI8BIZBtLGdiixmtA5lM17wcedvZBZBZC6sTwZDZD
```

### Updated Setup
```env
# Add system user token (recommended)
FACEBOOK_SYSTEM_USER_TOKEN=your_system_user_token_here

# Keep existing tokens as fallback (optional)
FACEBOOK_ACCESS_TOKEN=EAAigaE9IpxABPOxisHuzSLmEtZBqPJ4ZBmtQkwNuZABoy11ZBM7xuXnHQVVHZAylDwiYZCN2anyj2ZC0xK78poeIhM9W5d0PMmBDnUJt5ADOGViPgvRGRUcaLhFo8qpKR4hoU4OpWSTI3ky2cUHVk1cUcdzLu5RadQi7keyOW0kR4YCZCkuauLuVSR1xaKpg4oOjuEjoD5TTjvnvlvtZB8QRbR6rUgQiXl1NqIQX2KATy
FACEBOOK_CONVERSIONS_ACCESS_TOKEN=EAAJ852zjLH4BPHcZBMZAsAURcrJCdNY67C28yas5NxLouutKlwLVNOG6l2RvV87F66dGcQq3ZBXCmjwvMh1QMuMgJjxl4coXtyMZBPyRwoXQlTKujXaD9JFz8JG00CBw5z5JKGjxYa341E1ZBXxnSd1CVZCwNMoSI8BIZBtLGdiixmtA5lM17wcedvZBZBZC6sTwZDZD
```

## Code Changes Made

### 1. Updated `lib/facebook.ts`
- Added `getAccessToken()` function that prioritizes system user token
- Updated `fetchLeadFromFacebook()` to use the new token logic
- Updated `sendConversionEvent()` to use system user token when available
- Added `fetchAdInsights()` function for real Facebook Marketing API integration

### 2. Updated `app/api/ads/insights/route.ts`
- Now uses real Facebook Marketing API instead of mock data
- Falls back to mock data if API calls fail
- Proper error handling for Facebook API errors

## Testing the Integration

### 1. Test Lead Fetching
```bash
# Test webhook endpoint
curl -X POST http://localhost:3000/api/webhooks/facebook \
  -H "Content-Type: application/json" \
  -d '{"entry":[{"changes":[{"field":"leadgen","value":{"leadgen_id":"test_id","form_id":"test_form"}}]}]}'
```

### 2. Test Ad Insights
```bash
# Test ad insights API
curl "http://localhost:3000/api/ads/insights?accountId=act_YOUR_AD_ACCOUNT_ID&since=30&until=1"
```

### 3. Test Conversion Events
```bash
# Test conversion API
curl -X POST http://localhost:3000/api/conversions/send \
  -H "Content-Type: application/json" \
  -d '{"event_name":"Lead","event_time":1234567890}'
```

## Migration Strategy

### Phase 1: Parallel Setup (Recommended)
1. Add system user token to environment variables
2. Keep existing tokens as fallback
3. Test all functionality with system user token
4. Monitor logs for any issues

### Phase 2: Full Migration
1. Once confirmed working, remove old tokens
2. Update documentation
3. Monitor for any edge cases

### Phase 3: Cleanup
1. Remove unused environment variables
2. Update deployment scripts
3. Update team documentation

## Troubleshooting

### Common Issues

1. **"Invalid access token" error**:
   - Verify system user has correct permissions
   - Check token hasn't been revoked
   - Ensure app is added to Business Manager

2. **"Insufficient permissions" error**:
   - Add required permissions to system user
   - Check Business Manager asset assignments

3. **Webhook signature verification fails**:
   - Verify `FACEBOOK_APP_SECRET` is correct
   - Check webhook URL configuration

### Debug Steps

1. **Check token validity**:
   ```bash
   curl "https://graph.facebook.com/debug_token?input_token=YOUR_TOKEN&access_token=YOUR_APP_TOKEN"
   ```

2. **Test permissions**:
   ```bash
   curl "https://graph.facebook.com/me/permissions?access_token=YOUR_SYSTEM_USER_TOKEN"
   ```

3. **Check Business Manager setup**:
   - Verify app is added to Business Manager
   - Confirm ad account is assigned
   - Check system user permissions

## Security Best Practices

1. **Token Storage**:
   - Store tokens in environment variables
   - Never commit tokens to version control
   - Use secure secret management in production

2. **Access Control**:
   - Grant minimum required permissions
   - Regularly review system user permissions
   - Monitor token usage

3. **Monitoring**:
   - Log Facebook API errors
   - Monitor webhook delivery
   - Track conversion event success rates

## Production Deployment

### Vercel Environment Variables
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `FACEBOOK_SYSTEM_USER_TOKEN` with your system user token
3. Keep existing tokens as fallback during transition
4. Deploy and test

### Other Platforms
- **Netlify**: Add to Environment Variables in site settings
- **Railway**: Add to Environment Variables in project settings
- **AWS/GCP**: Use respective secret management services

## Support

If you encounter issues:
1. Check Facebook Developer Console for app status
2. Verify Business Manager permissions
3. Review application logs for detailed error messages
4. Test with Facebook Graph API Explorer

## Conclusion

Using System User tokens provides significant benefits for your CRM application:
- **Better security** with non-expiring tokens
- **Improved scalability** for managing multiple assets
- **Centralized management** of Facebook integrations
- **Reduced maintenance** with fewer token renewals

The code changes are minimal and backward-compatible, allowing for a smooth transition while maintaining existing functionality. 