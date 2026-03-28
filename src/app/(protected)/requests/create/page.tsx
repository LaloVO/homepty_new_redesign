import { FormRequest } from "@/components/requests";
import { ButtonBack } from "@/components/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function RequestsCreatePage() {
  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0 p-8">
        <div className="flex flex-col gap-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Crear solicitud</h1>
            <ButtonBack />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Detalla lo que búscas</CardTitle>
              <CardDescription>
                Mientras más específico seas, mejores opciones podremos
                ofrecerte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormRequest request={null} />
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col gap-y-4 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Crear solicitud</h1>
            <ButtonBack />
          </div>
        </div>
      </div>
    </div>
  );
}
