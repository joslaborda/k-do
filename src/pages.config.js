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
import Calendar from './pages/Calendar';
import CalendarView from './pages/CalendarView';
import Cities from './pages/Cities';
import CityDetail from './pages/CityDetail';
import Diary from './pages/Diary';
import Expenses from './pages/Expenses';
import Home from './pages/Home';
import MigrateData from './pages/MigrateData';
import Packing from './pages/Packing';
import Restaurants from './pages/Restaurants';
import Tickets from './pages/Tickets';
import Translator from './pages/Translator';
import TripDetail from './pages/TripDetail';
import TripsList from './pages/TripsList';
import TripMap from './pages/TripMap';
import Utilities from './pages/Utilities';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Calendar": Calendar,
    "CalendarView": CalendarView,
    "Cities": Cities,
    "CityDetail": CityDetail,
    "Diary": Diary,
    "Expenses": Expenses,
    "Home": Home,
    "MigrateData": MigrateData,
    "Packing": Packing,
    "Restaurants": Restaurants,
    "Tickets": Tickets,
    "Translator": Translator,
    "TripDetail": TripDetail,
    "TripsList": TripsList,
    "TripMap": TripMap,
    "Utilities": Utilities,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};