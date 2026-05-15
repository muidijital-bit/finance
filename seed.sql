-- muimedya Geçmiş Veri Seed
-- Mayıs 2025 - Mayıs 2026

-- ─── Ödeme Takvimi ─────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO payment_schedules (id,title,amount,currency,due_day,type,category,is_active,note) VALUES
('ps001','Ofis Aidat',9000,'TRY',8,'expense','utilities',1,'Aylık bina aidatı'),
('ps002','Ofis Kredisi',27100,'TRY',17,'expense','other_expense',1,'Muimedya ofis kredisi'),
('ps003','Araba Kredisi',37000,'TRY',17,'expense','transport',1,'Orfin - Renault'),
('ps004','Bağkur',10000,'TRY',15,'expense','other_expense',1,'SGK Bağkur'),
('ps005','SGK',6000,'TRY',15,'expense','other_expense',1,'Çalışan SGK primı');

-- ─── Mayıs 2025 Gelir ──────────────────────────────────────────────────────────
INSERT OR IGNORE INTO transactions (id,type,category,amount,description,date,service) VALUES
('h0001','income','freelance',10000,'İsmail - Aylık','2025-05-09','dijital_pazarlama'),
('h0002','income','freelance',10000,'Tarkan - Aylık','2025-05-10','dijital_pazarlama'),
('h0003','income','freelance',10000,'A2 Kuaför - Aylık','2025-05-12','dijital_pazarlama'),
('h0004','income','freelance',60000,'Sare Havuz - Backlink','2025-05-13','backlink'),
('h0005','income','freelance',25000,'Sare Havuz - Aylık Yönetim (Nisan)','2025-05-13','dijital_pazarlama'),
('h0006','income','freelance',20000,'Polo Mar - Web Sitesi','2025-05-14','web_tasarim'),
('h0007','income','freelance',10000,'Sarı Papyon Organizasyon','2025-05-14','diger'),
('h0008','income','freelance',10000,'Gözde Dursun - Aylık','2025-05-14','dijital_pazarlama'),
('h0009','income','freelance',5000,'Meltem Yılmaz - Aylık','2025-05-14','dijital_pazarlama'),
('h0010','income','freelance',15000,'Bmotors - Web Sitesi','2025-05-15','web_tasarim'),
('h0011','income','freelance',42000,'Elektromed - Web + Kurumsal Kimlik','2025-05-15','web_tasarim'),
('h0012','income','freelance',12000,'Ecozero - Aylık','2025-05-15','dijital_pazarlama'),
('h0013','income','freelance',4000,'Bihter - Aylık','2025-05-15','dijital_pazarlama'),
('h0014','income','freelance',15000,'Enda Dent - Aylık','2025-05-15','dijital_pazarlama'),
('h0015','income','freelance',10000,'Namedent - Aylık','2025-05-15','dijital_pazarlama'),
('h0016','income','freelance',10000,'Modern Havuz - Aylık','2025-05-15','dijital_pazarlama'),
('h0017','income','freelance',10000,'Koray - Aylık','2025-05-15','dijital_pazarlama'),
('h0018','income','freelance',10000,'Bmotors - Web Sitesi Bakiye','2025-05-20','web_tasarim'),
('h0019','income','freelance',20000,'Enda Dent - Aylık 2','2025-05-22','dijital_pazarlama'),
('h0020','income','freelance',4000,'Slimfast - Aylık','2025-05-22','dijital_pazarlama'),
('h0021','income','freelance',10000,'Tarkan - Aylık 2','2025-05-22','dijital_pazarlama'),
('h0022','income','freelance',10000,'İsmail - Aylık 2','2025-05-22','dijital_pazarlama'),
('h0023','income','freelance',10000,'Modern Havuz - Aylık 2','2025-05-22','dijital_pazarlama'),
('h0024','income','freelance',10000,'Namedent - Aylık 2','2025-05-22','dijital_pazarlama'),
('h0025','income','freelance',10000,'Gözde Dursun - Aylık 2','2025-05-22','dijital_pazarlama'),
('h0026','income','freelance',10000,'2A Kuaför - Aylık','2025-05-22','dijital_pazarlama'),
('h0027','income','freelance',25000,'Sare Havuz - Mayıs Aylık','2025-05-22','dijital_pazarlama'),
('h0028','income','freelance',4000,'Bihter - Mayıs 2','2025-05-22','dijital_pazarlama'),
('h0029','income','freelance',25000,'Welmet - Ön Ödeme','2025-05-25','diger'),
('h0030','income','freelance',10000,'Koray - Mayıs 2','2025-05-25','dijital_pazarlama');

