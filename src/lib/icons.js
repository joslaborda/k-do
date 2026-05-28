/**
 * Kōdo Icon System
 * Import everything from here:
 *   import { PlaneIcon, TrainFront, BusFront, ... } from '@/lib/icons';
 */

import { createElement } from 'react';
import {
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
  Package, Luggage, Cross, Syringe, Plug,
  DollarSign, CreditCard, TrendingUp,
  Globe, Calendar, Navigation, Eye, EyeOff,
  Filter, SlidersHorizontal, MoreHorizontal,
  Wifi, WifiOff, RefreshCw, Minus,
  ThumbsUp, Flag, Tag, Hash, Lock, Unlock,
  Paperclip, Download, ZoomIn, Send,
} from 'lucide-react';

// ── Custom PlaneIcon (top-view silhouette) ───────────────────────────────────
export function PlaneIcon({ size = 24, color = 'currentColor', strokeWidth = 1.6, style, className }) {
  return createElement('svg', {
    width: size, height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    style: style,
    className: className,
  },
    createElement('path', { d: 'M12 3 C13 3 14 4 14 6 L14 18 C14 20 13 21 12 21 C11 21 10 20 10 18 L10 6 C10 4 11 3 12 3Z' }),
    createElement('path', { d: 'M10 9 L3 13 L3 15 L10 13' }),
    createElement('path', { d: 'M14 9 L21 13 L21 15 L14 13' }),
    createElement('path', { d: 'M10 17 L7 19 L7 20 L10 19' }),
    createElement('path', { d: 'M14 17 L17 19 L17 20 L14 19' })
  );
}

// ── Re-exports ────────────────────────────────────────────────────────────────
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
  Package, Luggage, Cross, Syringe, Plug,
  DollarSign, CreditCard, TrendingUp,
  Globe, Calendar, Navigation, Eye, EyeOff,
  Filter, SlidersHorizontal, MoreHorizontal,
  Wifi, WifiOff, RefreshCw, Minus,
  ThumbsUp, Flag, Tag, Hash, Lock, Unlock,
  Paperclip, Download, ZoomIn, Send,
};
