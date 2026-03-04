import { MapPin, Phone, Mail, Clock } from "lucide-react";

interface PrimarieInfoCardProps {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  workingHours?: string;
}

/**
 * PrimarieInfoCard Component
 * Compact card rendered inside Leaflet map popup.
 * Shows primarie details: name, address, phone, email, working hours.
 *
 * Uses plain Tailwind classes (no shadcn components that need portal/context).
 * Designed for maxWidth 300px Leaflet popup container.
 */
export function PrimarieInfoCard({
  name,
  address,
  phone,
  email,
  workingHours,
}: PrimarieInfoCardProps): React.JSX.Element {
  return (
    <div className="max-w-[280px] min-w-[200px] space-y-2 p-1">
      {/* Primarie Name */}
      <h3 className="text-sm leading-tight font-bold text-gray-900">{name}</h3>

      {/* Details */}
      <div className="space-y-1.5">
        {address && (
          <div className="flex items-start gap-2 text-xs text-gray-600">
            <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
            <span>{address}</span>
          </div>
        )}

        {phone && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Phone className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
            <a href={`tel:${phone}`} className="hover:text-blue-600 hover:underline">
              {phone}
            </a>
          </div>
        )}

        {email && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Mail className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
            <a href={`mailto:${email}`} className="truncate hover:text-blue-600 hover:underline">
              {email}
            </a>
          </div>
        )}

        {workingHours && (
          <div className="flex items-start gap-2 text-xs text-gray-600">
            <Clock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
            <span>{workingHours}</span>
          </div>
        )}
      </div>
    </div>
  );
}