-- ─── Haziran 2025 Gelir ────────────────────────────────────────────────────────
INSERT OR IGNORE INTO transactions (id,type,category,amount,description,date,service) VALUES
('h0031','income','freelance',10000,'Tarkan - Aylık','2025-06-10','dijital_pazarlama'),
('h0032','income','freelance',10000,'Modern Havuz - Aylık','2025-06-10','dijital_pazarlama'),
('h0033','income','freelance',20000,'Endadental - Aylık','2025-06-10','backlink'),
('h0034','income','freelance',20000,'Bmotors - Aylık','2025-06-10','dijital_pazarlama'),
('h0035','income','freelance',10000,'Koray - Aylık','2025-06-10','dijital_pazarlama'),
('h0036','income','freelance',18000,'Suluada - Web Sitesi','2025-06-12','web_tasarim'),
('h0037','income','freelance',10000,'2A Kuaför - Aylık','2025-06-12','dijital_pazarlama'),
('h0038','income','freelance',10000,'Gözde Dursun - Aylık','2025-06-12','dijital_pazarlama'),
('h0039','income','freelance',10000,'Durmaz Invest - Aylık','2025-06-12','dijital_pazarlama'),
('h0040','income','freelance',5000,'Meltem - Aylık','2025-06-12','dijital_pazarlama'),
('h0041','income','freelance',10000,'Bmotors - Backlink','2025-06-15','backlink'),
('h0042','income','freelance',10000,'Namedent - Aylık','2025-06-15','dijital_pazarlama'),
('h0043','income','freelance',4000,'Slimfast - Aylık','2025-06-15','dijital_pazarlama'),
('h0044','income','freelance',10000,'Dev Havuz - Aylık','2025-06-15','dijital_pazarlama'),
('h0045','income','freelance',25000,'Welmet - Ödeme','2025-06-15','diger'),
('h0046','income','freelance',20000,'Endadent - Backlink','2025-06-18','backlink'),
('h0047','income','freelance',3000,'İsmail - Aylık','2025-06-18','dijital_pazarlama'),
('h0048','income','freelance',33000,'Sare Havuz - Aylık','2025-06-20','dijital_pazarlama'),
('h0049','income','freelance',25000,'Bmotors - Backlink 2','2025-06-22','backlink');

-- ─── Ağustos 2025 Gelir ───────────────────────────────────────────────────────
INSERT OR IGNORE INTO transactions (id,type,category,amount,description,date,service) VALUES
('h0050','income','freelance',10000,'Modern Havuz - Aylık','2025-08-10','dijital_pazarlama'),
('h0051','income','freelance',20000,'Endadental - Aylık','2025-08-10','backlink'),
('h0052','income','freelance',20000,'Bmotors - Aylık','2025-08-10','dijital_pazarlama'),
('h0053','income','freelance',15000,'Koray - Backlink','2025-08-12','backlink'),
('h0054','income','freelance',25000,'Koray - Aylık','2025-08-12','dijital_pazarlama'),
('h0055','income','freelance',12000,'Dev Havuz - Kota','2025-08-12','dijital_pazarlama'),
('h0056','income','freelance',25000,'Durmaz Invest - Aylık','2025-08-15','dijital_pazarlama'),
('h0057','income','freelance',5000,'Meltem - Aylık','2025-08-15','dijital_pazarlama'),
('h0058','income','freelance',10000,'Namedent - Aylık','2025-08-15','dijital_pazarlama'),
('h0059','income','freelance',4000,'Slimfast - Aylık','2025-08-15','dijital_pazarlama'),
('h0060','income','freelance',15000,'Endadent - Web Sitesi','2025-08-18','web_tasarim'),
('h0061','income','freelance',25000,'Sare Havuz - Aylık','2025-08-20','dijital_pazarlama');

