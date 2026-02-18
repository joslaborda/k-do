import { format } from 'date-fns';
import { Utensils, Train, Hotel, Ticket, ShoppingBag, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const categoryConfig = {
  food: { icon: Utensils, color: 'bg-orange-100 text-orange-600' },
  transport: { icon: Train, color: 'bg-blue-100 text-blue-600' },
  accommodation: { icon: Hotel, color: 'bg-purple-100 text-purple-600' },
  activities: { icon: Ticket, color: 'bg-pink-100 text-pink-600' },
  shopping: { icon: ShoppingBag, color: 'bg-emerald-100 text-emerald-600' },
  other: { icon: MoreHorizontal, color: 'bg-slate-100 text-slate-600' }
};

export default function ExpenseCard({ expense, onDelete }) {
  const config = categoryConfig[expense.category] || categoryConfig.other;
  const Icon = config.icon;

  const formatAmount = (amount, currency) => {
    if (currency === 'JPY') {
      return `¥${amount.toLocaleString()}`;
    }
    return `€${amount.toFixed(2)}`;
  };

  return (
    <div className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:shadow-md transition-all duration-300">
      <div className={`w-11 h-11 rounded-xl ${config.color} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-slate-900 truncate">{expense.description}</h3>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-xs px-2 py-0.5 rounded-full ${expense.paid_by === 'You' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
            {expense.paid_by}
          </span>
          {expense.date && (
            <span className="text-xs text-slate-400">
              {format(new Date(expense.date), 'MMM d')}
            </span>
          )}
        </div>
      </div>
      
      <div className="text-right">
        <p className="font-semibold text-slate-900">{formatAmount(expense.amount, expense.currency)}</p>
        {expense.split_with?.length > 0 && (
          <p className="text-xs text-slate-400">split</p>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onDelete(expense.id)} className="text-red-600">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}