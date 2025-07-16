# Steps to Deploy a New Website Version to Vercel

## Method 1: Direct GitHub Integration (Recommended)

### 1. Push Your New Website to GitHub
```bash
# Navigate to your website folder
cd /path/to/your/new-website

# Initialize git if needed
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: New website version"

# Add your GitHub repository as remote
git remote add origin https://github.com/liadgez/googleads-ai.git

# Push to main branch (this will replace everything)
git push -f origin main
```

### 2. Vercel Auto-Deploys
- Vercel will automatically detect the push
- New deployment starts within seconds
- Your site updates automatically

---

## Method 2: Manual Upload via Vercel Dashboard

### 1. Prepare Your Files
- Put all website files in one folder
- Ensure `index.html` is in the root

### 2. Upload to Vercel
1. Go to https://vercel.com/dashboard
2. Click your project name
3. Go to "Settings" → "Git" → "Disconnect from Git"
4. Return to project overview
5. Drag & drop your folder onto the dashboard
6. Vercel deploys instantly

---

## Method 3: Using Vercel CLI (Local)

### 1. Install Vercel CLI (if not installed)
```bash
npm i -g vercel
```

### 2. Deploy from Your Folder
```bash
# Navigate to your website folder
cd /path/to/your/new-website

# Deploy to production
vercel --prod

# Follow prompts:
# - Select your account
# - Link to existing project
# - Deploy
```

---

## Method 4: Complete Repository Replacement

### 1. Clone Current Repository
```bash
# Clone the repository
git clone https://github.com/liadgez/googleads-ai.git
cd googleads-ai
```

### 2. Replace All Content
```bash
# Remove all existing files (except .git)
rm -rf *
rm -rf .[^.]*

# Copy your new website files here
cp -r /path/to/your/new-website/* .
```

### 3. Commit and Push
```bash
# Add all new files
git add .

# Commit
git commit -m "Complete redesign: New website version"

# Push
git push origin main
```

---

## Quick Checklist Before Deployment

- [ ] `index.html` exists in root directory
- [ ] All assets (CSS, JS, images) have correct paths
- [ ] No server-side code (PHP, Python, etc.)
- [ ] Images are optimized for web
- [ ] Test locally by opening index.html in browser

---

## Vercel-Specific Tips

### Optional: Add vercel.json for configuration
```json
{
  "version": 2,
  "cleanUrls": true,
  "trailingSlash": false
}
```

### Common Issues & Fixes

**404 Error?**
- Ensure `index.html` is in root
- Check file names are lowercase
- Verify no special characters in filenames

**Blank Page?**
- Check browser console for errors
- Ensure paths start with `/` not `./`
- Check if JavaScript files are loading

**Deployment Failed?**
- Check build logs in Vercel dashboard
- Ensure no files > 100MB
- Verify no sensitive data (.env files)

---

## One-Line Deploy (If Everything is Ready)

```bash
cd /your/website/folder && git init && git add . && git commit -m "Deploy" && git remote add origin https://github.com/liadgez/googleads-ai.git && git push -f origin main
```

Your site will be live in ~30 seconds at your Vercel URL!