-- ─── Eylül 2025 Gelir ─────────────────────────────────────────────────────────
INSERT OR IGNORE INTO transactions (id,type,category,amount,description,date,service) VALUES
('h0062','income','freelance',30000,'Koray - Aylık','2025-09-10','dijital_pazarlama'),
('h0063','income','freelance',10000,'Modern Havuz - Aylık','2025-09-10','dijital_pazarlama'),
('h0064','income','freelance',20000,'Endadental - Aylık','2025-09-10','backlink'),
('h0065','income','freelance',20000,'Bmotors - Aylık','2025-09-10','dijital_pazarlama'),
('h0066','income','freelance',15000,'Koray - Backlink','2025-09-12','backlink'),
('h0067','income','freelance',13000,'Dev Havuz - Aylık','2025-09-12','dijital_pazarlama'),
('h0068','income','freelance',35000,'Durmaz Invest - Aylık','2025-09-15','dijital_pazarlama'),
('h0069','income','freelance',5000,'Meltem - Aylık','2025-09-15','dijital_pazarlama'),
('h0070','income','freelance',25000,'Namedent - Aylık','2025-09-15','dijital_pazarlama'),
('h0071','income','freelance',4000,'Slimfast - Aylık','2025-09-15','dijital_pazarlama'),
('h0072','income','freelance',15000,'Endadent - Backlink','2025-09-18','backlink'),
('h0073','income','freelance',25000,'Sare Havuz - Aylık','2025-09-18','dijital_pazarlama'),
('h0074','income','freelance',12000,'EcoZero - Aylık','2025-09-20','dijital_pazarlama'),
('h0075','income','freelance',10000,'Home Yapı - Aylık','2025-09-20','dijital_pazarlama'),
('h0076','income','freelance',10000,'Çankaya Yangın - Aylık','2025-09-20','dijital_pazarlama'),
('h0077','income','freelance',1500,'Mert - Banner','2025-09-22','grafik_tasarim');

-- ─── Ekim 2025 Gelir ──────────────────────────────────────────────────────────
INSERT OR IGNORE INTO transactions (id,type,category,amount,description,date,service) VALUES
('h0078','income','freelance',15000,'Koray - Aylık','2025-10-10','dijital_pazarlama'),
('h0079','income','freelance',15000,'Modern Havuz - Aylık','2025-10-10','dijital_pazarlama'),
('h0080','income','freelance',15000,'Endadental - Aylık','2025-10-10','backlink'),
('h0081','income','freelance',26600,'Bmotors - Aylık','2025-10-10','dijital_pazarlama'),
('h0082','income','freelance',15000,'Koray - Backlink','2025-10-12','backlink'),
('h0083','income','freelance',41000,'Durmaz Invest - Aylık','2025-10-12','dijital_pazarlama'),
('h0084','income','freelance',5000,'Meltem - Aylık','2025-10-15','dijital_pazarlama'),
('h0085','income','freelance',10000,'Namedent - Aylık','2025-10-15','dijital_pazarlama'),
('h0086','income','freelance',4000,'Slimfast - Aylık','2025-10-15','dijital_pazarlama'),
('h0087','income','freelance',20000,'Endadent - Aylık','2025-10-18','dijital_pazarlama'),
('h0088','income','freelance',25000,'Sare Havuz - Aylık','2025-10-18','dijital_pazarlama'),
('h0089','income','freelance',10000,'Home Yapı - Aylık','2025-10-20','dijital_pazarlama'),
('h0090','income','freelance',10000,'Çankaya Yangın - Aylık','2025-10-20','dijital_pazarlama'),
('h0091','income','freelance',1500,'Aspava - Banner','2025-10-22','grafik_tasarim'),
('h0092','income','freelance',36000,'Sarnic - Web Sitesi','2025-10-22','web_tasarim'),
('h0093','income','freelance',5000,'2P Artsatelier - Grafik','2025-10-25','grafik_tasarim');

