import {
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudDrizzle,
  CloudSnow,
  CloudLightning,
  CloudFog,
} from "lucide-react";

export function getWeatherVisual(code?: number | null) {
  const iconClass = "w-8 h-8";
  if (code == null) return { label: "Bilinmiyor", Icon: () => <Cloud className={iconClass} /> };
  if (code === 0) return { label: "Açık", Icon: () => <Sun className={iconClass} /> };
  if ([1, 2, 3].includes(code)) return { label: "Parçalı/Çok Bulutlu", Icon: () => <CloudSun className={iconClass} /> };
  if ([45, 48].includes(code)) return { label: "Sisli", Icon: () => <CloudFog className={iconClass} /> };
  if ([51, 53, 55, 56, 57].includes(code)) return { label: "Çiseleme", Icon: () => <CloudDrizzle className={iconClass} /> };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { label: "Yağmurlu", Icon: () => <CloudRain className={iconClass} /> };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: "Karlı", Icon: () => <CloudSnow className={iconClass} /> };
  if ([95, 96, 99].includes(code)) return { label: "Gök Gürültülü", Icon: () => <CloudLightning className={iconClass} /> };
  return { label: "Bulutlu", Icon: () => <Cloud className={iconClass} /> };
}
