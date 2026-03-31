# How to Fix Tickets Not Showing After Purchase

## The Problem
When you buy tickets, they don't appear in your wallet because the Stripe webhook (which creates tickets after payment) can't reach your local app. Stripe's servers can't send events to `localhost`.

## The Fix
Use Stripe CLI to forward webhook events from Stripe to your local app.

---

## Step-by-Step Instructions

### Step 1: Install Stripe CLI (if you don't have it)

1. Open **Terminal** on your Mac.
2. Run this command:
   ```bash
   brew install stripe/stripe-cli/stripe
   ```
3. If you don't have Homebrew, install it first: https://brew.sh

---

### Step 2: Log in to Stripe

1. In Terminal, run:
   ```bash
   stripe login
   ```
2. A browser window will open. Click **Allow access**.
3. Wait until you see "Done!" in the terminal.

---

### Step 3: Start the webhook forwarder

1. Make sure your app is running on port 3001 (run `npm run dev:3001` in a separate terminal).
2. In a **new** Terminal window, run:
   ```bash
   stripe listen --forward-to localhost:3001/api/webhooks/stripe
   ```
3. **Leave this terminal open.** You'll see something like:
   ```
   Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxx
   ```
4. **Copy** the entire `whsec_...` value. You'll need it in Step 4.

---

### Step 4: Update your .env.local file

1. Open your project in Cursor/VS Code.
2. Open the file `.env.local` in the project root (same folder as `package.json`).
3. Find the line that says `STRIPE_WEBHOOK_SECRET=whsec_...`
4. **Replace** the old value with the new one from Step 3.
   - Example: `STRIPE_WEBHOOK_SECRET=whsec_abc123xyz789...`
5. Save the file (Cmd+S).

---

### Step 5: Restart your app

1. Go to the terminal where your app is running (the one with `npm run dev:3001`).
2. Press **Ctrl+C** to stop it.
3. Run it again:
   ```bash
   npm run dev:3001
   ```

---

### Step 6: Test it

1. Open the app in your browser: http://localhost:3001
2. Go to **Tickets** → **Daily Admission** → **Scheduled** (or **Flexible**).
3. Add a ticket to your cart and go to **Checkout**.
4. Sign in if asked.
5. Complete the payment (use Stripe test card `4242 4242 4242 4242`).
6. After payment, go to **My Tickets** (or the wallet).
7. Your new ticket should appear.

---

## You Need Two Terminals Running

| Terminal 1 | Terminal 2 |
|-----------|------------|
| `npm run dev:3001` (your app) | `stripe listen --forward-to localhost:3001/api/webhooks/stripe` (webhook forwarder) |
| Keep this running | Keep this running |

Both must stay open while you're testing purchases.

---

## If You're Testing on Your Phone (192.168.1.68:3001)

The Stripe CLI forwards to `localhost:3001`, which works for purchases made from your Mac's browser. For phone testing, the webhook still goes to your Mac—it should work as long as both the app and `stripe listen` are running on your Mac.

---

## Already Have Tickets That Never Appeared?

The app now includes a **recovery** step. When you open **My Tickets** while logged in, it will generate tickets for any paid orders that have none. You don't need to do anything—just open the wallet and they should appear.
