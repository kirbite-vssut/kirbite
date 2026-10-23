# 🍔 Kirbite - Campus Hostel Food Delivery

<p align="center">
  <img src="client/public/kirbite-logo.svg" alt="Kirbite Logo" width="120" height="120" />
</p>

A modern full-stack **MERN (MongoDB, Express, React, Node.js) with Socket.io & Tailwind CSS** web application designed specifically for college hostel students to order food directly from local campus stalls at **Kirba Chowk** (e.g. *Sharma Ji Fast Food & Maggi Point*, *Biryani & Roll Corner*, *South Express Dosa Plaza*, *Chai Sutta Night Canteen*, *Kirba Chinese Wok & Momo Point*).

---

## 🌟 Key Features

### 🎓 1. Student View (`/`)
- **Kirba Chowk Stalls Catalog**:
  - Live **OPEN / CLOSED** status badges updated in real time.
  - Delivery time estimates, ratings, cuisine tags, and owner details.
  - Search by dish or stall name + quick filter chips (*Maggi & Chai*, *Kathi Rolls*, *Biryani*, *South Indian*, *Pure Veg*).
- **Menu & Floating Cart**:
  - Dish photos, veg / non-veg indicators, item descriptions, and pricing in ₹.
  - Quantity steppers (`- [qty] +`) with sticky bottom mobile cart pill.
- **Hostel Room Checkout**:
  - Collects Student Name, Mobile Number, Hostel Block (*CV Raman Hall, Vasishtha, Aryabhatta, Gargi, Kalpana Chawla, Ramanujan, etc.*), and Room Number.
- **Direct UPI Intent & Cash Flow**:
  - Clickable mobile UPI URI button: `upi://pay?pa=VENDOR_UPI&pn=NAME&am=TOTAL&cu=INR&tn=Kirbite-Order` automatically opening installed UPI apps (GPay, PhonePe, Paytm, BHIM) on smartphones.
  - Desktop QR code preview and copyable UPI ID fallback.
- **Real-Time Live Order Progress Tracker**:
  - Stepper timeline updated via Socket.io (*Order Placed* ➔ *Kitchen Preparing* ➔ *Food Ready* ➔ *Delivered to Hostel*).
  - One-tap direct call to stall owner.

---

### 🏪 2. Vendor Dashboard (`/vendor/:stallId`)
- **Stall Switcher**: Seamlessly switch between any Kirba Chowk stall.
- **Shop Open/Closed Toggle Switch**: Instantly toggles stall online/offline state and broadcasts live to all students without refreshing.
- **Real-Time Order Feed with Audio Chime**:
  - Web Audio API synthesizer plays a dual-tone notification chime whenever a student places an order.
  - Flashing visual notification banner.
- **Order Lifecycle Action Buttons**:
  - **Accept & Prepare** ➔ sets status to `Preparing`.
  - **Mark Food Ready** ➔ sets status to `Ready`.
  - **Mark Delivered** ➔ concludes order and marks payment confirmed.
- **Live Order Analytics**: Today's orders count, gross sales (₹), orders in kitchen, and delivered count.

---

## 🚀 Complete Step-by-Step Production Deployment Guide

Deploying Kirbite into production involves three free/low-cost cloud services:
1. **MongoDB Atlas** (Database)
2. **Render** (Node.js + Express + Socket.io Backend Web Service)
3. **Cloudflare Pages** (Vite + React Frontend Static CDN)

---

### STEP 1: Database Setup on MongoDB Atlas (Free Tier)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign up / log in.
2. Click **Create a Deployment** ➔ choose **M0 Free Tier** (AWS, choose closest region to you e.g., Mumbai `ap-south-1`).
3. Under **Security Quickstart**:
   - **Username & Password**: Create a database user (e.g., `kirbite_admin` and a strong password). *Save these credentials!*
4. Under **Network Access** (IP Access List):
   - Click **Add IP Address** ➔ select **Allow Access from Anywhere** (`0.0.0.0/0`). This allows Render's cloud servers to connect securely to your database.
5. Under **Database** ➔ click **Connect** ➔ choose **Drivers** (Node.js).
6. Copy the connection string. It will look like:
   ```
   mongodb+srv://kirbite_admin:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
   Replace `<password>` with your actual password, and insert database name `kirbite` before `?`:
   ```
   mongodb+srv://kirbite_admin:YourSecretPassword@cluster0.abcde.mongodb.net/kirbite?retryWrites=true&w=majority
   ```

---

### STEP 2: Deploy Backend to Render

1. Push your project code to a **GitHub** repository (e.g. `github.com/your-username/kirbite`).
2. Go to [render.com](https://render.com) and log in.
3. Click **New +** ➔ select **Web Service**.
4. Connect your GitHub repository.
5. Configure the following fields:
   - **Name**: `kirbite-backend`
   - **Language / Runtime**: `Node`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`
6. Click **Advanced** ➔ **Add Environment Variables**:
   | Key | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Production mode |
   | `PORT` | `10000` | Render default port |
   | `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string from Step 1 |
   | `CLIENT_URL` | `*` | Or your Cloudflare Pages URL once deployed |
7. Click **Create Web Service**.
8. Render will deploy your service. Once deployed, note down your backend URL (e.g. `https://kirbite-backend.onrender.com`).
9. Test by opening `https://kirbite-backend.onrender.com/api/health` in your browser. You should see:
   ```json
   { "status": "ok", "app": "Kirbite API (Campus Food Delivery)" }
   ```

---

### STEP 3: Deploy Frontend to Cloudflare Pages

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com/) and log in.
2. In the sidebar, navigate to **Workers & Pages** ➔ click **Create Application** ➔ select the **Pages** tab.
3. Click **Connect to Git** and choose your `kirbite` GitHub repository.
4. Configure the Build settings:
   - **Project Name**: `kirbite`
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`
5. Under **Environment variables (advanced)**, click **Add variable**:
   | Variable name | Value |
   |---|---|
   | `VITE_BACKEND_URL` | `https://kirbite-backend.onrender.com` |
   *(Use your actual Render backend URL from Step 2 without any trailing slash)*
6. Click **Save and Deploy**.
7. Cloudflare Pages will build and deploy your app in ~45 seconds, providing a global SSL URL like `https://kirbite.pages.dev`!

---

### STEP 4: Seed Initial Campus Stalls to Production MongoDB

To populate your MongoDB Atlas database with Kirba Chowk stalls and dishes:

From your local machine terminal:
```bash
cd server
$env:MONGODB_URI="mongodb+srv://kirbite_admin:YourSecretPassword@cluster0.abcde.mongodb.net/kirbite?retryWrites=true&w=majority"
npm run seed
```
*(On Linux/macOS: `MONGODB_URI="mongodb+srv://..." npm run seed`)*

This will insert all stalls (*Sharma Ji Fast Food*, *Biryani & Roll Corner*, *South Express Dosa*, etc.) and menu items directly into MongoDB Atlas.

---

## 💻 Local Development

```bash
# Start backend (http://localhost:5000)
cd server
npm install
npm run dev

# Start frontend (http://localhost:5173) in a second terminal
cd client
npm install
npm run dev
```