-- ─── Ekim 2025 Gider ──────────────────────────────────────────────────────────
INSERT OR IGNORE INTO transactions (id,type,category,amount,description,date,service) VALUES
('h0094','expense','other_expense',15000,'Mucella - Ödeme','2025-10-23',null),
('h0095','expense','other_expense',9000,'Bağkur - Ekim','2025-10-25',null),
('h0096','expense','other_expense',6000,'SGK - Ekim','2025-10-25',null),
('h0097','expense','utilities',8000,'Ofis Aidat - Ekim','2025-10-08',null),
('h0098','expense','other_expense',15000,'Ofis Yangın Sigortası','2025-10-15',null),
('h0099','expense','other_expense',15000,'Ahmet - Maaş Avans','2025-10-25',null);

-- ─── Kasım 2025 Gelir ─────────────────────────────────────────────────────────
INSERT OR IGNORE INTO transactions (id,type,category,amount,description,date,service) VALUES
('h0100','income','freelance',10000,'Modern Havuz - Aylık','2025-11-10','dijital_pazarlama'),
('h0101','income','freelance',20000,'Endadental - Aylık','2025-11-10','backlink'),
('h0102','income','freelance',33155,'Durmaz Invest - Aylık','2025-11-12','dijital_pazarlama'),
('h0103','income','freelance',6500,'Meltem - Aylık','2025-11-12','dijital_pazarlama'),
('h0104','income','freelance',10000,'Namedent - Aylık','2025-11-15','dijital_pazarlama'),
('h0105','income','freelance',4000,'Slimfast - Aylık','2025-11-15','dijital_pazarlama'),
('h0106','income','freelance',20000,'Endadent - Backlink','2025-11-18','backlink'),
('h0107','income','freelance',30000,'Sare Havuz - Aylık','2025-11-18','dijital_pazarlama'),
('h0108','income','freelance',10000,'Home Yapı - Aylık','2025-11-20','dijital_pazarlama'),
('h0109','income','freelance',10000,'Çankaya Yangın - Aylık','2025-11-20','dijital_pazarlama'),
('h0110','income','freelance',10000,'Tüpraş - Promosyon','2025-11-22','promosyon');

-- ─── Aralık 2025 Gelir ────────────────────────────────────────────────────────
INSERT OR IGNORE INTO transactions (id,type,category,amount,description,date,service) VALUES
('h0111','income','freelance',10000,'Tarkan - Aylık','2025-12-10','dijital_pazarlama'),
('h0112','income','freelance',10000,'Modern Havuz - Aylık','2025-12-10','dijital_pazarlama'),
('h0113','income','freelance',20000,'Endadental - Backlink','2025-12-10','backlink'),
('h0114','income','freelance',26400,'Bmotors - Aylık','2025-12-10','dijital_pazarlama'),
('h0115','income','freelance',10000,'Hilal Pekgöz - Aylık','2025-12-12','dijital_pazarlama'),
('h0116','income','freelance',36200,'Durmaz Invest - Aylık','2025-12-12','dijital_pazarlama'),
('h0117','income','freelance',5000,'Meltem - Aylık','2025-12-12','dijital_pazarlama'),
('h0118','income','freelance',20000,'Namedent - Aylık','2025-12-15','dijital_pazarlama'),
('h0119','income','freelance',4000,'Slimfast - Aylık','2025-12-15','dijital_pazarlama'),
('h0120','income','freelance',20000,'Endadent - Aylık','2025-12-15','dijital_pazarlama'),
('h0121','income','freelance',30000,'Sare Havuz - Aylık','2025-12-18','dijital_pazarlama'),
('h0122','income','freelance',10000,'Bahri Bülbül - Aylık','2025-12-18','dijital_pazarlama'),
('h0123','income','freelance',10000,'Çankaya Yangın - Aylık','2025-12-20','dijital_pazarlama'),
('h0124','income','freelance',30000,'İmpro Mühendislik - Web','2025-12-22','web_tasarim');

