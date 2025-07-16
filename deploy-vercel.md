# Deploy to Vercel - Quick Instructions

Your site is ready to deploy! Here are two options:

## Option 1: Vercel Web Interface (Easiest)
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Import your GitHub repository: `liadgez/googleads-ai`
5. Click "Deploy"
6. Your site will be live in seconds!

## Option 2: Command Line (If logged in)
```bash
cd /Users/liadgez/Documents/googleads-ai
vercel login  # Choose GitHub
vercel --prod
```

## Your Site Files
- Main page: `index.html` (simple black tile design)
- Alternative: `docs/index.html` (same content)

## Expected Result
Once deployed, you'll see:
- Black background
- Centered tile saying "Google Ads AI Agent"
- "Shape the First Autonomous Google Ads Agent" subtitle
- "Join as Design Partner" button

## Alternative: Try Netlify
If Vercel doesn't work:
1. Go to https://app.netlify.com
2. Drag the entire `googleads-ai` folder to the browser
3. Site deploys instantly!

Your site is simple and ready - just needs deployment!