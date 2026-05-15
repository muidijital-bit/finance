import {
  Landmark, User, Key, HardDrive, Building2,
  Home, Shield, Radio, ClipboardList, Package,
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import type { FC } from 'react';

type IconComp = FC<LucideProps>;

const ICONS: Record<string, IconComp> = {
  kredi:           Landmark,
  calisan_odemesi: User,
  lisans:          Key,
  demirbas:        HardDrive,
  aidat:           Building2,
  kira:            Home,
  sigorta:         Shield,
  abonelik:        Radio,
  vergi:           ClipboardList,
  diger_odeme:     Package,
};

interface Props extends LucideProps {
  category: string;
}

export default function PaymentCategoryIcon({ category, size = 16, ...rest }: Props) {
  const Icon = ICONS[category] ?? Package;
  return <Icon size={size} {...rest} />;
}