-- ─── Aralık 2025 Gider ────────────────────────────────────────────────────────
INSERT OR IGNORE INTO transactions (id,type,category,amount,description,date,service) VALUES
('h0125','expense','utilities',25000,'Aidat - Yangın Tesisat','2025-12-08',null),
('h0126','expense','transport',37000,'Araba Kredi - Aralık','2025-12-17',null),
('h0127','expense','other_expense',27100,'Ofis Kredi - Aralık','2025-12-17',null),
('h0128','expense','other_expense',193000,'Numan - Kamera Sistemi','2025-12-20',null),
('h0129','expense','other_expense',25000,'Mehmet - Maaş','2025-12-25',null),
('h0130','expense','transport',1700000,'Araba Alımı - Renault','2025-12-28',null),
('h0131','expense','other_expense',3160,'Meltem - Meta Reklam Faturası','2025-12-30',null);

-- ─── Ocak 2026 Gelir ──────────────────────────────────────────────────────────
INSERT OR IGNORE INTO transactions (id,type,category,amount,description,date,service) VALUES
('h0132','income','freelance',11000,'Tarkan - Aylık','2026-01-10','dijital_pazarlama'),
('h0133','income','freelance',10000,'Modern Havuz - Aylık','2026-01-10','dijital_pazarlama'),
('h0134','income','freelance',20000,'Endadental - Backlink','2026-01-10','backlink'),
('h0135','income','freelance',26400,'Bmotors - Aylık','2026-01-10','dijital_pazarlama'),
('h0136','income','freelance',10000,'Dev Havuz - Aylık','2026-01-12','dijital_pazarlama'),
('h0137','income','freelance',36680,'Durmaz Invest - Aylık','2026-01-12','dijital_pazarlama'),
('h0138','income','freelance',3000,'Bmotors - Hosting','2026-01-12','dijital_pazarlama'),
('h0139','income','freelance',20000,'Namedent - Aylık','2026-01-15','dijital_pazarlama'),
('h0140','income','freelance',4000,'Slimfast - Aylık','2026-01-15','dijital_pazarlama'),
('h0141','income','freelance',20000,'Endadent - Aylık','2026-01-15','dijital_pazarlama'),
('h0142','income','freelance',30000,'Sare Havuz - Aylık','2026-01-15','dijital_pazarlama'),
('h0143','income','freelance',10000,'Egemen Parlar - Ön Ödeme','2026-01-18','web_tasarim'),
('h0144','income','freelance',10000,'Çankaya Yangın - Aylık','2026-01-18','dijital_pazarlama'),
('h0145','income','freelance',10000,'Seramik Hüseyin Bey - Ön Ödeme','2026-01-20','web_tasarim'),
('h0146','income','freelance',13200,'BİTes Savunma - NFC Kart','2026-01-22','promosyon'),
('h0147','income','freelance',30000,'İmpro Mühendislik - Web Tasarım','2026-01-22','web_tasarim'),
('h0148','income','freelance',25000,'Egemen Parlar - Kalan Ödeme','2026-01-25','web_tasarim'),
('h0149','income','freelance',20000,'Bahri Bülbül - Kalan Ödeme','2026-01-25','web_tasarim'),
('h0150','income','freelance',26400,'Bmotors - Ek Ödeme','2026-01-28','dijital_pazarlama');

-- ─── Ocak 2026 Gider ──────────────────────────────────────────────────────────
INSERT OR IGNORE INTO transactions (id,type,category,amount,description,date,service) VALUES
('h0151','expense','utilities',25000,'Ofis Aidat + Yangın','2026-01-08',null),
('h0152','expense','transport',37000,'Araba Kredi - Ocak','2026-01-17',null),
('h0153','expense','other_expense',27100,'Ofis Kredi - Ocak','2026-01-17',null),
('h0154','expense','other_expense',10000,'SGK - Ocak','2026-01-15',null),
('h0155','expense','other_expense',10000,'Bağkur - Ocak','2026-01-15',null),
('h0156','expense','other_expense',11000,'Mehmet - Maaş','2026-01-25',null),
('h0157','expense','other_expense',30000,'Taylan - Maaş','2026-01-25',null);

