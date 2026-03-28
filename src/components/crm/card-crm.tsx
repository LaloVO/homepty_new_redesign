import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardProps {
  title: string;
  Icon: LucideIcon;
  quantity: number | string;
  description: string;
  backgroundColor?: string;
  progress?: number;
  tag?: string;
  variant?: "blue" | "green" | "orange" | "purple";
}

const variants = {
  blue: {
    bg: "bg-blue-50/50",
    border: "border-blue-100",
    text: "text-blue-700",
    progress: "bg-blue-500",
    progressBg: "bg-blue-100",
    icon: "text-blue-600",
    tagBg: "bg-white",
  },
  green: {
    bg: "bg-green-50/50",
    border: "border-green-100",
    text: "text-green-700",
    progress: "bg-green-500",
    progressBg: "bg-green-100",
    icon: "text-green-600",
    tagBg: "bg-white",
  },
  orange: {
    bg: "bg-orange-50/50",
    border: "border-orange-100",
    text: "text-orange-700",
    progress: "bg-orange-500",
    progressBg: "bg-orange-100",
    icon: "text-orange-600",
    tagBg: "bg-white",
  },
  purple: {
    bg: "bg-purple-50/50",
    border: "border-purple-100",
    text: "text-purple-700",
    progress: "bg-purple-500",
    progressBg: "bg-purple-100",
    icon: "text-purple-600",
    tagBg: "bg-white"
  }
};

export function CardCrm({
  title,
  Icon,
  quantity,
  description,
  variant = "blue",
  progress = 50,
  tag
}: CardProps) {
  const v = variants[variant] || variants.blue;

  return (
    <Card className={cn(
      "p-5 rounded-2xl border-none shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-all duration-300",
      v.bg,
      v.border
    )}>
      {/* Background Icon */}
      <div className="absolute top-0 right-0 p-3 opacity-10">
        <Icon size={64} className={v.icon} />
      </div>

      <div className="flex flex-col h-full justify-between relative z-10">
        <div className="flex items-center justify-between mb-2">
          {tag && (
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border",
              v.text,
              v.tagBg,
              v.border
            )}>
              {tag}
            </span>
          )}
          <Icon className={cn("w-4 h-4", v.icon)} />
        </div>

        <div>
          <div className="text-sm font-medium text-gray-600 mb-1">{title}</div>
          <div className="text-3xl font-bold text-gray-800">{quantity}</div>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>

        {progress !== undefined && (
          <div className={cn("w-full h-1.5 rounded-full mt-3 overflow-hidden", v.progressBg)}>
            <div
              className={cn("h-full rounded-full transition-all duration-500", v.progress)}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
