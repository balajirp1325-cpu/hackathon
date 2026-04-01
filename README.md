# FoodBridge Backend

A production-ready Node.js + Express + PostgreSQL backend for the FoodBridge food donation platform.

---

## Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express 4
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT (access + refresh tokens) + bcrypt
- **Real-time**: Socket.io
- **Storage**: Cloudinary (image uploads)
- **Validation**: Zod
- **Logging**: Winston + Morgan
- **Jobs**: node-cron
- **Containerization**: Docker + Docker Compose

---

## Project Structure

```
src/
├── app.js                  # Express app setup
├── server.js               # HTTP server + Socket.io + cron boot
├── config/
│   ├── database.js         # Prisma client singleton
│   └── cloudinary.js       # Cloudinary + Multer config
├── controllers/            # Route handlers (thin layer)
├── services/               # Business logic
├── routes/                 # Express routers
├── middlewares/
│   ├── auth.middleware.js  # JWT authenticate + authorize
│   └── error.middleware.js # Centralised error handler
├── validators/             # Zod schemas + validate() helper
├── sockets/                # Socket.io init + event handlers
├── jobs/                   # node-cron jobs
└── utils/
    ├── haversine.js        # Distance calculation
    ├── logger.js           # Winston logger
    └── response.js         # Consistent API responses
prisma/
├── schema.prisma           # Database models
└── seed.js                 # Test data seeder
```

---

## Quick Start

### Option A — Docker (recommended)

```bash
git clone <repo>
cd foodbridge

# Copy env and fill in Cloudinary + any overrides
cp .env.example .env

# Start Postgres + API
docker-compose up --build

# In another terminal, run migrations and seed
docker exec -it foodbridge_api npx prisma migrate deploy
docker exec -it foodbridge_api node prisma/seed.js
```

API: http://localhost:5000

### Option B — Local

**Prerequisites**: Node 20, PostgreSQL 15

```bash
npm install

# Set up .env
cp .env.example .env
# Edit DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, Cloudinary keys

# Run migrations + generate Prisma client
npx prisma migrate dev --name init
npx prisma generate

# Seed test data
node prisma/seed.js

# Start dev server
npm run dev
```

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `JWT_SECRET` | Access token signing key | ✅ |
| `JWT_REFRESH_SECRET` | Refresh token signing key | ✅ |
| `JWT_EXPIRES_IN` | Access token TTL (e.g. `15m`) | ✅ |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL (e.g. `7d`) | ✅ |
| `PORT` | Server port (default: 5000) | |
| `CLIENT_URL` | Frontend origin for CORS | |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | ✅ |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ✅ |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | ✅ |
| `GOOGLE_MAPS_API_KEY` | Maps API key (optional) | |

---

## API Reference

All endpoints are prefixed with `/api`. Protected routes require:
```
Authorization: Bearer <access_token>
```

### Auth — `/api/auth`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/signup` | ❌ | any | Register with role DONOR / NGO / VOLUNTEER |
| POST | `/login` | ❌ | any | Login, returns access + refresh tokens |
| POST | `/refresh` | ❌ | any | Exchange refresh token for new pair |
| POST | `/logout` | ❌ | any | Revoke refresh token |
| GET | `/me` | ✅ | any | Get own profile |
| PATCH | `/me` | ✅ | any | Update profile / location |

**Signup body**
```json
{
  "name": "Ravi Kumar",
  "email": "ravi@example.com",
  "password": "password123",
  "role": "DONOR",
  "phone": "9876543210",
  "latitude": 12.9716,
  "longitude": 77.5946
}
```

**Login response**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "name": "...", "role": "DONOR" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

---

### Food Listings — `/api/food`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/` | ✅ | DONOR | Create listing (multipart/form-data) |
| GET | `/nearby` | ✅ | any | Get listings sorted by proximity |
| GET | `/:id` | ✅ | any | Get single listing |
| GET | `/my/listings` | ✅ | DONOR | Donor's own listings |
| GET | `/my/requests` | ✅ | DONOR | Requests on donor's listings |
| PATCH | `/:id` | ✅ | DONOR | Update listing |
| DELETE | `/:id` | ✅ | DONOR | Delete listing |
| POST | `/:id/claim` | ✅ | NGO | Claim food listing |

