import { Leaf } from 'lucide-react';

export default function Logo() {
  return (
    <div className="flex items-center gap-2 text-primary font-semibold text-lg">
      <Leaf className="h-6 w-6" />
      <span className="font-headline">AgriAssist</span>
    </div>
  );
}
