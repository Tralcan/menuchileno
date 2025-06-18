
"use client";

import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CoffeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CoffeeModal({ isOpen, onClose }: CoffeeModalProps) {
  const coffeeUrl = "https://coff.ee/6hxrhhkvhs2";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] grid grid-rows-[1fr_auto] p-0 bg-background">
        <div className="row-start-1 min-h-0 overflow-hidden flex flex-col">
          <iframe
            src={coffeeUrl}
            title="Apóyame con un café en Buy Me A Coffee"
            className="w-full h-full flex-grow border-0"
            allowFullScreen
          />
        </div>
        <DialogFooter className="p-4 border-t row-start-2">
          <Button onClick={onClose} variant="outline">Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
