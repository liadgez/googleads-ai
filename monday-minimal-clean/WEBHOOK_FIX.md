# Webhook URL Issue & Solution

## The Problem
- Each Monday Code deployment gets a new URL prefix (e.g., f411a, a9c0c)
- Webhooks are registered with a specific URL
- When you deploy again, the webhook still points to the old deployment URL

## Quick Solution

### Option 1: Use Monday's Tunnel URL (Recommended)
Monday Code provides a stable tunnel URL that doesn't change between deployments:
- Look for a URL like: `https://tunnel-service-4905568-eca6c204.us.monday.app`
- This URL remains stable across deployments

### Option 2: Environment Variable
Set `DEPLOYMENT_URL` in Monday Code environment variables to your stable URL

### Option 3: Manual Update
After each deployment:
1. Click "Delete All Webhooks"
2. Update the webhook URL in code to match new deployment
3. Click "Setup Status Automation"

## For Future Reference
The webhook URL pattern is:
`https://[deployment-prefix]-service-4905568-eca6c204.us.monday.app/webhook/checkbox`

Where [deployment-prefix] changes with each deployment (f411a, a9c0c, etc.)