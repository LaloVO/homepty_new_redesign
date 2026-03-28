"use server";
import { getUserInfo } from "@/server/queries";
import { ErrorMessage } from "../shared";
import { NavUserClient } from "./nav-user-client";

export async function NavUser() {
  const response = await getUserInfo();
  if (!response.ok || !response.data) {
    return <ErrorMessage message="Error al obtener el usuario" />;
  }
  const user = response.data;
  return (
    <NavUserClient
      nombre={user.nombre_usuario ?? ""}
      email={user.email_usuario ?? ""}
      initials={user.nombre_usuario?.charAt(0) ?? "U"}
    />
  );
}
