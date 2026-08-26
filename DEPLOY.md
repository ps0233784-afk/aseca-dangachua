# 🚀 How to put BRANCH ASECA DANGACHUA live — free

This guide shows you three ways to host the website + ERP for free, from easiest
(good for a demo link) to "free forever" (real persistent hosting).

> ⚠️ **Important first step for ALL methods:** this app has a small server (Node.js + a
> database). Static-only hosts like **Vercel, Netlify or GitHub Pages cannot run it** —
> they only serve files, they can't run the backend. Use one of the options below.

---

## Option 1 — Render.com (easiest, ~10 minutes, no credit card)

Free tier. Gives you an instant `https://your-app.onrender.com` link.

**Caveats to know:** free Render apps "sleep" after ~15 min of no visitors (first visit
takes ~30–60 s to wake), and the disk is temporary — if you *redeploy*, the database
resets to the demo data (the app auto-reseeds on start, so it never breaks).

1. **Push the project to GitHub**
   ```bash
   # inside the unzipped "erp" folder:
   git init
   git add .
   git commit -m "BRANCH ASECA DANGACHUA ERP"
   # create an empty repo at github.com/new, then:
   git remote add origin https://github.com/YOUR_USERNAME/aseca-erp.git
   git branch -M main
   git push -u origin main
   ```

2. **Sign up at render.com** (use "Sign in with GitHub").

3. **Deploy using the included blueprint** (the repo already has `render.yaml`):
   - Dashboard → **New +** → **Blueprint**
   - Connect your GitHub account → select the `aseca-erp` repo
   - Render reads `render.yaml` automatically → click **Apply**
   - It will install dependencies, build the site, and start the server.

   *(Manual way instead: New + → Web Service → pick repo → set
   Build command `npm install && npm run build`, Start command `node server/index.js`.)*

4. **Wait ~3–5 minutes** for the first build. Click the `.onrender.com` URL Render shows.

5. **Done!** Website = the URL root · ERP login = `URL/login`
   (login `superadmin` / password `Admin@123`).

---

## Option 2 — Oracle Cloud "Always Free" (free forever, data is permanent)

A free real Linux server (VM) that never sleeps and keeps your data. Oracle asks for a
credit card **only to verify identity — you are never charged** on the Always Free plan.

1. **Create a free VM**
   - Go to oracle.com/cloud/free → **Start for free** → sign up (card needed for verification).
   - Open the Console → **Compute → Instances → Create instance**.
   - Name: `aseca`. Image: **Ubuntu 22.04** (or 24.04). Shape: **VM.Standard.A1.Flex**
     (Ampere, free) with 4 OCPU / 24 GB, or **VM.Standard.E2.1.Micro** (free x86).
   - **Download the private SSH key** when asked (file `ssh-key-…key`).

2. **Open the firewall port**
   - Instance details → **Attached VNICs → (subnet) → Security Lists → Add Ingress Rule**:
     - Source: `0.0.0.0/0`, Protocol: TCP, Destination port: `8080`. Save.

3. **Upload the project to the server**
   ```bash
   # on YOUR computer, inside the folder that contains the unzipped "erp" folder:
   scp -i ssh-key-XXXX.key -r erp ubuntu@YOUR_SERVER_IP:/home/ubuntu/
   ```

4. **Connect to the server and install Node.js 20**
   ```bash
   ssh -i ssh-key-XXXX.key ubuntu@YOUR_SERVER_IP

   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs git build-essential python3
   node -v   # should print v20.x
   ```

5. **Install & start the app**
   ```bash
   cd ~/erp
   npm install          # this also compiles the database module (needs the build-essential above)
   npm run seed         # optional — creates the demo data
   npm run build        # builds the website

   # keep it running forever with PM2:
   sudo npm i -g pm2
   pm2 start server/index.js --name aseca
   pm2 save && pm2 startup   # (copy & run the command it prints)
   ```

6. **Visit it:** `http://YOUR_SERVER_IP:8080` — website, `/login` — ERP. 🎉

7. *(Optional) Add a free domain + HTTPS*
   - Get a free domain at **DuckDNS** (duckdns.org) pointing to your server IP.
   - Install Caddy (auto-HTTPS): `sudo apt install -y caddy`
     edit `/etc/caddy/Caddyfile` → `yourname.duckdns.org { reverse_proxy localhost:8080 }`
     then `sudo systemctl reload caddy`.
   - Now you have `https://yourname.duckdns.org` with a free SSL certificate.

---

## Option 3 — An old laptop / home PC + Cloudflare Tunnel (free forever)

Run it at home and expose it safely without opening your router.

1. Install Node.js 20 on the computer (nodejs.org), unzip the project, then:
   ```bash
   cd erp && npm install && npm run build && node server/index.js
   ```
2. Install **cloudflared** (developers.cloudflare.com/cloudflare-one/connections/connect-networks)
   and run:
   ```bash
   cloudflared tunnel --url http://localhost:8080
   ```
3. Cloudflare prints a public `https://xxxx.trycloudflare.com` link instantly.
   (To make it permanent, add your own domain to Cloudflare and create a named tunnel.)

---

## Quick reference

| | Option 1: Render | Option 2: Oracle VM | Option 3: Home + Tunnel |
|---|---|---|---|
| Cost | ₹0 / $0 | ₹0 / $0 forever | ₹0 |
| Credit card | No | Yes (verification only) | No |
| Data saved forever | ❌ (resets on redeploy) | ✅ | ✅ |
| Sleeps when idle | Yes | No | Only if PC off |
| Skill needed | Low | Medium | Low–Medium |
| Best for | Quick demo link | **Real, permanent site** | Personal/school LAN internet |

---

## Default accounts (change these after going live!)

| Username | Role | Password |
|---|---|---|
| `superadmin` | Super Admin | `Admin@123` |
| `orgadmin` | Organisation Admin | `Admin@123` |
| `schooladmin` | School Admin | `Admin@123` |
| `sumitra` | Teacher | `Admin@123` |
| `accountant` | Accountant | `Admin@123` |
| `birsa` | Student | `Admin@123` |
| `parent` | Parent | `Admin@123` |

**Change the passwords right after deploying:** log in → top-right menu → *Profile & Security* → *Password*.
Also set a strong `JWT_SECRET` (Render does this automatically; on a VPS run
`export JWT_SECRET=$(openssl rand -hex 32)` before starting).
