# Security Guidelines

## 🔐 Credential Security

### Never Commit These Files:
- `.env` (actual environment variables)
- `n8n-credentials-actual.json` (actual n8n credentials)
- Any file in the `credentials/` directory
- Files with actual API keys, secrets, or tokens

### Safe to Commit:
- `.env.example` (template with placeholder values)
- `n8n-credentials.json` (template with placeholder values)
- Setup scripts that don't contain actual secrets

## 🛡️ Security Best Practices

### 1. Environment Variables
```bash
# ✅ GOOD - Use environment variables
ANTHROPIC_API_KEY=sk-ant-api03-...

# ❌ BAD - Hard-coded in source
const apiKey = "sk-ant-api03-..."
```

### 2. Separate Development/Production
```bash
# Development
NODE_ENV=development
N8N_WEBHOOK_URL=http://localhost:5678/webhook/generate-and-post

# Production
NODE_ENV=production
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/generate-and-post
```

### 3. Credential Rotation
- Rotate API keys every 90 days
- Use different keys for development vs production
- Monitor for unauthorized usage

### 4. Access Control
- Google OAuth: Use minimal required scopes
- Airtable: Use Personal Access Tokens with minimal permissions
- Anthropic: Monitor usage and set billing limits

## 🚨 If Credentials Are Exposed

### Immediate Actions:
1. **Rotate all exposed credentials immediately**
2. **Check git history**: `git log --all --full-history -- .env`
3. **Remove from git history if committed**:
   ```bash
   git filter-branch --force --index-filter \
   'git rm --cached --ignore-unmatch .env' \
   --prune-empty --tag-name-filter cat -- --all
   ```

### API-Specific Actions:

**Google Cloud:**
- Revoke OAuth tokens in Google Cloud Console
- Generate new Client ID/Secret
- Update OAuth consent screen if needed

**Anthropic:**
- Revoke API key in Anthropic Console
- Generate new API key
- Check billing for unauthorized usage

**Airtable:**
- Revoke Personal Access Token in Account Settings
- Generate new token with minimal scopes
- Check base access logs

## 📋 Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] No hardcoded secrets in source code
- [ ] Separate credentials for dev/prod environments
- [ ] Regular credential rotation schedule
- [ ] Monitoring setup for unusual API usage
- [ ] Team members know security procedures
- [ ] Backup/recovery plan for credential loss

## 🔍 Security Monitoring

### Monitor for:
- Unusual API usage patterns
- Failed authentication attempts
- Unexpected data access in Airtable
- High token usage in Anthropic
- OAuth token refresh failures

### Set up alerts for:
- API rate limit exceeded
- Billing threshold exceeded
- Failed authentication spikes
- Unusual geographic access patterns

## 📞 Incident Response

1. **Detection**: Monitor logs and usage patterns
2. **Containment**: Immediately rotate affected credentials
3. **Investigation**: Check access logs and usage patterns
4. **Recovery**: Update applications with new credentials
5. **Lessons Learned**: Update security procedures

---

**Remember**: Security is everyone's responsibility. When in doubt, err on the side of caution!