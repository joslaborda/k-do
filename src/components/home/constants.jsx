import { PlaneIcon, BusFront } from '@/lib/icons';
import { AlertTriangle, Car, Cross, DollarSign, FileText, Hotel, Shield, TrainFront, Utensils, Wifi, CirclePlus, Landmark, ShoppingBag, Ticket, Sun, Cloud, CloudDrizzle, CloudRain, CloudSnow, CloudLightning, CloudFog } from 'lucide-react';

export const REQ_ICON_MAP = {
  visa:    (p) => <Shield size={14} {...p} />,
  vaccine: (p) => <Cross size={14} {...p} />,
  tech:    (p) => <Wifi size={14} {...p} />,
  money:   (p) => <DollarSign size={14} {...p} />,
  safety:  (p) => <AlertTriangle size={14} {...p} />,
  health:  (p) => <Cross size={14} {...p} />,
};

export const DOC_ICONS = {
  flight: (p) => <PlaneIcon size={13} {...p} />,
  hotel: (p) => <Hotel size={13} {...p} />,
  train: (p) => <TrainFront size={13} {...p} />,
  bus: (p) => <BusFront size={13} {...p} />,
  car: (p) => <Car size={13} {...p} />,
  ticket: (p) => <Ticket size={13} {...p} />,
  insurance: (p) => <Shield size={13} {...p} />,
  other: (p) => <FileText size={13} {...p} />,
};

export const SPOT_ICONS = {
  food:       Utensils,
  sight:      Landmark,
  activity:   Ticket,
  shopping:   ShoppingBag,
  custom:     CirclePlus,
  restaurant: Utensils,
  museum:     Landmark,
};

export const SPOT_COLORS = {
  food: 'bg-orange-50 text-primary', sight: 'bg-violet-50 text-violet-600',
  activity: 'bg-green-50 text-green-600', shopping: 'bg-blue-50 text-blue-600',
  custom: 'bg-secondary text-muted-foreground', restaurant: 'bg-orange-50 text-primary',
  museum: 'bg-violet-50 text-violet-600',
};


// Códigos WMO → icono Lucide (sistema Kōdo: solo Lucide, sin emojis).
export const WMO_ICON = {0:Sun,1:Sun,2:Cloud,3:Cloud,45:CloudFog,48:CloudFog,51:CloudDrizzle,53:CloudDrizzle,55:CloudRain,61:CloudRain,63:CloudRain,65:CloudRain,71:CloudSnow,73:CloudSnow,75:CloudSnow,80:CloudRain,81:CloudRain,82:CloudLightning,95:CloudLightning,99:CloudLightning};
