# BookStore Backend (Node.js/Express)

## Setup

1. Copy `.env` and fill in your MySQL credentials and JWT secret.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```

## API Endpoints
- `POST /api/auth/login` — Login with username and password
- `GET /api/auth/profile` — Get current user profile (JWT required)
- `POST /api/auth/change-password` — Change password (JWT required)

## Next Steps
- Add routes for users, items, sales, approvals, analytics, etc.
- Protect routes with role-based middleware as needed.

## Database
- Uses your existing MySQL schema (`bookstore_management`) 