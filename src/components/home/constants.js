import React from 'react';
import { AlertTriangle, BusFront, Car, Cross, DollarSign, FileText, Hotel, PlaneIcon, Shield, TrainFront, Utensils, Wifi } from '@/lib/icons';
import { CirclePlus, Landmark, ShoppingBag, Ticket } from 'lucide-react';

export const REQ_ICON_MAP = {
  visa:    (p) => React.createElement(Shield, Object.assign({ size: 14 }, p)),
  vaccine: (p) => React.createElement(Cross, Object.assign({ size: 14 }, p)),
  tech:    (p) => React.createElement(Wifi, Object.assign({ size: 14 }, p)),
  money:   (p) => React.createElement(DollarSign, Object.assign({ size: 14 }, p)),
  safety:  (p) => React.createElement(AlertTriangle, Object.assign({ size: 14 }, p)),
  health:  (p) => React.createElement(Cross, Object.assign({ size: 14 }, p)),
};

export const DOC_ICONS = {
  flight:    (p) => React.createElement(PlaneIcon, Object.assign({ size: 13 }, p)),
  hotel:     (p) => React.createElement(Hotel, Object.assign({ size: 13 }, p)),
  train:     (p) => React.createElement(TrainFront, Object.assign({ size: 13 }, p)),
  bus:       (p) => React.createElement(BusFront, Object.assign({ size: 13 }, p)),
  car:       (p) => React.createElement(Car, Object.assign({ size: 13 }, p)),
  ticket:    (p) => React.createElement(Ticket, Object.assign({ size: 13 }, p)),
  insurance: (p) => React.createElement(Shield, Object.assign({ size: 13 }, p)),
  other:     (p) => React.createElement(FileText, Object.assign({ size: 13 }, p)),
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
