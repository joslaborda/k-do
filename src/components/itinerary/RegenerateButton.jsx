import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RegenerateButton({ label, onClick, isLoading, size = 'sm', variant = 'outline' }) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={isLoading}
      className="gap-1.5 text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-400"
    >
      <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
      {isLoading ? 'Regenerando...' : label}
    </Button>
  );
}