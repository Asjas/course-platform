# Codewizard Training - Course Platform

A modern, full-stack course platform for teaching web development skills including Fastify, JavaScript, TypeScript, and more. Built with React, Fastify, and Tauri for web, server, and native applications.

## 🚀 Features

- **Course Management**: Interactive lessons with video content and progress tracking
- **Multi-Platform Support**: Web application, REST API server, and native desktop app
- **Authentication System**: Secure user registration, login, and session management
- **Payment Processing**: Course purchases with transparent pricing
- **Real-time Communication**: Chat system for student-instructor interaction
- **Help Desk System**: Support ticket system for student assistance
- **Responsive Design**: Modern UI with dark theme and mobile-first approach
- **Progressive Web App**: Offline support and native-like experience

## 🏗️ Architecture

This is a monorepo containing three main applications:

### `/apps/web/` - Frontend Application

- **Framework**: React 19 with TypeScript
- **Routing**: TanStack Router with file-based routing
- **Styling**: Tailwind CSS with custom components
- **State Management**: TanStack Query for server state
- **Authentication**: Better Auth integration
- **Build Tool**: Vite with PWA support

### `/apps/server/` - Backend API

- **Framework**: Fastify with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with session management
- **Caching**: Redis for performance optimization
- **Security**: Rate limiting, CORS, and security headers
- **Email**: Nodemailer integration for notifications

### `/apps/tauri-app/` - Native Desktop Application

- **Frontend**: React with TypeScript (shared components)
- **Native Layer**: Tauri (Rust-based)
- **Cross-Platform**: Windows, macOS, and Linux support

### `/packages/shared-ui/` - Shared Component Library

- Reusable UI components across applications
- Consistent design system and theming

## 🛠️ Technology Stack

**Frontend:**

- React 19 + TypeScript
- TanStack Router, Query, Form
- Tailwind CSS + Radix UI
- Vite + PWA Plugin
- MDX for content

**Backend:**

- Fastify + TypeScript
- Drizzle ORM + PostgreSQL
- Redis for caching
- Better Auth for authentication
- Argon2 for password hashing

**Native:**

- Tauri (Rust + React)
- Cross-platform desktop support

**DevOps & Tools:**

- pnpm workspace management
- Vitest for testing
- Docker containerization
- GitHub Actions CI/CD
- CodeQL security scanning

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9+
- PostgreSQL database
- Redis server
- Rust (for native app development)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Asjas/course-platform.git
   cd course-platform
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment setup**

   ```bash
   # Copy environment files
   cp apps/server/.env.sample apps/server/.env
   cp apps/web/.env.sample apps/web/.env

   # Configure your database and Redis connections
   ```

4. **Database setup**

   ```bash
   # Generate and run migrations
   pnpm run -filter "./apps/server" drizzle:generate
   pnpm run -filter "./apps/server" drizzle:migrate
   ```

5. **Start development servers**

   ```bash
   # Start all applications
   pnpm run dev

   # Or start individually
   pnpm run -filter "./apps/web" dev      # Frontend (http://localhost:3000)
   pnpm run -filter "./apps/server" dev   # Backend API (http://localhost:8080)
   pnpm run -filter "./apps/tauri-app" dev # Native app
   ```

## 📝 Available Scripts

### Root Level

- `pnpm run dev` - Start all development servers
- `pnpm run build` - Build all applications for production
- `pnpm run test` - Run tests across all packages
- `pnpm run typecheck` - Type checking across workspace

### Web Application (`apps/web/`)

- `pnpm run dev` - Development server
- `pnpm run build` - Production build
- `pnpm run test` - Run Vitest tests
- `pnpm run preview` - Preview production build

### Server Application (`apps/server/`)

- `pnpm run dev` - Development server with hot reload
- `pnpm run build` - Compile TypeScript
- `pnpm run start` - Start production server
- `pnpm run test` - Run API tests
- `pnpm run drizzle:studio` - Open database studio

### Native Application (`apps/tauri-app/`)

- `pnpm run dev` - Development with hot reload
- `pnpm run build` - Build native executable
- `pnpm run tauri` - Tauri CLI commands

## 🗂️ Project Structure

```
course-platform/
├── apps/
│   ├── web/                 # React frontend application
│   │   ├── src/
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── routes/      # File-based routing
│   │   │   ├── lib/         # Utilities and helpers
│   │   │   └── assets/      # Static assets
│   │   └── public/          # Public files
│   ├── server/              # Fastify backend API
│   │   ├── src/
│   │   │   ├── routes/      # API endpoints
│   │   │   ├── db/          # Database queries and mutations
│   │   │   ├── lib/         # Server utilities
│   │   │   └── plugins/     # Fastify plugins
│   │   └── tests/           # API tests
│   └── tauri-app/           # Native desktop application
│       ├── src/             # React frontend (shared with web)
│       └── src-tauri/       # Rust native layer
├── packages/
│   └── shared-ui/           # Shared component library
├── .github/
│   ├── workflows/           # CI/CD pipelines
│   └── instructions/        # Development guidelines
└── docker-compose.yml       # Local development environment
```

## 🔐 Environment Variables

### Server (`apps/server/.env`)

```env
PORT=8080
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/course_platform
REDIS_HOST=localhost
REDIS_PORT=6379
BETTER_AUTH_SECRET=your-auth-secret
PEPPER_SECRET=your-pepper-secret
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=your-email@example.com
MAIL_PASS=your-email-password
```

### Web (`apps/web/.env`)

```env
VITE_BETTER_AUTH_URL=http://localhost:8080
```

## 🧪 Testing

- **Unit Tests**: Vitest for component and utility testing
- **Integration Tests**: API endpoint testing with Fastify
- **E2E Tests**: Planned Playwright integration
- **Security**: CodeQL analysis for vulnerabilities

```bash
# Run all tests
pnpm run test

# Run tests for specific app
pnpm run -filter "./apps/web" test
pnpm run -filter "./apps/server" test

# Watch mode
pnpm run -filter "./apps/web" test:watch
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment

```bash
# Build all applications
pnpm run build

# Start production server
cd apps/server && pnpm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Use conventional commits
- Write tests for new features
- Ensure accessibility compliance
- Follow security best practices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by the need for quality web development education
- Thanks to the open-source community for the amazing tools

## 📞 Support

- **Website**: [https://codewizard.training](https://codewizard.training)
- **Issues**: [GitHub Issues](https://github.com/Asjas/course-platform/issues)
- **Documentation**: Available in the `/docs` folder

---

**Made with ❤️ by Codewizard**