-- ─── Şubat 2026 Gelir ─────────────────────────────────────────────────────────
INSERT OR IGNORE INTO transactions (id,type,category,amount,description,date,service) VALUES
('h0158','income','freelance',18200,'Tarkan - Aylık','2026-02-10','dijital_pazarlama'),
('h0159','income','freelance',10000,'Modern Havuz - Aylık','2026-02-10','dijital_pazarlama'),
('h0160','income','freelance',20000,'Endadental - Backlink','2026-02-10','backlink'),
('h0161','income','freelance',52800,'Bmotors - Aylık (2x)','2026-02-10','dijital_pazarlama'),
('h0162','income','freelance',39600,'Durmaz Invest - Aylık','2026-02-12','dijital_pazarlama'),
('h0163','income','freelance',10000,'Meltem - Aylık','2026-02-12','dijital_pazarlama'),
('h0164','income','freelance',20000,'Namedent - Aylık','2026-02-15','dijital_pazarlama'),
('h0165','income','freelance',4000,'Slimfast - Aylık','2026-02-15','dijital_pazarlama'),
('h0166','income','freelance',20000,'Endadent - Aylık','2026-02-15','dijital_pazarlama'),
('h0167','income','freelance',30000,'Sare Havuz - Aylık','2026-02-15','dijital_pazarlama'),
('h0168','income','freelance',10000,'Çankaya Yangın - Aylık','2026-02-18','dijital_pazarlama'),
('h0169','income','freelance',20000,'Bahri Bülbül - Web + Bakiye','2026-02-18','web_tasarim'),
('h0170','income','freelance',24000,'ECO2 - Kontrollü Atmosfer Katalog','2026-02-20','grafik_tasarim');

-- ─── Şubat 2026 Gider ─────────────────────────────────────────────────────────
INSERT OR IGNORE INTO transactions (id,type,category,amount,description,date,service) VALUES
('h0171','expense','other_expense',30000,'Taylan - Maaş','2026-02-17',null),
('h0172','expense','other_expense',26000,'Mehmet - Maaş + Mac Taksit','2026-02-17',null),
('h0173','expense','other_expense',45000,'Sema - Maaş + Avans','2026-02-17',null),
('h0174','expense','transport',37000,'Araba Kredi - Şubat','2026-02-17',null),
('h0175','expense','other_expense',27100,'Ofis Kredi - Şubat','2026-02-17',null);