**Create listing** (form-data)
```
title         string   required
quantity      number   required
foodType      VEG | NON_VEG | COOKED | RAW | PACKAGED
latitude      float    required
longitude     float    required
expiryTime    ISO date required
description   string   optional
address       string   optional
image         file     optional (jpg/png/webp, max 5MB)
```

**GET /nearby query params**
```
lat       float   (defaults to profile location)
lng       float
radius    number  km, default 10
foodType  string  optional filter
```

**Listing status flow**
```
AVAILABLE → CLAIMED (when NGO claims)
AVAILABLE → EXPIRED (cron job after expiryTime)
```

---

### Requests — `/api/requests`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/my` | ✅ | NGO | NGO's own claim requests |

---

### Deliveries — `/api/deliveries`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/available` | ✅ | VOLUNTEER | List open deliveries |
| POST | `/:requestId/accept` | ✅ | VOLUNTEER | Accept a delivery |
| PATCH | `/:id/status` | ✅ | VOLUNTEER | Update delivery status |
| GET | `/my` | ✅ | VOLUNTEER | Volunteer's deliveries |

**Update status body**
```json
{
  "status": "PICKED",
  "currentLat": 12.9716,
  "currentLng": 77.5946
}
```

**Delivery status flow**
```
ASSIGNED → PICKED → IN_TRANSIT → DELIVERED
```

---

### Notifications — `/api/notifications`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/notifications` | ✅ | Get paginated notifications |
| PATCH | `/notifications/:id/read` | ✅ | Mark one as read |
| PATCH | `/notifications/read-all` | ✅ | Mark all as read |

---

### Ratings — `/api/ratings`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/ratings` | ✅ | Submit rating (1–5 stars) |
| GET | `/ratings/:userId` | ✅ | Get a user's received ratings |

**Submit rating body**
```json
{
  "toUserId": "uuid",
  "deliveryId": "uuid",
  "rating": 5,
  "review": "Very professional!"
}
```

---

### Cancelled Orders — `/api/cancelled-orders`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/cancelled-orders` | ✅ | NGO | List unclaimed cancelled restaurant orders |
| POST | `/cancelled-orders/:id/claim` | ✅ | NGO | Claim a cancelled order |

Query params: `lat`, `lng`, `radius` (default 15 km)

---

## Socket.io Events

Connect with:
```js
const socket = io('http://localhost:5000', {
  auth: { token: '<access_token>' }
});
```

**Client → Server**

| Event | Payload | Description |
|---|---|---|
| `join_location_room` | `{ city: "bengaluru" }` | Join a city-based broadcast room |
| `leave_location_room` | `{ city: "bengaluru" }` | Leave city room |
| `update_location` | `{ deliveryId, lat, lng }` | Volunteer broadcasts live location |
| `track_delivery` | `{ deliveryId }` | Join a delivery tracking room |

**Server → Client**

| Event | Payload | Description |
|---|---|---|
| `new_listing` | FoodListing object | New food listed near NGO |
| `notification` | Notification object | Real-time notification |
| `delivery_update` | Delivery object | Status changed |
| `volunteer_location` | `{ deliveryId, lat, lng }` | Volunteer's live location |

---

## Cron Jobs

| Schedule | Job | Description |
|---|---|---|
| Every minute | Expire listings | Marks AVAILABLE listings as EXPIRED after expiryTime |
| Every hour | Cleanup refresh tokens | Deletes expired refresh tokens from DB |
| Every 10 min | Cleanup cancelled orders | Removes expired cancelled restaurant orders |

---

## Seeded Test Accounts

After running `node prisma/seed.js`:

| Role | Email | Password |
|---|---|---|
| DONOR | donor@foodbridge.dev | password123 |
| NGO | ngo@foodbridge.dev | password123 |
| VOLUNTEER | volunteer@foodbridge.dev | password123 |

---

## Deployment

### Backend — Railway or Render

1. Push to GitHub
2. Create a new service pointing to this repo
3. Set all env vars from `.env.example`
4. Add PostgreSQL add-on (Railway) or connect external DB
5. Set start command: `npx prisma migrate deploy && node src/server.js`

### Frontend — Vercel

Point `NEXT_PUBLIC_API_URL` to your Railway/Render backend URL.

---

## Postman

Import `FoodBridge.postman_collection.json` into Postman. Run the Login request first — it auto-saves the access token for all subsequent requests.
