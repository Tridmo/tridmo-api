# Tridmo API

> ⚠️ **NOTICE**  
> This repository is public for transparency and educational reference only.  
> You are **not allowed** to use, copy, modify, or redistribute the code in any way without explicit permission from the author.
> 
> 🔒 All rights reserved. See [LICENSE](./LICENSE) for details.

## 🏢 About Tridmo

Tridmo is a comprehensive **3D furniture and interior design platform** that connects furniture brands, interior designers, and end customers. The platform enables users to visualize, customize, and purchase furniture in realistic 3D environments.

### Core Business Components

- **👤 Designer Platform**: Tools for interior designers to create and visualize spaces
- **🏢 Brand Admin Dashboard**: Management interface for furniture brands to showcase their products
- **⚙️ Admin Dashboard**: Platform administration and content management
- **🌐 Landing Page**: Public-facing website and marketing content

### Key Features

- **3D Model Management**: Upload, manage, and display furniture models with materials and colors
- **Interior Design**: Create and visualize interior spaces with furniture placement
- **Multi-Platform Support**: Support for different rendering platforms and interactions
- **User Management**: Role-based access control (Admin, Brand, Designer)
- **Product Catalog**: Comprehensive furniture categorization with brands, styles, materials, and colors
- **Order Management**: Complete e-commerce functionality for furniture purchases
- **Content Management**: Dynamic frontend content for websites and landing pages
- **Real-time Chat**: AI-powered chat functionality for customer support
- **File Management**: Cloud storage integration for 3D models, images, and documents

## 🛠 Technical Stack

### Backend Framework
- **Node.js** with **TypeScript** - Runtime and language
- **Express.js** - Web framework
- **Knex.js** - SQL query builder and migrations

### Database & Storage
- **PostgreSQL** - Primary database
- **Cloudflare R2** (S3-compatible) - File and image storage

### Authentication & Security
- **JWT** - Authentication tokens (access + refresh)
- **bcrypt** - Password hashing
- **Role-based access control** - Granular permissions system

### Additional Technologies
- **Sharp** - Image processing
- **TypeSafe i18n** - Internationalization
- **Nodemailer** - Email notifications
- **Express File Upload** - File handling
- **Class Validator** - Input validation

## 🏗 Project Structure

```
src/
├── config/           # Environment configuration
├── database/         # Database setup, migrations, and seeds
├── modules/          # Business logic modules
│   ├── auth/         # Authentication and authorization
│   ├── models/       # 3D furniture models management
│   ├── interiors/    # Interior design functionality
│   ├── brands/       # Brand management
│   ├── users/        # User management
│   ├── orders/       # E-commerce and ordering
│   ├── frontend/     # CMS for websites and landing pages
│   ├── chat/         # AI chat functionality
│   └── shared/       # Common utilities and middleware
├── middleware/       # Global middleware
├── i18n/            # Internationalization files
└── docs/            # API documentation
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v13 or higher)
- **npm** or **yarn**

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tridmo-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory with the following variables:

   ```env
   # Database
   DB_URL=postgresql://user:password@localhost:5432/tridmo_db
   PG_HOST=localhost
   PG_PORT=5432
   PG_USER=postgres
   PG_PASSWORD=your_password
   PG_DB_NAME=tridmo_db

   # Server
   HTTP_PORT=4000
   NODE_ENV=development
   LOG_LEVEL=dev
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

   # Authentication
   ACCESS_TOKEN_SECRET=your_access_token_secret
   ACCESS_TOKEN_EXPIRES_IN=15m
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   REFRESH_TOKEN_EXPIRES_IN=7d

   # Email Service
   EMAIL_USERNAME=your_email
   EMAIL_PASSWORD=your_email_password
   EMAIL_HOSTNAME=smtp.gmail.com
   EMAIL_FROM=noreply@tridmo.com

   # Cloud Storage (Cloudflare R2)
   S3_ACCOUNT_ID=your_account_id
   S3_ACCESS_ID=your_access_key
   S3_SECRET_KEY=your_secret_key
   S3_IMAGES_BUCKET_NAME=tridmo-images
   S3_FILES_BUCKET_NAME=tridmo-files
   BASE_IMG_URL=https://your-domain.com/images
   BASE_FILES_URL=https://your-domain.com/files

   # Chat API
   CHAT_API_KEY=your_chat_api_key
   CHAT_API_URL=https://api.openai.com/v1
   CHAT_EXPIRES_IN=3600

   # Admin
   ADMIN_USERNAME=admin@tridmo.com
   ```

4. **Database Setup**
   ```bash
   # Run migrations
   npm run migrate:latest

   # Seed initial data
   npm run seed:run
   ```

### Running the Application

```bash
# Development mode with auto-reload
npm run dev

# Production build
npm run build
npm start

# Watch mode (with TypeScript compilation)
npm run watch
```

The API will be available at `http://localhost:4000` (or your configured port).

### API Health Check

Visit `http://localhost:4000/health` to verify the API is running.

## 📊 Database Schema

The application uses a PostgreSQL database with the following key entities:

- **Users** - Platform users with role-based access
- **Models** - 3D furniture models with associated materials and colors
- **Interiors** - Interior design projects
- **Brands** - Furniture manufacturers and brands
- **Categories** - Product categorization system
- **Orders** - E-commerce transactions
- **Frontend Content** - CMS for websites and landing pages

## 🔐 Authentication & Authorization

### User Roles

1. **Admin** - Full platform access and management
2. **Brand** - Manage brand products and view analytics
3. **Designer** - Create interiors and manage client projects

### API Authentication

Most endpoints require authentication via JWT tokens:

```http
Authorization: Bearer <access_token>
```

### Key Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/verify` - Email verification
- `GET /api/me` - Get current user
- `POST /api/auth/refreshToken` - Refresh access token

## 📝 Development Guidelines

### Code Structure

- Use **TypeScript** with strict type checking
- Follow **modular architecture** with separate modules for each business domain
- Implement **DAO pattern** for database operations
- Use **DTOs** for request/response validation
- Apply **middleware** for authentication, validation, and error handling

### Database Operations

```bash
# Create new migration
npm run migrate:make migration_name

# Run migrations
npm run migrate:latest

# Rollback migrations
npm run migrate:rollback

# Create new seed
npm run seed:make seed_name
```

### Testing API Endpoints

The API follows RESTful conventions:

```
GET    /api/models     - List furniture models
POST   /api/models     - Create new model
GET    /api/models/:id - Get specific model
PUT    /api/models/:id - Update model
DELETE /api/models/:id - Delete model
```

## 🌐 Frontend Integration

The API supports multiple frontend applications:

- **Designer Dashboard** - Interior design tools
- **Brand Dashboard** - Brand management interface
- **Admin Dashboard** - Platform administration
- **Public Website** - Marketing and landing pages

## 📚 Documentation

Additional documentation is available in the `/src/docs` directory:

- [Authentication](./src/docs/Auth.md) - Authentication endpoints and flows
- [Categories](./src/docs/Categories.md) - Product categorization
- [Colors](./src/docs/Colors.md) - Color management
- [Materials](./src/docs/Materials.md) - Material properties
- [Styles](./src/docs/Styles.md) - Design styles

## 🤝 Contributing

This is a private project. For authorized contributors:

1. Follow the existing code style and patterns
2. Write meaningful commit messages
3. Update documentation for new features
4. Test your changes thoroughly before submitting

## 📄 License

All rights reserved. See [LICENSE](./LICENSE) for details.

## 📞 Support

For questions or support, please contact the development team.
