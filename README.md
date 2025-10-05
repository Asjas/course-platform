# Codewizard Training - Course Platform

A modern, full-stack course platform for teaching web development skills
including Fastify, JavaScript, TypeScript, and more. Built with React, Fastify,
and Tauri for web, server, and native applications.

[![CI/CD](https://github.com/Asjas/course-platform/workflows/CI/badge.svg)](https://github.com/Asjas/course-platform/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-green)](https://nodejs.org/)

## 🚀 Features

- **Course Management**: Interactive lessons with video content and progress
  tracking
- **Multi-Platform Support**: Web application, HTTP API server, and native
  desktop app
- **Authentication System**: Secure user registration, login, and session
  management with Better Auth
- **Payment Processing**: Integrated with Polar for transparent course purchases
- **Real-time Communication**: Chat system for student-instructor interaction
- **Help Desk System**: Support ticket system for student assistance
- **Responsive Design**: Modern UI with dark theme and mobile-first approach
- **Progressive Web App**: Offline support and native-like experience
- **MDX Blog**: Built-in blog system with syntax highlighting
- **Team Licenses**: Support for organization-wide course purchases

## 🏗️ Architecture

This is a monorepo containing three main applications and shared packages:

### `/apps/web/` - Frontend Application

- **Framework**: React 19 with TypeScript
- **Routing**: TanStack Router with file-based routing
- **Styling**: Tailwind CSS with custom components and Lucide icons
- **State Management**: TanStack Query for server state
- **Forms**: TanStack Form with validation
- **Authentication**: Better Auth client integration
- **Build Tool**: Vite with PWA support and Lightning CSS
- **Testing**: Vitest for unit and integration tests

### `/apps/server/` - Backend API

- **Framework**: Fastify with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with Argon2 password hashing
- **Caching**: Redis for performance optimization
- **Payments**: Polar integration for course purchases
- **Email**: Nodemailer integration for notifications
- **Security**: Rate limiting, CORS, helmet security headers
- **Observability**: OpenTelemetry integration
- **Testing**: Vitest for API testing

### `/apps/web/tauri-src/` - Native Desktop Application

- **Frontend**: React with TypeScript (shared components from `/apps/web`)
- **Native Layer**: Tauri (Rust-based)
- **Cross-Platform**: Windows, macOS, and Linux support
- **Features**: Native file system access, system tray integration

### `/packages/shared-ui/` - Shared Component Library

- Reusable UI components across applications
- Consistent design system and theming
- Radix UI primitives for accessible components

### `/marketing/learn-fastify/` - Marketing Site

- **Framework**: Astro for static site generation
- **Styling**: Tailwind CSS
- **Deployment**: Nginx Docker container

## 🛠️ Technology Stack

**Frontend:**

- React 19 + TypeScript
- TanStack Router, Query, Form, and Table
- Tailwind CSS + Radix UI + Lucide Icons
- Vite + PWA Plugin + Lightning CSS
- MDX for content with syntax highlighting

**Backend:**

- Fastify + TypeScript
- Drizzle ORM + PostgreSQL
- Redis for caching
- Better Auth for authentication
- Argon2 for password hashing
- Polar for payment processing
- OpenTelemetry for observability

**Native:**

- Tauri (Rust + React)
- Cross-platform desktop support

**DevOps & Tools:**

- pnpm workspace management (Turborepo enabled)
- Vitest for testing
- Cypress for E2E testing
- Docker + Docker Compose
- GitHub Actions CI/CD
- CodeQL security scanning
- ESLint + Prettier for code quality

## 🚦 Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10+
- PostgreSQL database
- Dragonfly (Redis) server
- Rust (for native app development)
- Docker and Docker Compose (optional, for containerized development)

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
   # Edit the .env files with your actual values
   ```

4. **Database setup**

   ```bash
   # Generate and run migrations
   pnpm run -filter "./apps/server" drizzle:generate
   pnpm run -filter "./apps/server" drizzle:migrate

   # (Optional) Seed database with sample data
   pnpm run -filter "./apps/server" db:seed
   ```

5. **Start development servers**

   ```bash
   # Start all applications
   pnpm run dev

   # Or start individually
   pnpm run -filter "./apps/web" dev      # Frontend (http://localhost:4137)
   pnpm run -filter "./apps/server" dev   # Backend API (http://localhost:3000)
   pnpm run -filter "./apps/web/tauri-src" dev # Native app
   pnpm run -filter "./marketing/learn-fastify" dev # Marketing site
   ```

### Using Docker Compose (Alternative)

```bash
# Start all services with Docker
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📝 Available Scripts

### Root Level

- `pnpm run dev` - Start all development servers
- `pnpm run build` - Build all applications for production
- `pnpm run test` - Run tests across all packages
- `pnpm run typecheck` - Type checking across workspace
- `pnpm run lint` - Lint all packages
- `pnpm run format` - Format code with Prettier

### Web Application (`apps/web/`)

- `pnpm run dev` - Development server with hot reload
- `pnpm run build` - Production build
- `pnpm run test` - Run Vitest tests
- `pnpm run test:watch` - Run tests in watch mode
- `pnpm run preview` - Preview production build
- `pnpm run typecheck` - TypeScript type checking

### Server Application (`apps/server/`)

- `pnpm run dev` - Development server with hot reload
- `pnpm run build` - Compile TypeScript
- `pnpm run start` - Start production server
- `pnpm run test` - Run API tests
- `pnpm run drizzle:studio` - Open Drizzle Studio (database GUI)
- `pnpm run drizzle:generate` - Generate database migrations
- `pnpm run drizzle:migrate` - Run database migrations
- `pnpm run db:seed` - Seed database with sample data

### Native Application (`apps/tauri-app/`)

- `pnpm run dev` - Development with hot reload
- `pnpm run build` - Build native executable
- `pnpm run tauri` - Tauri CLI commands

### Marketing Site (`marketing/learn-fastify/`)

- `pnpm run dev` - Development server
- `pnpm run build` - Build static site
- `pnpm run preview` - Preview production build

## 🗂️ Project Structure

```sh
course-platform/
├── apps/
│   ├── web/                 # React frontend application
│   │   ├── src/
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── routes/      # File-based routing (TanStack Router)
│   │   │   ├── lib/         # Utilities and helpers
│   │   │   └── assets/      # Static assets
│   │   ├── public/          # Public files (favicon, images)
│   │   └── index.html       # Entry HTML file
│   ├── server/              # Fastify backend API
│   │   ├── src/
│   │   │   ├── routes/      # API endpoints
│   │   │   ├── db/          # Database queries and mutations
│   │   │   │   ├── schema/  # Drizzle ORM schemas
│   │   │   │   ├── queries/ # Database query functions
│   │   │   │   └── mutations/ # Database mutation functions
│   │   │   ├── lib/         # Server utilities (auth, logging, redis)
│   │   │   └── plugins/     # Fastify plugins
│   │   ├── drizzle/         # Database migrations
│   │   └── tests/           # API tests
│   └── tauri-app/           # Native desktop application
│       ├── src/             # React frontend (shared with web)
│       └── src-tauri/       # Rust native layer
├── packages/
│   └── shared-ui/           # Shared component library
│       └── components/      # Reusable UI components (Card, Button, etc.)
├── marketing/
│   └── learn-fastify/       # Marketing landing page (Astro)
├── .github/
│   ├── workflows/           # CI/CD pipelines
│   ├── instructions/        # Development guidelines for Copilot
│   └── prompts/             # Copilot custom prompts
├── docker-compose.yml       # Local development environment
├── turbo.json              # Turborepo configuration
└── pnpm-workspace.yaml     # pnpm workspace configuration
```

## 🔐 Environment Variables

### Server (`apps/server/.env`)

```env
# Server Configuration
PORT=8080
NODE_ENV=development
HOST=localhost

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/course_platform

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Authentication (Better Auth)
BETTER_AUTH_SECRET=your-auth-secret-min-32-chars
BETTER_AUTH_URL=http://localhost:8080
PEPPER_SECRET=your-pepper-secret-min-32-chars

# Email (Nodemailer)
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=your-email@example.com
MAIL_PASS=your-email-password
MAIL_FROM=noreply@codewizard.training

# Polar Payment Integration
POLAR_ACCESS_TOKEN=your-polar-access-token
POLAR_WEBHOOK_SECRET=your-polar-webhook-secret

# OpenTelemetry (Optional)
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

### Web (`apps/web/.env`)

```env
# Better Auth
VITE_BETTER_AUTH_URL=http://localhost:8080

# API URL
VITE_API_URL=http://localhost:8080
```

## 🧪 Testing

### Unit and Integration Tests

```bash
# Run all tests
pnpm run test

# Run tests for specific app
pnpm run -filter "./apps/web" test
pnpm run -filter "./apps/server" test

# Watch mode
pnpm run -filter "./apps/web" test:watch

# Coverage
pnpm run -filter "./apps/web" test:coverage
```

### End-to-End Tests (Cypress)

```bash
# Install Playwright browsers (first time only)
pnpx install cypress

# Run E2E tests
pnpm run -filter "./apps/web" test:e2e:run

# Run E2E tests in UI mode
pnpm run -filter "./apps/web" test:e2e
```

### Security Testing

- **CodeQL**: Automatic security scanning via GitHub Actions
- **Dependency Audits**: Run `pnpm audit` to check for vulnerabilities
- **OWASP Guidelines**: Code follows secure coding practices (see
  `.github/instructions/security-and-owasp.instructions.md`)

## 🚀 Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# Stop containers
docker-compose down
```

### Manual Deployment

```bash
# Build all applications
pnpm run build

# Start production server
cd apps/server && pnpm start

# Serve frontend (use a static file server or reverse proxy)
cd apps/web && pnpm preview
```

### Recommended Production Setup

1. **Frontend**: Deploy to Vercel, Netlify, or serve via Nginx/Apache
2. **Backend**: Deploy to VPS, AWS, or containerized environment
   (Docker/Kubernetes)
3. **Database**: Managed PostgreSQL (AWS RDS, Digital Ocean, Neon, Supabase)
4. **Redis**: Managed Redis (Upstash, Redis Cloud, AWS ElastiCache)
5. **Monitoring**: Set up OpenTelemetry collectors and observability platform

### Environment Variables in Production

Ensure all production environment variables are securely configured:

- Use secrets management (AWS Secrets Manager, HashiCorp Vault, etc.)
- Enable HTTPS/TLS for all communications
- Set `NODE_ENV=production`
- Configure proper CORS origins
- Set secure session cookies (`Secure`, `HttpOnly`, `SameSite` flags)

## 🔒 Security

This project follows security best practices:

- **Authentication**: Better Auth with Argon2 password hashing
- **Session Management**: Secure session cookies with HttpOnly and SameSite
  flags
- **HTTPS**: All production traffic encrypted via TLS
- **Input Validation**: All user inputs validated and sanitized
- **SQL Injection Prevention**: Parameterized queries via Drizzle ORM
- **XSS Prevention**: Context-aware output encoding
- **CSRF Protection**: Built-in CSRF protection via Better Auth
- **Rate Limiting**: API rate limiting to prevent abuse
- **Security Headers**: Helmet middleware for security headers
- **Dependency Scanning**: Automated dependency vulnerability checks

See [SECURITY.md](SECURITY.md) for reporting security vulnerabilities.

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following our coding guidelines
4. Write tests for new features
5. Commit changes using conventional commits
   (`git commit -m 'feat: add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines

- **Code Quality**: Follow TypeScript strict mode, use ESLint and Prettier
- **Commits**: Use conventional commits (feat, fix, docs, style, refactor, test,
  chore)
- **Testing**: Write tests for all new features and bug fixes
- **Accessibility**: Follow WCAG 2.2 Level AA guidelines (see
  `.github/instructions/a11y.instructions.md`)
- **Security**: Follow OWASP guidelines (see
  `.github/instructions/security-and-owasp.instructions.md`)
- **Performance**: Consider performance implications (see
  `.github/instructions/performance-optimization.instructions.md`)
- **Documentation**: Update relevant documentation for changes

### Code Review Process

All pull requests require:

- Passing CI/CD checks
- Code review approval
- Test coverage maintained or improved
- Documentation updated

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

## 🙏 Acknowledgments

- Built with modern web technologies and best practices
- Inspired by the need for quality web development education
- Thanks to the open-source community for amazing tools:
  - [React](https://react.dev/)
  - [Fastify](https://fastify.dev/)
  - [Tauri](https://tauri.app/)
  - [TanStack](https://tanstack.com/)
  - [Drizzle ORM](https://orm.drizzle.team/)
  - [Better Auth](https://www.better-auth.com/)
  - [Polar](https://polar.sh/)

## 📞 Support

- **Website**: [https://codewizard.training](https://codewizard.training)
- **Email**: [contact@codewizard.training](mailto:contact@codewizard.training)
- **Issues**: [GitHub Issues](https://github.com/Asjas/course-platform/issues)
- **Uptime Status**:
  [https://uptimekuma.codewizard.training/status/codewizard-training](https://uptimekuma.codewizard.training/status/codewizard-training)

### Getting Help

- Check the [Issues](https://github.com/Asjas/course-platform/issues) page for
  known issues
- Review documentation in `.github/instructions/` for development guidance
- Contact support via email for course-related questions

---

**Made with ❤️ by Codewizard Training**
