# VRChat Account Generator

Hey! This is a Discord bot that generates VRChat accounts automatically. I completely rewrote the original messy JavaScript code in TypeScript because, honestly, it was getting hard to maintain.

## What does it do?

Basically, you run a Discord bot and use slash commands to:
- Generate VRChat accounts (handles the annoying captcha stuff automatically)
- Get 2FA codes when you need to log in
- Verify login locations
- All accounts get saved to a file and sent to your DMs

The bot uses 2Captcha to solve hCaptcha challenges, connects to your email via IMAP to verify accounts, and optionally routes everything through proxies if you want to avoid rate limits.

## Setup

You'll need:
- Node.js 18 or newer
- A Discord bot (make one at discord.com/developers)
- A 2Captcha account with some balance
- An email account you can use for verification
- Optionally, some proxies if you're generating a lot of accounts

### Getting it running

1. Install dependencies:
```bash
npm install
```

2. Copy the example config and fill it out:
```bash
cp .env.example .env
```

3. Edit `.env` with your actual credentials:
```env
DISCORD_TOKEN=your_bot_token_here
CAPTCHA_API_KEY=your_2captcha_api_key
EMAIL_USER=your_email@whatever.com
EMAIL_PASSWORD=your_password
EMAIL_HOST=imap.gmail.com
EMAIL_DOMAIN=@yourdomain.com
```

For Gmail, you'll need to enable IMAP and use an app password instead of your regular password. Google "gmail app password" if you're not sure how.

4. Build and start:
```bash
npm run build
npm start
```

That's it. The bot should show up online in your Discord server.

## Using it

Just use these commands in Discord:

- `/account` - Generates a new VRChat account (takes like a minute because of captcha)
- `/2auth username` - Gets you the 2FA code for logging in
- `/loginlocation username` - Clicks the "yes this was me" link in the email
- `/help` - Shows the commands

All the account info gets sent to your DMs so it's not sitting in public channels.

## Adding proxies

If you want to use proxies (helps avoid getting rate limited), just make a `data/proxies.txt` file:

```
123.45.67.89:8080:username:password
98.76.54.32:3128
```

One proxy per line. Format is `ip:port:username:password` or just `ip:port` if there's no auth.

## Rate limiting

By default, users can generate 3 accounts per day. Change it in `.env`:
```env
DAILY_ACCOUNT_LIMIT=5
```

## Common issues

**"npm install fails"** - The project includes custom type definitions for some packages. Just delete `node_modules` and `package-lock.json`, then run `npm install` again.

**"Bot doesn't start"** - Check your Discord token in `.env`. Make sure it's actually the token and not the client secret or something.

**"Captcha timeout"** - Either your 2Captcha key is wrong or you're out of balance. Check your account.

**"Email verification fails"** - Make sure IMAP is enabled on your email and you're using the right credentials. For Gmail, you NEED an app password.

**"Proxy errors"** - Test your proxies manually first. Some free proxy lists are full of dead proxies.

## File structure

```
src/
├── bot/              - Discord bot commands and stuff
├── services/         - The actual generation logic
├── config/           - Loads your .env file
├── database/         - Tracks who generated how many accounts
├── utils/            - Random helpers like logging
└── types/            - TypeScript definitions
```

All the generated accounts get saved to `data/GeneratedAccounts.txt`.

## Why TypeScript?

The original code was a mess of nested callbacks and copy-pasted IMAP code everywhere. I rewrote it in TypeScript so:
- Easier to catch bugs before running
- Way cleaner to read and modify
- Proper error handling instead of random crashes
- Can actually add tests if needed

Plus no more hardcoded credentials scattered everywhere. Everything goes in `.env` now.

## Notes

- This is for educational purposes. Don't be stupid with it.
- VRChat might ban your email domain if you make too many accounts
- Use proxies if you're doing this at scale
- The bot has a daily limit per user to prevent abuse
- All credentials stay in your `.env` file, never commit that

## License

MIT - do whatever you want with it

## Troubleshooting

Check `TROUBLESHOOTING.md` if you run into issues. Most problems are just misconfigured `.env` files or email settings.