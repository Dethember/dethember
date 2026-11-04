# Site analytics setup

This adds aggregate, all-time counters to the GitHub Pages site using a Cloudflare Worker and D1 database. It does not record visitor identities, IP addresses, or daily/monthly histories.

- Counters start at zero when the database is initialized; earlier visits cannot be recovered.
- **Visits** count page loads where the analytics request succeeds. They are not unique people and may include automated browsers.
- **Copies** count successful clicks on the site's Copy Link button.
- **Shares** count successful uses of the browser's native Share action. Cancelling the share sheet is not counted. Where native sharing is unavailable, the Share button copies the link and increments Copies instead.
- Copies or shares performed outside the site's buttons cannot be detected.
- The `3214` keystroke opens the panel without a password. It is only a shortcut, not security: anyone can inspect the website code or call the public stats endpoint directly. The totals are aggregate counts only, but they are not private.

## Deploy the Worker

1. Install Node.js, then authenticate Wrangler with your Cloudflare account:

   ```powershell
   npx wrangler login
   ```

2. Create the D1 database:

   ```powershell
   npx wrangler d1 create dethember-site-analytics --config analytics/wrangler.toml
   ```

   Copy the returned database ID into `database_id` in `analytics/wrangler.toml`, replacing `REPLACE_WITH_D1_DATABASE_ID`.

3. Create the counter table:

   ```powershell
   npx wrangler d1 execute dethember-site-analytics --remote --file=analytics/schema.sql --config analytics/wrangler.toml
   ```

4. Deploy:

   ```powershell
   npx wrangler deploy --config analytics/wrangler.toml
   ```

5. In `index.html`, replace `YOUR_ACCOUNT_SUBDOMAIN` in `ANALYTICS_API` with the subdomain from the deployed Worker URL. Commit and publish the site through GitHub Pages.

Type `3214` within one second on the website to view the totals. The stats endpoint is public and the event endpoint can be called by anyone, so these aggregate counters are useful estimates, not private or tamper-proof audit records.
