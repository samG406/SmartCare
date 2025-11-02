# SmartCare - Next.js Frontend Application

## Project Overview

SmartCare is a modern healthcare management platform built with Next.js, providing comprehensive solutions for patients and healthcare providers. This frontend application is part of a full-stack healthcare system designed to facilitate seamless patient-doctor interactions, appointment management, and medical record handling.

## Technology Stack

### Core Framework
- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type-safe development
- **React 18** - UI library

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
- **CSS Modules** - Component-scoped styling

### Authentication & State Management
- **JWT Tokens** - Secure authentication
- **Cookies** - Session management
- **localStorage** - Client-side data persistence

### Development Tools
- **ESLint** - Code linting and quality
- **PostCSS** - CSS processing
- **Next.js Middleware** - Route protection and authentication

## Project Structure

```
Front-end/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── doctors/           # Doctor dashboard pages
│   │   ├── patient/           # Patient dashboard pages
│   │   ├── login/             # Authentication pages
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable React components
│   │   ├── DoctorNavbar.tsx
│   │   ├── PatientNavbar.tsx
│   │   └── Button.tsx
│   ├── config/                # Configuration files
│   │   └── api.ts             # API endpoint configuration
│   ├── lib/                   # Utility libraries
│   │   ├── cookies.ts         # Cookie management
│   │   └── format.ts          # Date/time formatting
│   ├── middleware.ts          # Next.js middleware for auth
│   └── icons/                 # Static assets
├── public/                     # Public static files
├── package.json
├── next.config.ts             # Next.js configuration
├── tsconfig.json              # TypeScript configuration
└── tailwind.config.ts         # Tailwind CSS configuration
```

## Features

### Patient Features
- User authentication and registration
- Patient dashboard with appointment overview
- Appointment booking system
- Profile management
- Medical records access
- Prescription tracking
- Doctor search and selection

### Doctor Features
- Doctor authentication and profile management
- Dashboard with patient statistics
- Appointment management
- Patient list and history
- Schedule management
- Invoice generation
- Profile settings

### Common Features
- Role-based access control
- Responsive design for mobile and desktop
- Secure authentication flow
- Real-time data synchronization
- Intuitive user interface

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Backend API server running (see Back_smartcare-be)

### Installation

1. Navigate to the frontend directory:
```bash
cd Front-end
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables file:
```bash
# Create .env.local file
NEXT_PUBLIC_API_URL=http://localhost:7070
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

Build the application for production:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Environment Configuration

Create a `.env.local` file in the root of the `Front-end` directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:7070

# For production, set to your backend API URL:
# NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

## API Integration

The frontend communicates with the backend API through the configuration file located at `src/config/api.ts`. This file handles:

- Dynamic API URL resolution (development vs production)
- Centralized endpoint management
- Environment-based configuration

### Key API Endpoints

- Authentication: `/api/auth/login`, `/api/auth/signup`
- Patients: `/api/patient/profile`, `/patients`
- Doctors: `/api/doctor/profile`, `/doctors`
- Appointments: `/appointments`
- Schedules: `/api/timings`

## Authentication Flow

1. User signs up or logs in through the authentication pages
2. JWT token is stored in cookies via middleware
3. Protected routes are guarded by Next.js middleware
4. Role-based redirection to appropriate dashboard
5. Session persistence using secure cookies

## Routing Structure

### Public Routes
- `/` - Homepage
- `/login` - Login page
- `/signup` - Registration page

### Protected Routes (Patient)
- `/patient/dashboard` - Patient dashboard
- `/patient/booking` - Book appointments
- `/patient/settings` - Profile settings
- `/patient/medical-records` - View medical records
- `/patient/prescriptions` - View prescriptions

### Protected Routes (Doctor)
- `/doctors/dashboard` - Doctor dashboard
- `/doctors/appointments` - Manage appointments
- `/doctors/patients` - Patient list
- `/doctors/schedule` - Schedule management
- `/doctors/invoices` - Invoice management
- `/doctors/settings` - Profile settings

## Code Organization

### Components
Reusable components are located in `src/components/`. Each component follows React best practices with TypeScript typing.

### Pages
Pages follow Next.js App Router conventions. Each page is a React Server Component by default, with client-side interactivity added using the `'use client'` directive when needed.

### Utilities
Shared utilities for formatting, API calls, and data manipulation are in `src/lib/`.

### Configuration
API and environment configurations are centralized in `src/config/`.

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set the root directory to `Front-end`
3. Configure environment variables:
   - `NEXT_PUBLIC_API_URL` - Your backend API URL
4. Deploy automatically on push to main branch

### Other Platforms

The application can be deployed to any platform supporting Next.js:
- AWS Amplify
- Netlify
- Railway
- Docker containers

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimization

- Server-side rendering for improved initial load times
- Automatic code splitting
- Image optimization via Next.js Image component
- Dynamic imports for large components
- Caching strategies for API calls

## Security Considerations

- JWT tokens stored in HTTP-only cookies
- CSRF protection via Next.js middleware
- Input validation on client and server
- XSS prevention through React's built-in escaping
- Secure API communication

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill process on port 3000
npx kill-port 3000
```

**Environment variables not loading:**
- Ensure `.env.local` is in the `Front-end` directory
- Restart the development server after adding variables
- Variables must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser

**API connection errors:**
- Verify backend server is running
- Check `NEXT_PUBLIC_API_URL` in environment variables
- Verify CORS configuration on backend

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Submit a pull request with a clear description

## License

This project is part of the SmartCare healthcare management system.

## Support

For issues and questions, please refer to the main project repository or contact the development team.

---

Built with Next.js and TypeScript for modern healthcare management.