-- ─── Mart 2026 Gelir ──────────────────────────────────────────────────────────
INSERT OR IGNORE INTO transactions (id,type,category,amount,description,date,service) VALUES
('h0176','income','freelance',15000,'Tarkan - Aylık','2026-03-10','dijital_pazarlama'),
('h0177','income','freelance',10000,'Modern Havuz - Aylık','2026-03-10','dijital_pazarlama'),
('h0178','income','freelance',20000,'Endadental - Backlink','2026-03-10','backlink'),
('h0179','income','freelance',26400,'Bmotors - Aylık','2026-03-10','dijital_pazarlama'),
('h0180','income','freelance',42100,'Durmaz Invest - Aylık','2026-03-12','dijital_pazarlama'),
('h0181','income','freelance',20000,'Namedent - Aylık','2026-03-12','dijital_pazarlama'),
('h0182','income','freelance',4000,'Slimfast - Aylık','2026-03-15','dijital_pazarlama'),
('h0183','income','freelance',25000,'Endadent - Aylık','2026-03-15','dijital_pazarlama'),
('h0184','income','freelance',30000,'Sare Havuz - Aylık','2026-03-15','dijital_pazarlama'),
('h0185','income','freelance',35000,'Egemen Parlar Prive - Web','2026-03-15','web_tasarim'),
('h0186','income','freelance',10000,'Çankaya Yangın - Bakiye','2026-03-18','dijital_pazarlama'),
('h0187','income','freelance',50000,'Seramik Hüseyin Bey - Bakiye','2026-03-18','web_tasarim'),
('h0188','income','freelance',10000,'Bahri Bülbül - SEO Kalan','2026-03-18','backlink'),
('h0189','income','freelance',20000,'MEKA Petrol - Aylık','2026-03-20','dijital_pazarlama'),
('h0190','income','freelance',10000,'GreenArt Peyzaj - Web','2026-03-20','web_tasarim'),
('h0191','income','freelance',20000,'Neşeli Tir - Web','2026-03-20','web_tasarim'),
('h0192','income','freelance',20000,'Celal Kaptan - Hizmet','2026-03-22','diger'),
('h0193','income','freelance',30000,'Murat Atmaca - Web Sitesi','2026-03-22','web_tasarim'),
('h0194','income','freelance',24000,'Eco Sürdürülebilirlik - Hizmet','2026-03-22','diger'),
('h0195','income','freelance',10000,'Rozet Promosyon','2026-03-25','promosyon'),
('h0196','income','freelance',11000,'Tüpraş - Yaka Kartı','2026-03-25','promosyon'),
('h0197','income','freelance',11000,'Eva Elektronik - NFC Kart','2026-03-25','promosyon'),
('h0198','income','freelance',5000,'Eva - Kartvizit','2026-03-25','promosyon');

-- ─── Mart 2026 Gider ──────────────────────────────────────────────────────────
INSERT OR IGNORE INTO transactions (id,type,category,amount,description,date,service) VALUES
('h0199','expense','other_expense',23300,'Taylan - İhbar Tazminatı + Mart','2026-03-25',null),
('h0200','expense','other_expense',27100,'Ofis Kredi - Mart','2026-03-17',null),
('h0201','expense','transport',37000,'Araba Kredi - Mart','2026-03-17',null),
('h0202','expense','other_expense',45000,'Yapıkredi Kart - Mart','2026-03-15',null),
('h0203','expense','other_expense',45000,'İşbankası Kart - Mart','2026-03-15',null),
('h0204','expense','other_expense',40000,'Cemal - Maaş','2026-03-25',null),
('h0205','expense','other_expense',25000,'Mehmet - Maaş + Mac Taksit','2026-03-25',null);

-- ─── Nisan 2026 Gelir ─────────────────────────────────────────────────────────
INSERT OR IGNORE INTO transactions (id,type,category,amount,description,date,service) VALUES
('h0206','income','freelance',15000,'Tarkan - Aylık','2026-04-10','dijital_pazarlama'),
('h0207','income','freelance',10000,'Modern Havuz - Aylık','2026-04-10','dijital_pazarlama'),
('h0208','income','freelance',34200,'Bmotors - Aylık','2026-04-10','dijital_pazarlama'),
('h0209','income','freelance',31200,'Durmaz Invest - Aylık','2026-04-12','dijital_pazarlama'),
('h0210','income','freelance',10000,'Meltem - Aylık','2026-04-12','dijital_pazarlama'),
('h0211','income','freelance',20000,'Namedent - Aylık','2026-04-12','dijital_pazarlama'),
('h0212','income','freelance',4000,'Slimfast - Aylık','2026-04-15','dijital_pazarlama'),
('h0213','income','freelance',25000,'Endadent - Aylık','2026-04-15','dijital_pazarlama'),
('h0214','income','freelance',54000,'Sare Havuz - Aylık + Ek','2026-04-15','dijital_pazarlama'),
('h0215','income','freelance',20000,'MEKA Petrol - Aylık','2026-04-18','dijital_pazarlama'),
('h0216','income','freelance',12000,'GreenArt Peyzaj - Aylık','2026-04-18','web_tasarim'),
('h0217','income','freelance',40000,'Neşeli Tir - Aylık','2026-04-18','web_tasarim'),
('h0218','income','freelance',24000,'Tüpraş - Döküm Rozet','2026-04-20','promosyon'),
('h0219','income','freelance',20000,'Trambolinpark - Web Ön Ödeme','2026-04-17','web_tasarim'),
('h0220','income','freelance',60000,'Sare Havuz & Poolmar - Web + Kurumsal Kimlik','2026-04-20','kurumsal_kimlik');

