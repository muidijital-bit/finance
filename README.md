# FinansApp — Kişisel Finans Yönetimi

Next.js 15 + TypeScript ile geliştirilmiş kapsamlı bir kişisel finans yönetim uygulaması.

## 🚀 Özellikler

- **Dashboard** — Aylık özet, nakit akışı grafiği, bütçe durumu ve hedef takibi
- **İşlemler** — Gelir/gider ekleme, düzenleme, silme ve filtreleme
- **Bütçe** — Kategori bazlı aylık bütçe limitleri ve harcama takibi
- **Yatırımlar** — Hisse, kripto, fon ve diğer yatırımların kar/zarar takibi
- **Hedefler** — Tasarruf hedefleri oluşturma ve birikim ekleme
- **Raporlar** — Gelir/gider karşılaştırması, kategori dağılımı ve tasarruf trendi
- **Dark Mode** — Tam koyu tema desteği
- **Kalıcı Veri** — localStorage ile veri kalıcılığı

## 🛠 Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 15 (App Router) |
| Dil | TypeScript |
| Stil | Tailwind CSS |
| State | Zustand + persist |
| Grafikler | Recharts |
| İkonlar | Lucide React |

## 📦 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

## 🗂 Proje Yapısı

```
src/
├── app/                    # Next.js App Router sayfaları
│   ├── page.tsx            # Dashboard
│   ├── transactions/       # İşlemler
│   ├── budget/             # Bütçe
│   ├── investments/        # Yatırımlar
│   ├── goals/              # Hedefler
│   ├── reports/            # Raporlar
│   └── settings/           # Ayarlar
├── components/
│   ├── layout/             # Sidebar, TopBar
│   └── ui/                 # Card, Button, Modal, ProgressBar
├── lib/
│   ├── utils.ts            # Yardımcı fonksiyonlar
│   └── data.ts             # Demo veriler
├── store/
│   └── useFinanceStore.ts  # Zustand store
└── types/
    └── index.ts            # TypeScript tipleri
```

## 🌍 Deploy

```bash
npm run build
npm start
```

Vercel, Netlify veya herhangi bir Node.js platformunda deploy edilebilir.
