
"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface CoffeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CoffeeModal({ isOpen, onClose }: CoffeeModalProps) {
  const coffeeUrl = "https://coff.ee/6hxrhhkvhs2";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-[1200px] h-[85vh] p-0 bg-background flex flex-col overflow-hidden">
        <DialogTitle className="sr-only">Ventana modal: Apóyame con un café</DialogTitle>
        <iframe
          src={coffeeUrl}
          title="Apóyame con un café en Buy Me A Coffee"
          className="w-full h-full flex-grow border-0"
          allowFullScreen
        />
      </DialogContent>
    </Dialog>
  );
}
