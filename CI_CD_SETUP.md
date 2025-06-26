# CI/CD Pipeline Setup Guide

This project is configured with a GitHub Actions workflow that automatically deploys to Vercel when you push code to the main branch.

## Prerequisites

1. **GitHub Repository**: Your code must be pushed to a GitHub repository
2. **Vercel Account**: You need a Vercel account and project set up ✅
3. **Vercel CLI**: Install and authenticate with Vercel CLI ✅

## Your Vercel Project Information

Your Vercel project is already linked! Here are your project details:

- **Organization ID**: `team_470ig6HsxbWef3mrYJ5v5Z3T`
- **Project ID**: `prj_70lwuTtiZADzF6wH4XMhPs6CIz5Z`

## Setup Steps

### 1. Get Your Vercel Token

You need to create a Vercel token for GitHub Actions. Go to:
https://vercel.com/account/tokens

Create a new token and copy it.

### 2. Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions, and add these secrets:

- `VERCEL_TOKEN`: Your Vercel token from step 1
- `VERCEL_ORG_ID`: `team_470ig6HsxbWef3mrYJ5v5Z3T`
- `VERCEL_PROJECT_ID`: `prj_70lwuTtiZADzF6wH4XMhPs6CIz5Z`

### 3. Environment Variables

Make sure to add your environment variables in the Vercel dashboard:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `DATABASE_URL`

### 4. Push Your Code

Once everything is set up, push your code to the main branch:

```bash
git add .
git commit -m "Add CI/CD pipeline"
git push origin main
```

## How It Works

- **Push to main/master**: Triggers production deployment
- **Pull Request**: Creates a preview deployment
- **Automatic Testing**: Runs linting, type checking, and build before deployment

## Troubleshooting

If the deployment fails:
1. Check the GitHub Actions logs
2. Verify all secrets are correctly set
3. Ensure environment variables are configured in Vercel
4. Check that your build passes locally with `npm run build` 