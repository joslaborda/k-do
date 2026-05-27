/**
 * Kōdo Icon System — re-exports from lucide-react
 * Import PlaneIcon separately from @/lib/PlaneIcon
 *
 * Usage:
 *   import { TrainFront, BusFront, Hotel } from '@/lib/icons';
 *   import { PlaneIcon } from '@/lib/PlaneIcon';
 */

export {
  // Transport
  TrainFront,
  BusFront,
  Car,
  Ship,
  Bike,
  // Accommodation
  Hotel,
  Home,
  // Documents
  FileText,
  Receipt,
  Ticket,
  Shield,
  FileCheck,
  Upload,
  // Media
  Image,
  Camera,
  // Food
  Utensils,
  Coffee,
  // System
  Bell,
  Search,
  Moon,
  Sun,
  Users,
  User,
  Settings,
  Plus,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  X,
  Check,
  MapPin,
  MapPinned,
  Compass,
  Clock,
  Star,
  Heart,
  Pencil,
  Trash2,
  Copy,
  Share2,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
  UserPlus,
  Bookmark,
  Mail,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  Package,
  Luggage,
  Cross,
  Syringe,
  DollarSign,
  CreditCard,
  TrendingUp,
  Globe,
  Calendar,
  Navigation,
  Eye,
  EyeOff,
  Filter,
  SlidersHorizontal,
  MoreHorizontal,
  Wifi,
  WifiOff,
  RefreshCw,
  Minus,
  ThumbsUp,
  Flag,
  Tag,
  Hash,
  Lock,
  Unlock,
} from 'lucide-react';

/**
 * DOC_TYPE_ICONS — maps document/ticket category to Lucide icon name string.
 * Used in places without JSX (pure JS context).
 * For JSX rendering use the component directly.
 */
export const DOC_TYPE_ICON_NAMES = {
  flight:    'PlaneIcon',   // from @/lib/PlaneIcon
  train:     'TrainFront',
  bus:       'BusFront',
  car:       'Car',
  ferry:     'Ship',
  hotel:     'Hotel',
  airbnb:    'Home',
  ticket:    'Ticket',
  insurance: 'Shield',
  image:     'Image',
  other:     'FileText',
};