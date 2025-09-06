# Code-A-Thon Frontend

A modern React application built with Vite, featuring beautiful animations, icons, and a comprehensive user management system.

## Features

- ⚡ **Vite** - Fast build tool and development server
- ⚛️ **React 19** - Latest React with modern features
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🎭 **Framer Motion** - Beautiful animations and transitions
- 🎯 **Heroicons** - Beautiful SVG icons
- 📱 **Responsive Design** - Mobile-first approach
- 🔐 **Authentication** - JWT-based auth system
- 🎨 **Modern UI** - Glass morphism and gradient designs
- 🚨 **SweetAlert2** - Beautiful alert dialogs
- 📢 **React Toastify** - Toast notifications

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd code-a-thon
   npm install
   ```

2. **Environment Setup:**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   VITE_API_BASE_URL=http://localhost:9705
   VITE_APP_NAME="Code-A-Thon"
   VITE_NODE_ENV=development
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

## Environment Configuration

This project uses environment variables for configuration. See [ENVIRONMENT.md](./ENVIRONMENT.md) for detailed setup instructions.

### Required Variables
- `VITE_API_BASE_URL` - Backend API URL

### Optional Variables  
- `VITE_APP_NAME` - Application name
- `VITE_APP_VERSION` - App version
- `VITE_NODE_ENV` - Environment type

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/
│   ├── auth/          # Authentication components
│   ├── common/        # Reusable components
│   ├── user/          # User management
│   └── admin/         # Admin components
├── config/            # Configuration files
├── context/           # React context providers
├── pages/             # Page components
└── services/          # API services
```

## Technologies

- **React 19** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Heroicons** - Icons
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **React Router** - Routing
- **SweetAlert2** - Alerts
- **React Toastify** - Notifications
