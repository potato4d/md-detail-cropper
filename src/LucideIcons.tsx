import { Settings, Download, Image as ImageIconComponent, Moon, Sun, Info } from "lucide-react";
import clsx from "clsx";

export const CogIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Settings className={clsx("w-4 h-4", className)} />
);

export const DownloadIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <Download className={clsx("w-4 h-4", className)} />
);

export const ImageIcon: React.FC = () => (
  <ImageIconComponent className="w-12 h-12 opacity-60" />
);

export const MoonIcon: React.FC = () => {
  return <Moon className="w-5 h-5" />;
};

export const SunIcon: React.FC = () => {
  return <Sun className="w-5 h-5" />;
};

export const InfoIcon: React.FC = () => (
  <Info className="w-5 h-5 shadow-sm" />
);
