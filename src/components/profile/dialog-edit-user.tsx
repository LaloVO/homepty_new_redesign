"use client";
import { useState } from "react";
import { PencilIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { FormUser } from "./form-user";
import { UserWithLocation } from "@/server/queries/user/get-user-info";

interface Props {
  user: UserWithLocation;
}
export function DialogEditUser({ user }: Props) {
  const [open, setOpen] = useState(false);

  const closeDialog = () => {
    setOpen((prev) => !prev);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant={"outline"} title="Editar">
          <PencilIcon className="text-green-600" />
          Editar perfil
        </Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-2xl max-h-[95svh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
          <DialogDescription>
            Colocá la información que quieras mostrar en tu perfil.
          </DialogDescription>
        </DialogHeader>
        <FormUser user={user} closeDialog={closeDialog} />
      </DialogContent>
    </Dialog>
  );
}
