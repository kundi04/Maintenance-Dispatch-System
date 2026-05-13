# Maintenance Dispatch System - Frontend

A React frontend for the Maintenance Dispatch System with role-based dashboards.

## Tech Stack

- React 19
- Vite 8
- React Router DOM
- Axios
- React Icons

## Features

- **Role-based Dashboards**: Separate interfaces for Manager, Staff, and Resident
- **Authentication**: Session-based login with CSRF protection
- **Responsive Design**: Clean, modern UI
- **Real-time Updates**: Fetch and display maintenance requests

## Quick Start

### 1. Navigate to Frontend Directory

```bash
cd Frontend/dispatch
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

> **Note**: Make sure the Django backend is running at `http://127.0.0.1:8000` before starting the frontend.

## Test Users & Login

Open `http://localhost:5173` in your browser to access the login page.

### Available Test Accounts

| Username | Password | Role | Dashboard |
|----------|----------|------|-----------|
| `admin` | `admin1234` | Manager | `/manager` |
| `manager1` | `Test1234!` | Manager | `/manager` |
| `staff1` | `Test1234!` | Staff | `/staff` |
| `staff2` | `Test1234!` | Staff | `/staff` |
| `resident1` | `Test1234!` | Resident | `/resident` |
| `resident2` | `Test1234!` | Resident | `/resident` |

## Dashboards by Role

### Manager Dashboard (`/manager`)
- **View**: All maintenance requests in a table format
- **Assign**: Click the assign icon to open a modal and select a staff member
- **Update Status**: Hover over the edit icon to change request status
- **Delete**: Remove requests using the delete icon
- **Filter**: Click stat cards to filter by status

### Staff Dashboard (`/staff`)
- **View**: Only requests assigned to you
- **Update Status**: One-click buttons to change status (Pending → In Progress → Completed)
- **Stats**: Overview of your assigned tasks

### Resident Dashboard (`/resident`)
- **Create**: Submit new maintenance requests with title and description
- **View**: Track status of your own requests
- **Monitor**: See which staff member is assigned to your request

## Project Structure

```
Frontend/dispatch/
├── src/
│   ├── api/
│   │   └── axios.js          # Axios instance configuration
│   ├── pages/
│   │   ├── Login.jsx         # Login page
│   │   ├── ManagerDashboard.jsx
│   │   ├── StaffDashboard.jsx
│   │   └── ResidentDashboard.jsx
│   ├── utils/
│   │   └── csrf.js           # CSRF token helper
│   ├── App.jsx               # Router configuration
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles
├── index.html
├── package.json
└── vite.config.js            # Vite config with proxy
```

## API Proxy Configuration

The Vite dev server proxies `/api` requests to the Django backend:

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
      secure: false,
    }
  }
}
```

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

## Troubleshooting

### CSRF Token Errors
- Make sure the backend is running
- Clear browser cookies and refresh the page
- Check that `CSRF_TRUSTED_ORIGINS` in Django settings includes your frontend URL

### 403 Forbidden on Login
- Ensure the Vite proxy is configured correctly
- Verify the Django server is running on port 8000
- Check browser console for CORS errors

### Cannot Connect to Backend
- Start Django backend first: `python manage.py runserver`
- Then start Vite: `npm run dev`
- Ensure both servers are running simultaneously

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License
