/**
 * Kōdo Icon System
 * Single source of truth for all icons used in the app.
 * Import from here, never import Lucide icons directly in pages.
 *
 * Plane icon: custom SVG (top-view, recognizable silhouette)
 * All others: Lucide React
 */

import {
  // Transport
  TrainFront, BusFront, Car, Ship, Bike,
  // Accommodation
  Hotel, Home,
  // Documents & Trip
  FileText, Receipt, Ticket, Shield, FileCheck, Upload,
  // Media
  Image, Camera,
  // Food
  Utensils, Coffee,
  // System
  Bell, Search, Moon, Sun, Users, User, Settings, Plus,
  ChevronRight, ChevronDown, ChevronLeft, X, Check,
  MapPin, MapPinned, Compass, Clock, Star, Heart,
  Pencil, Trash2, Copy, Share2, ArrowRight, ArrowLeft,
  MessageCircle, UserPlus, Bookmark, Mail,
  AlertCircle, AlertTriangle, Info, CheckCircle2,
  Package, Luggage, 
  // Health
  Cross, Syringe,
  // Money
  DollarSign, CreditCard, TrendingUp,
  // Misc
  Globe, Calendar, Navigation, Eye, EyeOff,
  Filter, SlidersHorizontal, MoreHorizontal,
  Wifi, WifiOff, RefreshCw, ChevronUp, Minus,
  ThumbsUp, Flag, Tag, Hash, Lock, Unlock,
} from 'lucide-react';

// ── Custom plane icon (top-view silhouette) ───────────────────────────────────
export function PlaneIcon({ size = 24, color = 'currentColor', strokeWidth = 1.6, style, className }) {
  const s = size;
  return (
    <svg
      width={s} height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      className={className}
    >
      {/* fuselaje central */}
      <path d="M12 3 C13 3 14 4 14 6 L14 18 C14 20 13 21 12 21 C11 21 10 20 10 18 L10 6 C10 4 11 3 12 3Z"/>
      {/* alas principales */}
      <path d="M10 9 L3 13 L3 15 L10 13"/>
      <path d="M14 9 L21 13 L21 15 L14 13"/>
      {/* cola izquierda */}
      <path d="M10 17 L7 19 L7 20 L10 19"/>
      {/* cola derecha */}
      <path d="M14 17 L17 19 L17 20 L14 19"/>
    </svg>
  );
}

// ── Document type icons ────────────────────────────────────────────────────────
// Maps document/ticket types to their icon component
export const DOC_TYPE_ICONS = {
  flight:    PlaneIcon,
  train:     TrainFront,
  bus:       BusFront,
  car:       Car,
  ferry:     Ship,
  bike:      Bike,
  hotel:     Hotel,
  airbnb:    Home,
  ticket:    Ticket,
  insurance: Shield,
  image:     Image,
  other:     FileText,
};

// ── Re-exports (convenience) ──────────────────────────────────────────────────
export {
  TrainFront, BusFront, Car, Ship, Bike,
  Hotel, Home,
  FileText, Receipt, Ticket, Shield, FileCheck, Upload,
  Image, Camera,
  Utensils, Coffee,
  Bell, Search, Moon, Sun, Users, User, Settings, Plus,
  ChevronRight, ChevronDown, ChevronLeft, ChevronUp, X, Check,
  MapPin, MapPinned, Compass, Clock, Star, Heart,
  Pencil, Trash2, Copy, Share2, ArrowRight, ArrowLeft,
  MessageCircle, UserPlus, Bookmark, Mail,
  AlertCircle, AlertTriangle, Info, CheckCircle2,
  Package, Luggage,
  Cross, Syringe,
  DollarSign, CreditCard, TrendingUp,
  Globe, Calendar, Navigation, Eye, EyeOff,
  Filter, SlidersHorizontal, MoreHorizontal,
  Wifi, WifiOff, RefreshCw, Minus,
  ThumbsUp, Flag, Tag, Hash, Lock, Unlock,
};