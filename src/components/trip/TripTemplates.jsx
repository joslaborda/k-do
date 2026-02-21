import { Button } from '@/components/ui/button';

const templates = [
  {
    id: 'city',
    name: 'Ciudad',
    emoji: '🏙️',
    description: 'Viaje urbano con museos y cultura',
    packingItems: [
      { name: 'Pasaporte', category: 'personal', quantity: 1 },
      { name: 'Tarjetas de crédito', category: 'personal', quantity: 2 },
      { name: 'Teléfono móvil', category: 'tecnologia', quantity: 1 },
      { name: 'Cargadores', category: 'tecnologia', quantity: 2 },
      { name: 'Ropa casual', category: 'ropa', quantity: 5 },
      { name: 'Zapatos cómodos', category: 'ropa', quantity: 1 },
      { name: 'Cámara', category: 'tecnologia', quantity: 1 },
      { name: 'Mochila pequeña', category: 'personal', quantity: 1 },
    ]
  },
  {
    id: 'beach',
    name: 'Playa',
    emoji: '🏖️',
    description: 'Relax y sol en la costa',
    packingItems: [
      { name: 'Pasaporte', category: 'personal', quantity: 1 },
      { name: 'Bañador', category: 'ropa', quantity: 2 },
      { name: 'Protector solar', category: 'neceser', quantity: 1 },
      { name: 'Gafas de sol', category: 'personal', quantity: 1 },
      { name: 'Toalla de playa', category: 'personal', quantity: 1 },
      { name: 'Sandalias', category: 'ropa', quantity: 1 },
      { name: 'Gorra', category: 'ropa', quantity: 1 },
      { name: 'After sun', category: 'neceser', quantity: 1 },
      { name: 'Snorkel', category: 'personal', quantity: 1 },
    ]
  },
  {
    id: 'adventure',
    name: 'Aventura',
    emoji: '🏔️',
    description: 'Naturaleza y actividades outdoor',
    packingItems: [
      { name: 'Pasaporte', category: 'personal', quantity: 1 },
      { name: 'Botas de montaña', category: 'ropa', quantity: 1 },
      { name: 'Mochila grande', category: 'personal', quantity: 1 },
      { name: 'Ropa térmica', category: 'ropa', quantity: 2 },
      { name: 'Chubasquero', category: 'ropa', quantity: 1 },
      { name: 'Botiquín', category: 'medicinas', quantity: 1 },
      { name: 'Linterna', category: 'personal', quantity: 1 },
      { name: 'Cantimplora', category: 'personal', quantity: 1 },
      { name: 'Navaja multiusos', category: 'personal', quantity: 1 },
    ]
  },
  {
    id: 'custom',
    name: 'Personalizado',
    emoji: '✨',
    description: 'Empieza desde cero',
    packingItems: [
      { name: 'Pasaporte', category: 'personal', quantity: 1 },
      { name: 'Tarjetas de crédito', category: 'personal', quantity: 2 },
      { name: 'Teléfono móvil', category: 'tecnologia', quantity: 1 },
    ]
  }
];

export default function TripTemplates({ onSelect }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-foreground mb-3">Elige una plantilla:</h3>
      <div className="grid grid-cols-2 gap-3">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template)}
            className="p-4 glass border-2 border-border hover:border-primary rounded-xl transition-all hover:scale-105 text-left group"
          >
            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{template.emoji}</div>
            <div className="font-semibold text-foreground mb-1">{template.name}</div>
            <div className="text-xs text-muted-foreground">{template.description}</div>
            <div className="text-xs text-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {template.packingItems.length} items incluidos
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export { templates };