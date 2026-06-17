import { PlaneIcon, BusFront } from '@/lib/icons';
import { AlertTriangle, Car, Cross, DollarSign, FileText, Hotel, Shield, TrainFront, Utensils, Wifi, CirclePlus, Landmark, ShoppingBag, Ticket, ShoppingCart, Compass } from 'lucide-react';

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

export const WMO_EMOJI = {0:'☀️',1:'🌤️',2:'⛅',3:'☁️',45:'🌫️',48:'🌫️',51:'🌦️',53:'🌦️',55:'🌧️',61:'🌧️',63:'🌧️',65:'🌧️',71:'❄️',73:'🌨️',75:'❄️',80:'🌧️',81:'🌧️',82:'⛈️',95:'⛈️',99:'⛈️'};
