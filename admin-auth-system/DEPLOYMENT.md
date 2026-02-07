# Production build and deployment instructions

1. Push your code to GitHub.
2. Connect your GitHub repo to Vercel (https://vercel.com/import).
3. Set environment variables in Vercel dashboard:
   - DATABASE_URL
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL
   - CSRF_SECRET
4. Deploy! Vercel will auto-install dependencies and build the project.

# Mobile compatibility
- The UI is fully responsive with Tailwind CSS.
- Works on iOS and Android browsers.
- For native apps, use a webview or build a React Native frontend that connects to the same API.

# Dependency list
- next
- react
- react-dom
- tailwindcss
- prisma
- @prisma/client
- pg
- next-auth
- zod
- bcrypt
- dotenv

# Security
- No hardcoded secrets
- All sensitive values are in environment variables
- Session, CSRF, and security headers are enabled

# Future-proof
- Modular folder structure
- Easily extendable for new features
- Admin dashboard widgets for management and analytics
