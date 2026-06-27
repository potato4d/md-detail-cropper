import {
  Settings,
  ArrowDownCircle,
  Image,
  Moon,
  Sun,
  Info,
} from "lucide-react";
import clsx from "clsx";

export const CogIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Settings className={clsx(["w-6 h-6", className])} />
);

export const DownloadIcon: React.FC<{ className?: string }> = ({
  className,
}) => <ArrowDownCircle className={clsx(["w-4 h-4", className])} />;

export const ImageIcon: React.FC = () => (
  <Image className="w-12 h-12 opacity-60" strokeWidth={1} />
);

export const MoonIcon: React.FC = () => <Moon className="w-5 h-5" />;

export const SunIcon: React.FC = () => <Sun className="w-5 h-5" />;

export const InfoIcon: React.FC = () => (
  <Info className="w-5 h-5 shadow-sm" />
);
