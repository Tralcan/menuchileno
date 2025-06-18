
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coffee } from 'lucide-react';

interface CoffeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CoffeeModal({ isOpen, onClose }: CoffeeModalProps) {
  const coffeeUrl = "https://coff.ee/6hxrhhkvhs2";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] grid grid-rows-[auto_1fr_auto] p-0">
        <DialogHeader className="p-6 pb-2 row-start-1 border-b">
          <DialogTitle className="font-headline text-2xl flex items-center">
            <Coffee size={24} className="mr-2 text-primary"/>
            Apóyame con un Café
          </DialogTitle>
        </DialogHeader>

        <div className="row-start-2 min-h-0 overflow-hidden flex flex-col">
          <iframe
            src={coffeeUrl}
            title="Apóyame con un café en Buy Me A Coffee"
            className="w-full h-full flex-grow border-0"
            allowFullScreen
          />
        </div>

        <DialogFooter className="p-4 border-t row-start-3">
          <Button onClick={onClose} variant="outline">Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
