# Frontend Dependencies

## Core Dependencies

### React & TypeScript
- `react@^19.1.0` - React library for building user interfaces
- `react-dom@^19.1.0` - React DOM rendering
- `typescript@^4.9.5` - TypeScript for type safety
- `@types/react@^19.1.8` - TypeScript definitions for React
- `@types/react-dom@^19.1.6` - TypeScript definitions for React DOM

### Material-UI (MUI)
- `@mui/material@^7.2.0` - Core Material-UI components
- `@emotion/react@^11.14.0` - CSS-in-JS library (required by MUI)
- `@emotion/styled@^11.14.1` - Styled components for MUI
- `@mui/icons-material@^7.2.0` - Material Design icons
- `@mui/lab@^7.0.0-beta.14` - Experimental MUI components

### HTTP & File Handling
- `axios@^1.10.0` - HTTP client for API requests
- `react-dropzone@^14.3.8` - Drag and drop file upload

### Build & Development
- `react-scripts@5.0.1` - Create React App build scripts
- `web-vitals@^2.1.4` - Performance monitoring

### Testing
- `@testing-library/react@^16.3.0` - React testing utilities
- `@testing-library/jest-dom@^6.6.3` - Jest DOM matchers
- `@testing-library/user-event@^13.5.0` - User interaction testing
- `@testing-library/dom@^10.4.0` - DOM testing utilities
- `@types/jest@^27.5.2` - TypeScript definitions for Jest
- `@types/node@^16.18.126` - TypeScript definitions for Node.js

## Installation Commands

```bash
# Install all dependencies
npm install

# Install specific dependency groups
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material @mui/lab
npm install axios react-dropzone

# Development dependencies
npm install --save-dev @types/react @types/react-dom @types/jest @types/node
```

## Package.json Scripts

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build", 
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

## Environment Variables

Create `.env` file in frontend root:
```
REACT_APP_API_URL=http://localhost:7071/api
REACT_APP_NAME=Smart Document Scanner
REACT_APP_VERSION=1.0.0
GENERATE_SOURCEMAP=false
```
