# FSJES UCA Results+

## Overview

FSJES UCA Results+ is a mobile application for students at the Faculty of Legal, Economic and Social Sciences - Cadi Ayyad University (FSJES UCA) to view their academic results. The app fetches and displays grades from the official university portal, transforming raw academic data into an intuitive, visually appealing experience with color-coded grade statuses.

The application is built as an Expo React Native app with a Node.js/Express backend that proxies requests to the university's results portal and parses the HTML responses.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Expo SDK 54 with React Native 0.81
- **Navigation**: React Navigation v7 with a tab-based structure (Home, Results, History, Settings) using native stack navigators within each tab
- **State Management**: React Context API for global state (LanguageContext, ResultsContext) combined with TanStack React Query for server state
- **Styling**: Custom theme system with light/dark mode support, using a centralized theme constants file
- **Animations**: React Native Reanimated for smooth UI animations
- **Data Persistence**: AsyncStorage for storing recent searches, results history, and user preferences

### Backend Architecture
- **Framework**: Express.js v5 running on Node.js
- **Purpose**: Acts as a proxy server to fetch results from the university portal and parse HTML responses
- **HTML Parsing**: Uses Cheerio library to scrape and extract grade data from the university's web portal
- **API Design**: RESTful endpoint at `/api/results/:studentId` that fetches and returns parsed student results

### Data Flow
1. User enters student ID (Apogee number) in the mobile app
2. App sends request to Express backend
3. Backend fetches HTML from university portal (`e-apps.fsjes.uca.ma`)
4. Cheerio parses HTML to extract grade data
5. Structured JSON response sent back to app
6. App displays results with color-coded status indicators

### Key Design Decisions
- **No Authentication Required**: The app fetches publicly available data using only a student ID number
- **Proxy Architecture**: Backend proxy avoids CORS issues and allows HTML parsing server-side
- **Multi-Language Support**: Arabic, French, and English with RTL support for Arabic
- **Offline-First Approach**: Results are cached locally for offline viewing

## External Dependencies

### Third-Party Services
- **University Portal**: `https://e-apps.fsjes.uca.ma/scolarite/resultat/` - Source of academic results data

### Database
- **PostgreSQL**: Configured via Drizzle ORM (schema defined in `shared/schema.ts`)
- **Current Usage**: Basic user table defined but primary data storage uses AsyncStorage on client
- **Note**: Database is provisioned but the app primarily operates without persistent server-side storage

### Key NPM Dependencies
- **cheerio**: HTML parsing for scraping university portal
- **drizzle-orm/drizzle-zod**: Database ORM and schema validation
- **expo-haptics**: Haptic feedback for interactions
- **react-native-reanimated**: Smooth animations
- **@tanstack/react-query**: Server state management
- **@react-native-async-storage/async-storage**: Local data persistence