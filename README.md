# 🎟️ TicketZone

**TicketZone** is a modern event ticketing platform built with **Next.js 15**, **TypeScript**, and **MongoDB**. It enables users to browse events, purchase tickets with flexible pricing, and check in securely using QR codes linked to personal identity.

---

## 🚀 Features

- 🔐 Authentication with JWT stored in cookies  
- 🛒 Ticket purchasing with:
  - Dynamic pricing (standard, VIP, early-bird)
  - Bundles and group packages
  - Real-time availability
- 📲 QR code generation for digital ticket access
- 🆔 Identity-linked tickets (QR codes tied to user ID or document)
- 🎨 Responsive UI with Tailwind CSS

---

## ⚙️ Requirements

- Node.js **20+**
- MongoDB instance

---

## 🧪 Unit Testing

### ✅ Why We Test

Unit testing ensures core features like pricing, ticket generation, and check-in flow work reliably. This is crucial when handling payments and enforcing entry based on personal identity.

Testing allows us to:

- Ensure pricing logic and availability are enforced correctly
- Verify QR codes are valid, unique, and identity-bound
- Catch edge cases like reused tickets or mismatched user identities

### 🛠️ How We Test

We use **Jest** with **ts-jest**. Tests are organized in the `__tests__/` directory and use mocked database and identity sessions to isolate behavior.

#### 🔍 Sample Coverage

- **POST `/api/tickets`**
  - Validates required fields (event ID, type, quantity)
  - Checks pricing rules and inventory limits
- **GET `/api/tickets`**
  - Ensures QR code is attached
  - Filters for logged-in user's tickets only
- **POST `/api/checkin`**
  - Accepts valid, unused QR codes
  - Rejects reused or mismatched QR entries

### ▶️ Running Tests

Run all tests:

```bash
npm test
```
Run a specific file:
```
npx jest __tests__/api/tickets.test.ts
```
🏗️ Project Structure
app/
├── api/
│   ├── auth/        # User auth API (register, login, logout)
│   ├── tickets/     # Ticket creation & listing
│   └── checkin/     # QR code check-in logic
├── lib/             # Utility functions (DB, JWT, QR)
├── models/          # Mongoose schemas: User, Event, Ticket
├── components/      # UI components
├── styles/          # Tailwind CSS via CDN
└── __tests__/       # Jest unit tests

📝 Getting Started
Configure environment variables:
Create a .env.local file in the project root:
MONGODB_URI=<your MongoDB connection string>
JWT_SECRET=<your secret string>

💡 Notes
-Dynamic pricing and availability logic is handled per event and tier.

-QR codes are tied to the user's identity (e.g., ID card or internal profile).

-Check-ins enforce one-time use and identity matching for secure entry.

-This architecture is modular and extendable for payment integration, admin tools, and analytics.

⚠️ Disclaimer
This project is provided for educational and prototyping purposes only. Not intended for production without further security and testing layers.

