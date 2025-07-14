# Environment Variables Setup

## MONDAY_APP_URL

Set this environment variable to your stable Monday Code tunnel URL.

### In Monday Code Dashboard:
1. Go to your Monday Code app settings
2. Look for the "Tunnel URL" - it should look like:
   ```
   https://tunnel-service-4905568-eca6c204.us.monday.app
   ```
3. Set this as your `MONDAY_APP_URL` environment variable

### Setting the Environment Variable:

**Option 1: In Monday Code Dashboard**
- Go to Environment Variables section
- Add: `MONDAY_APP_URL = https://tunnel-service-4905568-eca6c204.us.monday.app`

**Option 2: In your code deployment**
- Add to your deployment configuration:
  ```
  MONDAY_APP_URL=https://tunnel-service-4905568-eca6c204.us.monday.app
  ```

### Why This Matters:
- The tunnel URL remains stable across deployments
- Regular deployment URLs change with each deployment (f411a, a9c0c, etc.)
- Webhooks need a stable URL to function properly

### Current Webhook URL:
Your webhook will be accessible at:
```
https://tunnel-service-4905568-eca6c204.us.monday.app/webhook/checkbox
```