# Troubleshooting Guide

## Installation Issues

### Issue: `npm install` fails with type errors

**Solution:**
The project includes custom type definitions for packages that don't have official types. These are located in `src/types/`.

If you still have issues:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: `@types/node-imap` not found

**Fixed!** This package doesn't exist. We've created custom type definitions in `src/types/node-imap.d.ts`.

### Issue: TypeScript compilation errors

**Solution:**
```bash
# Make sure TypeScript is installed
npm install -g typescript

# Build the project
npm run build
```

Common TypeScript errors:
- **"Cannot find module"** - Run `npm install`
- **"Type error in node_modules"** - Add `"skipLibCheck": true` to tsconfig.json (already included)

### Issue: Module resolution errors

**Solution:**
The project uses CommonJS modules. If you see ES module errors:
- Check that `package.json` does NOT have `"type": "module"`
- Verify `tsconfig.json` has `"module": "commonjs"`

---

## Runtime Issues

### Issue: Discord bot doesn't start

**Checklist:**
1. Is `DISCORD_TOKEN` set in `.env`?
2. Is the token valid?
3. Does the bot have proper permissions in your server?

**Test:**
```bash
# Check if .env is loaded
node -e "require('dotenv').config(); console.log(process.env.DISCORD_TOKEN ? 'Token loaded' : 'No token');"
```

### Issue: "Cannot find module 'node-imap'"

**Solution:**
```bash
npm install node-imap --save
```

### Issue: Captcha solving fails

**Possible causes:**
1. Invalid `CAPTCHA_API_KEY` in `.env`
2. No balance on 2Captcha account
3. Invalid site key

**Check balance:**
```bash
# Test your 2Captcha key
curl https://2captcha.com/res.php?key=YOUR_API_KEY&action=getbalance
```

### Issue: Email verification not working

**Checklist:**
1. IMAP credentials correct in `.env`?
2. Is IMAP enabled on your email account?
3. For Gmail: Enable "Less secure app access"
4. For Gmail: Generate an "App Password"

**Test IMAP connection:**
```bash
# Use an IMAP test tool or telnet
telnet your-imap-host 993
```

### Issue: Proxy errors

**Solutions:**
1. Check proxy format in `data/proxies.txt`: `ip:port:username:password`
2. Test proxies before adding them
3. Make sure proxies support HTTPS
4. Try running without proxies first

---

## Build Issues

### Issue: `tsc` command not found

**Solution:**
```bash
# Install TypeScript globally
npm install -g typescript

# Or use npx
npx tsc
```

### Issue: Build fails with syntax errors

**Solution:**
Make sure you're using Node.js 18 or higher:
```bash
node --version
# Should be v18.0.0 or higher
```

Update Node.js if needed:
- Windows: Download from nodejs.org
- Mac: `brew upgrade node`
- Linux: Use nvm or package manager

### Issue: Permission denied on `setup.sh`

**Solution:**
```bash
chmod +x setup.sh
./setup.sh
```

---

## Windows-Specific Issues

### Issue: Line ending errors (CRLF vs LF)

**Solution:**
```bash
# Convert line endings
git config core.autocrlf false
```

### Issue: Path issues with scripts

**Solution:**
Use npm scripts instead of direct commands:
```bash
npm run build
npm run dev
npm start
```

### Issue: `setup.sh` doesn't work

**Solution:**
Setup manually:
```powershell
# Create data directory
mkdir data

# Copy environment file
copy .env.example .env

# Install dependencies
npm install

# Build project
npm run build
```

---

## Discord.js Issues

### Issue: Intents error

**Solution:**
The bot already has correct intents configured. Make sure your bot application has:
- Server Members Intent (enabled in Discord Developer Portal)
- Message Content Intent (if needed)

### Issue: Commands not registering

**Solution:**
1. Wait a few minutes after bot starts
2. Check console for registration errors
3. Ensure bot has `applications.commands` scope
4. Try kicking and re-inviting the bot

### Issue: "Missing Access" or "Missing Permissions"

**Solution:**
Check bot permissions in Discord Developer Portal:
- Bot needs "administrator" or specific permissions
- Check role hierarchy in your server
- Verify bot has access to channels

---

## Environment Variable Issues

### Issue: Variables not loading

**Solutions:**
1. Make sure file is named `.env` (not `env.txt` or `.env.example`)
2. Restart the application after changing `.env`
3. No spaces around `=` in `.env`
4. No quotes needed around values (usually)

**Example:**
```env
# ✅ Correct
DISCORD_TOKEN=your_token_here
EMAIL_USER=test@example.com

# ❌ Wrong
DISCORD_TOKEN = "your_token_here"
EMAIL_USER = 'test@example.com'
```

### Issue: .env file not found

**Solution:**
```bash
# Check if file exists
ls -la .env

# If not, copy from example
cp .env.example .env
```

---

## Database Issues

### Issue: User database errors

**Solution:**
The database is automatically created in `data/userDB.json`. If corrupted:
```bash
# Delete and let it recreate
rm data/userDB.json
# Restart the bot
```

### Issue: Rate limiting not working

**Check:**
- `DAILY_ACCOUNT_LIMIT` in `.env`
- User database file exists
- No file permission errors

---

## Network Issues

### Issue: VRChat API timeouts

**Solutions:**
1. Use proxies (add to `data/proxies.txt`)
2. Check if VRChat API is down
3. Verify network connectivity
4. Try different proxy if using one

### Issue: Proxy connection failed

**Debug:**
```bash
# Test proxy manually
curl -x http://username:password@proxy:port https://vrchat.com
```

---

## Quick Fixes

### Clean Install
```bash
# Remove everything and start fresh
rm -rf node_modules package-lock.json dist
npm cache clean --force
npm install
npm run build
```

### Reset Configuration
```bash
# Backup current .env
cp .env .env.backup

# Start fresh
cp .env.example .env
# Edit .env with your credentials
```

### Check Logs
```bash
# Run with full logging
npm run dev

# Check for errors in output
# Colors indicate severity:
# Green = Success
# Yellow = Info
# Red = Error
# Purple = Warning
```

---

## Still Having Issues?

### Debugging Steps

1. **Check Node version:**
   ```bash
   node --version
   # Should be v18+ 
   ```

2. **Verify TypeScript installation:**
   ```bash
   npx tsc --version
   ```

3. **Test environment loading:**
   ```bash
   node -e "require('dotenv').config(); console.log(process.env)"
   ```

4. **Check file permissions:**
   ```bash
   ls -la data/
   ls -la src/
   ```

5. **Validate .env format:**
   - No extra spaces
   - No quotes (unless needed)
   - All required fields filled

6. **Look for specific errors:**
   - Read the error message carefully
   - Check the line number mentioned
   - Look at the stack trace

### Common Error Patterns

| Error Message | Likely Cause | Solution |
|--------------|--------------|----------|
| `Cannot find module` | Missing dependency | Run `npm install` |
| `ETARGET` | Invalid version | Check package.json versions |
| `ENOENT` | File not found | Check file paths and permissions |
| `EACCES` | Permission denied | Run with proper permissions |
| `TypeError` | Wrong type passed | Check TypeScript compilation |
| `401` / `403` | Auth failed | Check API keys and tokens |
| `ETIMEDOUT` | Network issue | Check connectivity/proxies |

---

## Getting Help

1. Check console output carefully
2. Review relevant documentation files
3. Verify all configuration is correct
4. Try a clean install
5. Test each component individually

Most issues are related to:
- Missing or incorrect environment variables
- Outdated Node.js version  
- Network/firewall issues
- Invalid API keys or credentials
