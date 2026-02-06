# 🔐 Security Setup Guide

Complete security setup guide for AMP (Alumni Mentorship Project)

## Quick Start Security Checklist

### 1. GitHub Repository Setup (5 minutes)
```bash
# Step 1: Enable secret scanning
# Go to: GitHub.com → Your Repo → Settings → Security & analysis
# ✅ Enable: "Secret scanning" (if public repo)
# ✅ Enable: "Dependabot alerts"
# ✅ Enable: "Dependabot security updates"

# Step 2: Protect main branch
# Go to: Settings → Branches → Add rule
# Branch name pattern: main
# ✅ Require pull request reviews before merging (minimum 1)
# ✅ Require status checks to pass
# ✅ Require branches to be up to date before merging

# Step 3: Verify .gitignore
# Make sure .env.local is listed
cd /your/project
git status
# Verify: .env.local is NOT showing as "modified"
```

### 2. Vercel Deployment Setup (10 minutes)
```bash
# Step 1: Set environment variables
# Go to: Vercel Dashboard → AMP Project → Settings → Environment Variables
# 
# OPTIONAL - Only add when Gemini API is integrated:
# Name: GEMINI_API_KEY
# Value: [your_actual_gemini_api_key]
# Environments: Production, Preview, Development
# Get key: https://makersuite.google.com/app/apikey

# Step 2: Enable Deployment Protection
# Go to: Settings → Deployment Protection
# ✅ Enable: "Deployment Protection"
# ✅ Require authentication for Preview URLs

# Step 3: Configure source control
# Go to: Dashboard → Deployments → Settings
# ✅ Verify GitHub integration active
# ✅ Auto-deploy from: main branch
```

### 3. Local Development Setup (15 minutes)
```bash
# Step 1: Create local environment file
cp .env.example .env.local

# Step 2: Add your local API key (OPTIONAL - only if using Gemini API)
# Edit .env.local and add your test GEMINI_API_KEY
# (Leave as placeholder if Gemini integration not yet done)

# Step 3: Verify .env.local is not tracked
git status
# Should show: .env.local (not in git, .gitignore working)

# Step 4: Install security tools (optional but recommended)
npm install --save-dev husky lint-staged

# Step 5: Setup pre-commit hooks
npx husky install
npx husky add .husky/pre-commit 'npm run lint'
# Copy our security hook to: .husky/pre-commit
```

### 4. NPM Dependencies Security (5 minutes)
```bash
# Regular audit
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Review package.json for minimal dependencies only
# Current: react, react-dom, lucide-react, vite (+ dev deps)
# This is excellent - minimal attack surface!

# Check for outdated packages
npm outdated
```

---

## 🚨 Security Detection - What's Protected

### ✅ Implemented Protections:

**1. Network Security (vercel.json)**
- HTTPS enforced (HTTP redirects to HTTPS)
- CSP (Content Security Policy) prevents XSS attacks
- X-Frame-Options prevents clickjacking
- HSTS (HTTP Strict Transport Security) for 1 year
- Other standard security headers

**2. Code Security (src/utils/security.ts)**
- Input sanitization (`sanitizeInput`)
- Email validation with sanitization
- URL validation preventing dangerous protocols
- Secure localStorage operations
- Rate limiting utilities
- Safe logging without sensitive data

**3. Build Security (vite.config.ts)**
- Console.log removal in production build
- Debugger removal
- Source maps for debugging (stored securely)
- Minification and obfuscation

**4. Dependency Security**
- Dependabot automated alerts
- npm audit built-in
- Minimal dependencies (only what needed)
- Regular update advisories

**5. Secrets Protection (.gitignore)**
- .env.local never committed
- Environment variables in Vercel only
- .env.example for reference only
- .pem, .key files never committed

**6. GitHub CI/CD (.github/workflows/security-audit.yml)**
- Automated npm audit on every push
- Secret scanning with TruffleHog
- Hardcoded secret detection
- CodeQL static analysis
- Build verification

---

## 🎯 Common Security Tasks

### Task: Rotate Compromised API Key
```bash
# 1. Stop using old key immediately
# 2. Regenerate key in Gemini API dashboard
# 3. Update Vercel environment variable:
#    - Dashboard → Settings → Environment Variables
#    - Find GEMINI_API_KEY
#    - Click Edit → Enter new key
#    - Set environments
# 4. Trigger redeploy: Dashboard → Deployments → "Redeploy" button
# 5. Monitor Gemini API console for unauthorized usage
```

### Task: Audit Git History for Secrets
```bash
# Check if any secrets were committed
git log --all --full-history -p -- ".env*" | grep -i "key\|secret\|password"

# If found, remove from history:
git filter-branch --tree-filter 'rm -f .env.local' -- --all
git push -f origin main

# Then immediately rotate any exposed credentials!
```

