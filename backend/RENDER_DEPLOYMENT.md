# Render Deployment Guide for PostgreSQL

## Prerequisites
- A Render account
- Your backend code pushed to a Git repository

## Step 1: Create PostgreSQL Database on Render

1. Go to your Render dashboard
2. Click "New" → "PostgreSQL"
3. Configure your database:
   - **Name**: `bookstore-db` (or your preferred name)
   - **Database**: `bookstore_management`
   - **User**: Will be auto-generated
   - **Region**: Choose closest to your users
   - **PostgreSQL Version**: Latest stable (15 or 16)
4. Click "Create Database"
5. Note down the connection details from the "Connections" tab

## Step 2: Create Web Service

1. In your Render dashboard, click "New" → "Web Service"
2. Connect your Git repository
3. Configure the service:
   - **Name**: `bookstore-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Choose appropriate plan (Free tier available)

## Step 3: Configure Environment Variables

In your web service settings, add these environment variables:

```bash
NODE_ENV=production
PORT=10000
DB_HOST=your-postgres-database-host.render.com
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=bookstore_management
DB_PORT=5432
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=info
BCRYPT_ROUNDS=12
```

**Important**: Replace the placeholder values with your actual database credentials from Step 1.

## Step 4: Deploy and Setup Database

1. Deploy your service
2. Once deployed, connect to your PostgreSQL database using a tool like:
   - pgAdmin
   - DBeaver
   - psql command line
   - Render's built-in SQL editor

3. Run the database setup script:
   ```sql
   -- Copy and paste the contents of setup_postgres_database.sql
   -- This will create all tables and insert default data
   ```

## Step 5: Test Your API

Your API will be available at:
```
https://your-service-name.onrender.com
```

Test the endpoints:
- `GET /api/settings/public` - Should return public settings
- `POST /api/auth/login` - Login with admin/admin123

## Step 6: Update Frontend (if applicable)

Update your frontend CORS settings to point to your new Render backend URL.

## Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Check environment variables
   - Verify database is running
   - Check firewall settings

2. **Port Issues**
   - Render uses port 10000 by default
   - Make sure your app listens on `process.env.PORT`

3. **SSL Issues**
   - Render databases require SSL
   - The connection is configured automatically in `config/db.js`

### Logs

Check your service logs in the Render dashboard for any errors.

## Security Notes

- Never commit `.env` files to Git
- Use strong, unique passwords for database
- Regularly rotate JWT secrets
- Enable HTTPS (automatic on Render)

## Cost Optimization

- Free tier: 750 hours/month
- Database: $7/month minimum
- Consider stopping services when not in use 