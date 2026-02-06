# 🔐 Cybersecurity & Safety Guidelines

## AMP (Alumni Mentorship Project) - Security Documentation
**Last Updated:** February 6, 2026  
**Status:** Production Ready with Enhanced Security

---

## 📋 Table of Contents
1. [Threat Model & Prevention](#threat-model--prevention)
2. [GitHub Security](#github-security)
3. [Vercel Deployment Security](#vercel-deployment-security)
4. [Frontend Security](#frontend-security)
5. [Environment Variables](#environment-variables)
6. [Common Attacks & Defenses](#common-attacks--defenses)
7. [Security Checklist](#security-checklist)
8. [Incident Response](#incident-response)

---

## 🎯 Threat Model & Prevention

### Key Threats Mitigated:
- **XSS (Cross-Site Scripting)** - Code injection via user inputs
- **CSRF (Cross-Site Request Forgery)** - Unauthorized action execution
- **API Key Exposure** - Hardcoded secrets in code
- **Supply Chain Attacks** - Vulnerable dependencies
- **Data Interception** - Unencrypted data transmission
- **Unauthorized Access** - Missing authentication/authorization
- **Information Disclosure** - Sensitive data in logs/errors

---

## 🔒 GitHub Security

### ✅ Best Practices Implemented:

#### 1. **Secrets Protection**
```
❌ NEVER commit:
- .env.local files
- API keys
- Database passwords
- Private tokens
- Authentication credentials

✅ DO use:
- .env.example (template only)
- Vercel environment variables
- GitHub Secrets (for CI/CD)
- Environment-specific configs
```

#### 2. **Repository Settings**
```bash
# Enable on GitHub repository:
1. Settings → Security & analysis
   ✅ Enable: Dependabot alerts
   ✅ Enable: Secret scanning
   ✅ Enable: Private vulnerability reporting
   
2. Settings → Branches
   ✅ Require pull request reviews (minimum 1)
   ✅ Dismiss stale reviews
   ✅ Require status checks to pass
   
3. Settings → Code security
   ✅ Code scanning with CodeQL (free with public repos)
```

#### 3. **.gitignore Configuration**
```
Already configured to ignore:
- node_modules/
- *.local (all .env.local files)
- .vscode/ (editor configs)
- Build artifacts (dist/, dist-ssr/)
- Editor-specific files
```

#### 4. **Sensitive Data Audit**
```bash
# Search history for accidentally committed secrets:
git log --all --full-history -- **/.env*
git log --all --full-history --oneline | grep -i "key\|secret\|token\|password"

# If secrets found in history:
git filter-branch --tree-filter 'rm -f .env.local' -- --all
# Then rotate those credentials immediately
```

---

## 🚀 Vercel Deployment Security

### ✅ Security Headers Configured (vercel.json):

```typescript
Content-Security-Policy:
  - Restricts script execution to approved sources only
  - Prevents inline script execution (blocks XSS)
  - Domain: allows HTTPS only

X-Content-Type-Options: nosniff
  - Prevents MIME-type sniffing attacks

X-Frame-Options: DENY
  - Prevents clickjacking (embedding site in iframes)

X-XSS-Protection: 1; mode=block
  - Browser XSS filter enabled

Strict-Transport-Security: max-age=31536000
  - Forces HTTPS for 1 year
  - Protects against downgrade attacks

Referrer-Policy: strict-origin-when-cross-origin
  - Limits referrer information leakage

Permissions-Policy:
  - Disables dangerous APIs: geolocation, microphone, camera, payment, etc.
```

### ✅ Environment Variables in Vercel

```
1. Go to: Vercel Dashboard → Project Settings
2. Navigate to: Environment Variables
3. Add each variable:
   - GEMINI_API_KEY: [your_actual_key]
   - Apply to: All Environments (or specific)
   - Redeploy after changes
```

**Important:** Variables added to Vercel dashboard should NOT be committed to GitHub.

### ✅ Deployment Protection

```bash
# In Vercel Dashboard:
1. Settings → Deployment Protection
   ✅ Enable: Deployment Protection
   ✅ Protect production deployments
   ✅ Require authentication for preview URLs
   
2. Settings → Allowed IP addresses (optional)
   - Add team members' IPs
   - Restricts deployments to known IPs
```

---

## 🛡️ Frontend Security

### ✅ Input Sanitization
```typescript
// Located: src/utils/security.ts

// Sanitize user input to prevent XSS
import { sanitizeInput, validateEmail } from '@/utils/security';

const userInput = sanitizeInput(userText);
const isValidEmail = validateEmail(email);
```

### ✅ URL Validation
```typescript
// Prevent javascript: and data: protocol attacks
import { sanitizeUrl } from '@/utils/security';

const safeUrl = sanitizeUrl(userProvidedUrl);
if (safeUrl) {
  window.open(safeUrl);
}
```

### ✅ localStorage Security
```typescript
// Safe localStorage operations with sanitization
import { secureStorage } from '@/utils/security';

// Instead of: localStorage.setItem()
secureStorage.set('userPreferences', data);

// Instead of: localStorage.getItem()
const data = secureStorage.get('userPreferences');
```

### ✅ Rate Limiting
```typescript
// Prevent brute force attacks
import { RateLimiter } from '@/utils/security';

const limiter = new RateLimiter(5, 60000); // 5 attempts per minute

if (limiter.isAllowed('contact-mentor-button')) {
  // Allow action
} else {
  // Show error: "Too many requests. Please try again later."
}
```

### ✅ Code Cleanup (Production)

```typescript
// DELETE all console.log() in production
// Current state: ⚠️ Some console.logs remain

// To remove before deployment, use in App.tsx and components:
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info');
}

// OR use tree-shaking removal
// Build process already strips dead code with: tsc && vite build
```

---

## 🔑 Environment Variables

### ✅ Security Best Practices:

```bash
# DO ✅
- Use Vercel environment variables for secrets
- Use .env.example as template (NO VALUES)
- Keep VITE_* variables non-sensitive
- Rotate keys regularly
- Different keys for dev/staging/production

# DON'T ❌
- Commit .env.local to GitHub
- Use VITE_ prefix for sensitive secrets
- Hardcode API keys in code
- Share environment variable screenshots
- Use same key across environments
```

### ✅ Current Setup:

**Local Development (.env.local):**
```
# OPTIONAL - Only needed when Gemini API is integrated
GEMINI_API_KEY=your_local_key_here
```

**Production (Vercel Dashboard):**
```
# OPTIONAL - Currently not used
# Add GEMINI_API_KEY only when implementing AI features:
# - Smart mentor recommendations
# - Student profile analysis
# - AI-powered matching improvements
VITE_APP_ENV=production
```

**Template (.env.example):**
```
# FUTURE USE: Placeholder for when Gemini API integration is ready
GEMINI_API_KEY=your_gemini_api_key_here
```

### 📝 When to Add GEMINI_API_KEY:

**Current Status:** ❌ **Not Yet Used**  
**Your App:** ✅ Works perfectly without it (all matching is client-side)

**Add Key When You:**
- Want AI-powered mentor recommendations
- Need smart student-mentor matching analysis
- Implement profile optimization features
- Enable automated suggestion system

**How to Get Gemini API Key:**
1. Visit: https://makersuite.google.com/app/apikey
2. Create new API key
3. Add to Vercel environment variables
4. Integrate into App.tsx with proper error handling

---

## 🚨 Common Attacks & Defenses

### 1. XSS (Cross-Site Scripting)
```
Attack: <img src=x onerror="alert('hacked')">
Defense: ✅ Implemented
- sanitizeInput() removes JS in user text
- CSP Policy blocks inline scripts
- React escapes by default (but custom HTML needs sanitization)
```

### 2. CSRF (Cross-Site Request Forgery)
```
Attack: Malicious site makes unauthorized requests from user's browser
Defense: ✅ Implemented
- Vercel headers include: X-Requested-With validation
- React SPA handles CORS properly
- Same-origin policy enforced
```

### 3. SQL Injection (N/A - No Backend DB)
```
Status: ✅ Not Applicable
- Frontend-only application
- No direct database access
- Data sourced from static JSON files only
```

### 4. API Key Exposure
```
Attack: Hardcoded keys visible in GitHub or browser network tab
Defense: ✅ Implemented
- Keys stored in Vercel environment variables only
- Keys set at deploy time (not in code)
- stripSensitiveData() removes keys from error logs
```

### 5. Dependency Vulnerabilities
```
Attack: Vulnerable npm packages with known CVEs
Defense: ✅ Implemented
- npm audit built-in
- Dependabot enabled on GitHub
- Regular dependency updates
- Minimal dependencies (only: react, react-dom, lucide-react, vite)

Run: npm audit
```

### 6. Man-in-the-Middle (MITM)
```
Attack: Intercepting unencrypted HTTP traffic
Defense: ✅ Implemented
- HTTPS enforced via Strict-Transport-Security header
- Vercel provides free SSL/TLS certificates
- All traffic encrypted
```

### 7. Clickjacking
```
Attack: Embedding site in malicious iframe that overlays buttons
Defense: ✅ Implemented
- X-Frame-Options: DENY (prevents framing completely)
- Content-Security-Policy: frame-ancestors 'none'
```

### 8. Information Disclosure
```
Attack: Error messages leaking sensitive data
Defense: ✅ Implemented
- stripSensitiveData() sanitizes error logs
- Removed detailed error stack traces from production
- logSecurityEvent() for secure logging
```

---

## ✅ Security Checklist

### Pre-Deployment
- [ ] No .env.local files in Git
- [ ] All secrets in Vercel environment variables
- [ ] npm audit shows no vulnerabilities
- [ ] Security headers configured (vercel.json)
- [ ] CSP policy reviewed for legitimate resources
- [ ] No console.logs with sensitive data
- [ ] All user inputs use sanitizeInput()
- [ ] External URLs use sanitizeUrl()
- [ ] Rate limiting applied to sensitive operations

### Ongoing Monitoring
- [ ] GitHub: Dependabot alerts reviewed weekly
- [ ] GitHub: Secret scanning enabled
- [ ] Vercel: Deployment protection enabled
- [ ] Vercel: Environment variables verified
- [ ] npm audit: Run with each update
- [ ] Dependencies: Updated regularly
- [ ] Security headers: Validated with Security Headers.com

### Post-Incident
- [ ] Determine cause of breach
- [ ] Rotate all exposed credentials
- [ ] Update security measures
- [ ] Document lessons learned
- [ ] Notify affected users if necessary

---

## 🚨 Incident Response

### If You Suspect a Security Breach:

#### 1. **API Key Compromised**
```bash
# Immediate Actions:
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Delete the compromised GEMINI_API_KEY
3. Generate new key from Gemini API console
4. Add new key to Vercel environment variables
5. Redeploy website
6. Monitor Gemini API usage for unauthorized access
```

#### 2. **Secret Committed to GitHub**
```bash
# Immediate Actions:
1. Rotate the compromised secret immediately
2. Search Git history: git log --all --oneline | grep -i secret
3. Remove from history: git filter-branch --tree-filter 'rm -f .env.local'
4. Force push: git push -f origin main
5. Update repository's Dependabot secrets

# Long-term:
1. Review Git history for other secrets
2. Update .gitignore and .env.example
3. Add pre-commit hook to prevent this:
   npm install husky lint-staged
   husky install
   husky add .husky/pre-commit 'lint-staged'
```

#### 3. **Website Defaced/Hacked**
```bash
# Immediate Actions:
1. Check Vercel deployment logs
2. Review recent commits for unauthorized code
3. Check GitHub branches for malicious pushes
4. Review Vercel deployment environment variables
5. Force redeploy from known good commit:
   - Vercel Dashboard → Deployments → Redeploy button
6. Check website for malicious code injection

# Investigation:
git log --oneline -20
git show <commit>
```

#### 4. **Suspicious GitHub Activity**
```bash
# Actions:
1. GitHub Settings → Security & analysis
   - Review recent access logs
   - Check authorized applications
   - Remove suspicious apps
   
2. GitHub Settings → Applications
   - Remove unknown third-party apps
   - Revoke suspicious tokens
   
3. Change GitHub password
4. Enable 2FA if not already enabled
```

---

## 📚 Security Resources

- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **Security Headers:** https://securityheaders.com/
- **GitHub Security:** https://github.com/security
- **Vercel Security:** https://vercel.com/security
- **Content-Security-Policy:** https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- **npm Security:** https://docs.npmjs.com/cli/v8/commands/npm-audit

---

## 🤝 Security Reporting

If you discover a security vulnerability:

1. **DO NOT** create a public GitHub issue
2. Send details to project maintainer privately
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if possible)

---

## 📞 Support

For security questions or concerns:
- Contact: Project Maintainer
- Email: [Your Email]
- Slack: [Your Channel]

---

**Last Reviewed:** February 6, 2026  
**Next Review:** August 6, 2026 (6-month schedule)

Keep this document updated as security practices evolve!
