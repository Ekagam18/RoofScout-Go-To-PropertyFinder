# RoofScout React Application

This is the React version of the RoofScout property rental/buying website. It has been converted from HTML/CSS/JavaScript to a modern React application using Vite, React Router, and Tailwind CSS.

## Features

- **Home Page**: Landing page with property showcase and testimonials
- **Login/Signup**: User authentication with form switching animation
- **User Dashboard**: User profile management and property listings
- **Admin Dashboard**: Admin panel for managing properties and users
- **Property Listings**: Browse all properties with filtering capabilities
- **State-based Search**: Search properties by state
- **Property Details**: View detailed information about properties
- **Post Property**: Form to list new properties

## Technology Stack

- **React 19**: Latest React version
- **React Router DOM**: For navigation and routing
- **Tailwind CSS**: For styling (same theme as original)
- **Vite**: Fast build tool and dev server
- **Font Awesome**: Icons
- **RemixIcon**: Additional icons

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd roofscout_react
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit:
```
http://localhost:5173
```

### Build for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
roofscout_react/
├── public/              # Static assets (images, videos)
├── src/
│   ├── components/     # Reusable components
│   │   ├── Navbar.jsx  # Navigation bar component
│   │   └── Footer.jsx  # Footer component
│   ├── pages/          # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── UserDashboard.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── AllProperties.jsx
│   │   ├── States.jsx
│   │   ├── PostProperty.jsx
│   │   └── ViewDetail.jsx
│   ├── App.jsx         # Main app component with routing
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles with Tailwind
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## Key Features Maintained

✅ Same visual design and theme as original HTML version
✅ All functionality preserved
✅ Responsive design
✅ Property filtering
✅ State-based property search
✅ User authentication flow
✅ Session storage for user data
✅ Local storage for user profiles and properties

## Routes

- `/` - Home page
- `/login` - Login/Signup page
- `/userdashboard` - User dashboard
- `/admindashbo` - Admin dashboard
- `/allproperties` - All properties listing
- `/states?state=<state_name>` - Properties by state
- `/postproperty` - Post new property
- `/viewdetail` - Property detail page

## Notes

- All images and assets are in the `public/` folder
- The application uses sessionStorage for user sessions
- localStorage is used for user profiles and property data
- Admin credentials: username: `admin`, password: `admin123`

## Development

The project uses Vite for fast hot module replacement (HMR). Any changes you make will be reflected immediately in the browser.

## License

This project is part of the RoofScout application.
