import { Building2 } from "lucide-react";

export default function MaintenancePage(): React.JSX.Element {
  return (
    <div className="bg-surface-50 flex min-h-screen items-center justify-center">
      <div className="mx-auto max-w-md px-6 text-center">
        <div className="mb-6 flex justify-center">
          <div className="bg-surface-100 rounded-full p-4">
            <Building2 className="text-surface-400 h-12 w-12" />
          </div>
        </div>
        <h1 className="text-surface-900 mb-3 text-2xl font-bold">Primaria este in mentenanta</h1>
        <p className="text-surface-600">
          Va rugam reveniti mai tarziu. Ne cerem scuze pentru inconvenient.
        </p>
      </div>
    </div>
  );
}
