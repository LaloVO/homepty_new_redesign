"use client";
import dynamic from "next/dynamic";
import { type ReactNode } from "react";

// @mapbox/search-js-react accede a `document` al evaluar el módulo,
// lo que rompe el SSR de Next.js. Se carga solo en el cliente.
const AddressAutofillClient = dynamic(
  () =>
    import("@mapbox/search-js-react").then((mod) => {
      const { AddressAutofill } = mod;
      function Wrapper({ children }: { children: ReactNode }) {
        return (
          <AddressAutofill
            accessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!}
            options={{ language: "es", country: "MX" }}
          >
            {children}
          </AddressAutofill>
        );
      }
      return Wrapper;
    }),
  { ssr: false }
);

export default function AddressAutoComplete({
  children,
}: {
  children: ReactNode;
}) {
  return <AddressAutofillClient>{children}</AddressAutofillClient>;
}