-- ─── Nisan 2026 Gider ─────────────────────────────────────────────────────────
INSERT OR IGNORE INTO transactions (id,type,category,amount,description,date,service) VALUES
('h0221','expense','other_expense',32000,'Sema - Maaş','2026-04-25',null),
('h0222','expense','other_expense',40000,'Cemal - Maaş','2026-04-25',null),
('h0223','expense','other_expense',25000,'Mehmet - Maaş + Avans + Taksit','2026-04-25',null),
('h0224','expense','utilities',9000,'Ofis Aidat - Nisan','2026-04-08',null),
('h0225','expense','other_expense',27100,'Ofis Kredi - Nisan','2026-04-17',null),
('h0226','expense','transport',37000,'Araba Kredi - Nisan','2026-04-17',null),
('h0227','expense','other_expense',51000,'Yapıkredi Kart - Nisan','2026-04-15',null),
('h0228','expense','other_expense',24000,'Yapıkredi Hepsiburada','2026-04-15',null),
('h0229','expense','other_expense',50000,'İşbankası Kart - 4 Nisan','2026-04-04',null),
('h0230','expense','other_expense',2400,'Tüpraş - Promosyon Maliyeti (Madalya)','2026-04-20',null),
('h0231','expense','other_expense',60000,'Garanti Kart - 5 Mayıs','2026-05-05',null);

-- ─── Mayıs 2026 Gelir ─────────────────────────────────────────────────────────
INSERT OR IGNORE INTO transactions (id,type,category,amount,description,date,service) VALUES
('h0232','income','freelance',15000,'Tarkan - Aylık','2026-05-10','dijital_pazarlama'),
('h0233','income','freelance',34200,'Bmotors - Aylık','2026-05-10','dijital_pazarlama'),
('h0234','income','freelance',31200,'Durmaz Invest - Aylık','2026-05-10','dijital_pazarlama'),
('h0235','income','freelance',4000,'Slimfast - Aylık','2026-05-12','dijital_pazarlama'),
('h0236','income','freelance',25000,'Endadent - Aylık','2026-05-12','dijital_pazarlama'),
('h0237','income','freelance',15000,'Egemen Parlar Prive - Aylık','2026-05-12','web_tasarim'),
('h0238','income','freelance',30000,'AOL Sigorta - Web Tasarım','2026-05-13','web_tasarim'),
('h0239','income','freelance',20000,'Eymen & Buğra - Web Yazılım Ön Ödeme','2026-05-06','web_tasarim'),
('h0240','income','freelance',58000,'Eva Mühendislik - Hizmet','2026-05-15','web_tasarim'),
('h0241','income','freelance',42000,'Bega Savunma - Hizmet','2026-05-15','diger'),
('h0242','income','freelance',100000,'Neşeli Otomotiv - Yazılım Ön Ödeme','2026-05-15','web_tasarim');

-- ─── Mayıs 2026 Gider ─────────────────────────────────────────────────────────
INSERT OR IGNORE INTO transactions (id,type,category,amount,description,date,service) VALUES
('h0243','expense','other_expense',15000,'Çiçek Çınar - Maaş','2026-05-25',null),
('h0244','expense','other_expense',10000,'Şems Erik - Prodüksiyon Maaş','2026-05-25',null),
('h0245','expense','other_expense',3000,'Mehmet - Avans','2026-05-10',null),
('h0246','expense','other_expense',12300,'Balkon Granit - Ofis','2026-05-15',null),
('h0247','expense','other_expense',16000,'Serkan - Freelance (Sare Havuz Web)','2026-05-20',null),
('h0248','expense','other_expense',73000,'İşbankası Kart - Mayıs','2026-05-10',null);
