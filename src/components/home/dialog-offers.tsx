"use client";
import { useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HandshakeIcon } from "lucide-react";
import { Button } from "../ui/button";
import { FormOffer } from "./form-offer";

interface DialogOffersProps {
  trigger?: React.ReactNode;
}

export function DialogOffers({ trigger }: DialogOffersProps) {
  const [open, setOpen] = useState(false);

  const closeDialog = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            type="button"
            title="estimar valor"
            size={"lg"}
            variant={"outline"}
          >
            <HandshakeIcon className="text-green-600" /> Ofertas inmobiliarias
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-full md:max-w-3xl max-h-[95dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-x-2">
            <HandshakeIcon className="text-green-600" /> Ofertas inmobiliarias
          </DialogTitle>
          <DialogDescription>
            Crea, gestiona o analiza ofertas de compra y alquiler. Conéctate con
            otros usuarios.
          </DialogDescription>
        </DialogHeader>
        <FormOffer closeDialog={closeDialog} />
      </DialogContent>
    </Dialog>
  );
}
