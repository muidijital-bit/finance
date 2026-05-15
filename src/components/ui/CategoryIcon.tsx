import {
  Briefcase, Monitor, TrendingUp, DollarSign,
  Users, Key, Landmark, Receipt, BarChart2, HardDrive,
  Wrench, CreditCard, Package, UtensilsCrossed, Car,
  Home, HeartPulse, BookOpen, Film, ShoppingBag, Zap, Tag,
  CreditCard as CreditCardAlt,
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import type { FC } from 'react';

type IconComp = FC<LucideProps>;

const ICONS: Record<string, IconComp> = {
  // Income
  salary:        Briefcase,
  freelance:     Monitor,
  investment:    TrendingUp,
  other_income:  DollarSign,
  // New expense
  personel:      Users,
  lisans_gider:  Key,
  kredi_gider:   Landmark,
  fatura:        Receipt,
  yatirim_gider: BarChart2,
  demirbas_alimi:HardDrive,
  hizmet_gideri: Wrench,
  kredi_karti:   CreditCard,
  other_expense: Package,
  // Legacy expense
  food:          UtensilsCrossed,
  transport:     Car,
  housing:       Home,
  health:        HeartPulse,
  education:     BookOpen,
  entertainment: Film,
  shopping:      ShoppingBag,
  utilities:     Zap,
};

interface Props extends LucideProps {
  category: string;
}

export default function CategoryIcon({ category, size = 14, ...rest }: Props) {
  const Icon = ICONS[category] ?? Tag;
  return <Icon size={size} {...rest} />;
}
