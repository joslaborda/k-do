/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Documents from './pages/Documents';
import Cities from './pages/Cities';
import CityDetail from './pages/CityDetail';
import Diary from './pages/Diary';
import Expenses from './pages/Expenses';
import Home from './pages/Home';
import MigrateData from './pages/MigrateData';
import Packing from './pages/Packing';
import Restaurants from './pages/Restaurants';
import Translator from './pages/Translator';
import TripsList from './pages/TripsList';
import TripDetail from './pages/TripDetail';
import Utilities from './pages/Utilities';
import Tickets from './pages/Tickets';
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import VerifyEmail from './pages/VerifyEmail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Documents": Documents,
    "Cities": Cities,
    "CityDetail": CityDetail,
    "Diary": Diary,
    "Expenses": Expenses,
    "Home": Home,
    "MigrateData": MigrateData,
    "Packing": Packing,
    "Restaurants": Restaurants,
    "Translator": Translator,
    "TripsList": TripsList,
    "TripDetail": TripDetail,
    "Utilities": Utilities,
    "Tickets": Tickets,
    "Calendar": Calendar,
    "Profile": Profile,
    "Settings": Settings,
    "VerifyEmail": VerifyEmail,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};