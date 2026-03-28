"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { DollarSignIcon } from "lucide-react";
import { FormValueEstimator } from "./form-value-estimator";

interface DialogValueEstimatorProps {
  trigger?: React.ReactNode;
}

export function DialogValueEstimator({ trigger }: DialogValueEstimatorProps) {
  const [open, setOpen] = useState(false);

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
            variant={"secondary"}
          >
            <DollarSignIcon className="text-orange-600" /> Estimar valor
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-full md:max-w-3xl max-h-[95dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-x-2">
            <DollarSignIcon className="text-primary" /> Estimador de valor
          </DialogTitle>
          <DialogDescription>
            Calculá el valor aproximado de un inmueble basado en sus
            características.
          </DialogDescription>
        </DialogHeader>
        {/* <FormOffer closeDialog={closeDialog} /> */}
        <FormValueEstimator />
      </DialogContent>
    </Dialog>
  );
}