### Task: Security Code Review
```bash
# Before each production deployment:
git diff main origin/main
# Check:
# - No .env files added
# - No console.logs added
# - No hardcoded secrets
# - Input validation on user inputs
# - URLs using sanitizeUrl()
```

### Task: Update Dependencies Securely
```bash
# Check for updates
npm outdated

# Update interactively
npm update

# Update major versions (more careful)
npm install -g npm-check-updates
ncu -u

# Test build
npm run build

# Run security audit
npm audit

# Review changes
git diff package.json package-lock.json

# Commit and push
git add .
git commit -m "chore: update dependencies"
git push
```

---

## 🚫 Security Anti-Patterns (DON'T DO THIS!)

### ❌ DO NOT:
1. Commit .env.local or any file with secrets
2. Hardcode API keys in source code
3. Use console.log() for sensitive data
4. Trust user input without sanitization
5. Make external API calls without URL validation
6. Store passwords in localStorage (unencrypted)
7. Disable security headers
8. Use `dangerouslySetInnerHTML` in React
9. Create PRs with secrets in the description
10. Share environment variable screenshots

### ✅ DO INSTEAD:
1. Use .env.example (values only)
2. Store secrets in Vercel environment variables
3. Remove console logs in production builds
4. Always sanitize: `sanitizeInput(userText)`
5. Validate URLs: `sanitizeUrl(url)` before opening
6. Use: `secureStorage.set()` for any data
7. Keep security headers in vercel.json
8. Use React's default escaping (innerText, textContent)
9. Use GitHub Secrets for CI/CD sensitive data
10. Use environment variables and secure processes

---

## 📊 Security Monitoring

### Weekly Security Tasks:
- [ ] Check GitHub Dependabot alerts
- [ ] Review npm audit results
- [ ] Check Vercel deployment logs

### Monthly Security Tasks:
- [ ] Update dependencies to latest safe versions
- [ ] Review GitHub security & analysis tab
- [ ] Check CSP policy against new resources
- [ ] Audit recent commits in main branch

### Quarterly Security Tasks:
- [ ] Full security review documentation
- [ ] Penetration testing request (if applicable)
- [ ] Update SECURITY.md with latest practices
- [ ] Review and rotate API keys
- [ ] Update security training for team

---

## 🆘 Security Incident Response

### If You Find a Vulnerability:

**Step 1: Stop**
- Stop using the compromised system/key
- Don't share details publicly
- Don't close relevant GitHub issues

**Step 2: Report**
- Contact project maintainers privately
- Include: description, reproduction steps, impact

**Step 3: Remediate**
- Rotate compromised credentials immediately
- Deploy fix via Vercel
- Monitor for unauthorized access

**Step 4: Communicate**
- Document what happened
- Update security policies
- Notify affected parties if necessary

**Step 5: Prevent**
- Implement additional safeguards
- Update monitoring
- Add test cases for vulnerability

---

## 📚 Resources

### Official Documentation:
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GitHub Security Best Practices](https://github.com/security)
- [Vercel Security](https://vercel.com/security)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [npm Security Guidelines](https://docs.npmjs.com/CLI/)

### Tools:
- `npm audit` - Built-in vulnerability scanner
- `git-secrets` - Prevent secrets in commits
- `TruffleHog` - Secret scanning (GitHub Actions)
- `CodeQL` - Static code analysis (GitHub Actions)

### Ongoing Education:
- Subscribe to: npm security updates
- Follow: GitHub Security Hub
- Review: SECURITY.md quarterly

---

## ✅ Implementation Status

| Security Feature | Status | Details |
|---|---|---|
| HTTPS/TLS | ✅ | Vercel managed SSL, HSTS enabled |
| CSP Headers | ✅ | vercel.json configured |
| X-Frame-Options | ✅ | Set to DENY (no framing) |
| Input Sanitization | ✅ | security.ts utilities |
| secrets.yml scanning | ✅ | GitHub Actions workflow |
| Dependabot | ✅ | Enabled on repository |
| npm audit | ✅ | Built-in, runs on CI/CD |
| .env protection | ✅ | .gitignore configured |
| Source maps | ✅ | Generated securely |
| Console log removal | ✅ | Build-time stripping |
| Rate limiting | ✅ | RateLimiter utility available |
| Secure storage | ✅ | secureStorage.* utilities |
| Pre-commit hooks | ✅ | Security checks configured |
| Documentation | ✅ | This guide + SECURITY.md |

---

## 🎓 Next Steps

1. ✅ Complete GitHub setup (this document)
2. ✅ Complete Vercel setup (this document)
3. ✅ Review SECURITY.md for detailed guidelines
4. ✅ Run `npm audit` to check dependencies
5. ✅ Share this guide with team members
6. ✅ Schedule quarterly security reviews

---

**Last Updated:** February 6, 2026  
**Review Schedule:** Quarterly (every 3 months)  
**Next Review:** May 6, 2026

Stay secure! 🔒
