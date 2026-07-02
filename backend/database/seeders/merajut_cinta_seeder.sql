-- Clean up existing data for Merajut Cinta 2026 to ensure idempotency
DELETE FROM event_schedules WHERE event_id IN (SELECT id FROM events WHERE slug = 'merajut-cinta-2026');
DELETE FROM event_registrations WHERE event_id IN (SELECT id FROM events WHERE slug = 'merajut-cinta-2026');
DELETE FROM events WHERE slug = 'merajut-cinta-2026';

-- 1. Insert Event
INSERT INTO events (slug, name, type, year, start_date, end_date, description, location_name, location_maps_url, is_active, meta_data, created_at, updated_at)
VALUES (
  'merajut-cinta-2026',
  'Merajut Cinta — Keluarga Besar BAM',
  'youth_camp',
  2026,
  '2026-07-03 11:00:00',
  '2026-07-04 17:00:00',
  '<p><strong>Merajut Cinta</strong> adalah kegiatan rutin yang dirancang khusus agar generasi-generasi muda Bani Abdul Manan (BAM) &ndash; khususnya generasi ketiga (3G) ke bawah &ndash; dapat lebih mengenal mbah-mbah generasi pertama sekaligus saling mempererat keakraban satu sama lain.</p><p>Dengan mengusung kesan santai, menyenangkan, dan penuh kegembiraan layaknya liburan keluarga, format acara dikemas secara fleksibel tanpa aturan yang saklek. Kegiatan biasanya diisi dengan outbound seru, malam keakraban, serta berlibur ke tempat pariwisata menarik.</p><p>Rentang peserta acara ini ditujukan bagi adik-adik usia SMP hingga sebelum menikah, meskipun para anggota 3G yang sudah berkeluarga pun tetap dipersilakan untuk bergabung dan memeriahkan suasana bersama.</p>',
  'Vila Keeta, Pacet, Mojokerto',
  'https://maps.app.goo.gl/6TpWtNr4BHXv6sXp9',
  1,
  '[{"id":"1","icon":"home","type":"info","label":"Akomodasi","value":"Vila Keeta Pacet","description":"Fasilitas villa lengkap dengan kolam renang dan outbound area."},{"id":"2","icon":"apparel","type":"info","label":"Dresscode","value":"Kaos Anggota BAM","description":"Pembagian kaos dilakukan saat berkumpul di Miji."}]',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- 2. Insert Event Schedules
INSERT INTO event_schedules (event_id, day_sequence, title, time_start, time_end, description, created_at, updated_at)
VALUES
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 1, 'Kumpul di Miji (Pembagian Kaos & Ceremony Pemberangkatan)', '11:00:00', '13:00:00', 'Titik kumpul keberangkatan bersama', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 1, 'Makrab (Silsilah & Tradisi BAM)', '19:00:00', '22:00:00', 'Malam keakraban, pemaparan silsilah Bani Abdul Manan', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 2, 'Fun Game / Outbound', '07:00:00', '11:00:00', 'Kegiatan outdoor seru bersama keluarga', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 3. Insert Event Registrations (Decoupled from Silsilah Person initially)
INSERT INTO event_registrations (event_id, name, person_id, user_id, status, attendance, custom_data, created_at, updated_at)
VALUES
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Azil', NULL, NULL, 'pending', NULL, '{"transport_status":"motor"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Nopal', NULL, NULL, 'pending', NULL, '{"transport_status":"mobil"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Hikam', NULL, NULL, 'pending', NULL, '{"transport_status":"sopir"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Oby', NULL, NULL, 'pending', NULL, '{"transport_status":"mobil"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Alex', NULL, NULL, 'pending', NULL, '{"transport_status":"dw"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Sadra', NULL, NULL, 'pending', NULL, '{"transport_status":"mobil"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Humam', NULL, NULL, 'pending', NULL, '{"transport_status":"dw"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Mamat', NULL, NULL, 'pending', NULL, '{"transport_status":"dw"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Fayyadh', NULL, NULL, 'pending', NULL, '{"transport_status":"mobil"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Rikza', NULL, NULL, 'pending', NULL, '{"transport_status":"mobil"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Avis', NULL, NULL, 'pending', NULL, '{"transport_status":"mobil"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Fathir', NULL, NULL, 'pending', NULL, '{"transport_status":"dw"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Riski', NULL, NULL, 'pending', NULL, '{"transport_status":"dw"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Ashfa', NULL, NULL, 'pending', NULL, '{"transport_status":"mobil"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Rifki', NULL, NULL, 'pending', NULL, '{"transport_status":"mobil"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Ubay', NULL, NULL, 'pending', NULL, '{"transport_status":"mobil"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Mahes', NULL, NULL, 'pending', NULL, '{"transport_status":"mobil"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Kayla', NULL, NULL, 'pending', NULL, '{"transport_status":"mobil"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Nada', NULL, NULL, 'pending', NULL, '{"transport_status":"-"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Robet', NULL, NULL, 'pending', NULL, '{"transport_status":"mobil"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Fateh', NULL, NULL, 'pending', NULL, '{"transport_status":"mobil"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Syahrul', NULL, NULL, 'pending', NULL, '{"transport_status":"mobil"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Ubed', NULL, NULL, 'pending', NULL, '{"transport_status":"mobil"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Thoriq', NULL, NULL, 'pending', NULL, '{"transport_status":"dw"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Faruqi', NULL, NULL, 'pending', NULL, '{"transport_status":"dw"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Femi', NULL, NULL, 'pending', NULL, '{"transport_status":"mobil"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Ochi', NULL, NULL, 'pending', NULL, '{"transport_status":"mobil"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Mas Nehru', NULL, NULL, 'pending', NULL, '{"transport_status":"-"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Panjalu', NULL, NULL, 'pending', NULL, '{"transport_status":"dw"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Marsha', NULL, NULL, 'pending', NULL, '{"transport_status":"dw"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Zahir', NULL, NULL, 'pending', NULL, '{"transport_status":"mobil"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Kevin', NULL, NULL, 'pending', NULL, '{"transport_status":"mobil"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Zamira', NULL, NULL, 'pending', NULL, '{"transport_status":"dw"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Zaul', NULL, NULL, 'pending', NULL, '{"transport_status":"-"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Odi', NULL, NULL, 'pending', NULL, '{"transport_status":"dw"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Anas', NULL, NULL, 'pending', NULL, '{"transport_status":"sopir"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Zahra', NULL, NULL, 'pending', NULL, '{"transport_status":"mobil"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Ilham', NULL, NULL, 'pending', NULL, '{"transport_status":"mobil"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Sida', NULL, NULL, 'pending', NULL, '{"transport_status":"mobil"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Azza', NULL, NULL, 'pending', NULL, '{"transport_status":"mobil"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Ridho', NULL, NULL, 'pending', NULL, '{"transport_status":"mobil"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Faza', NULL, NULL, 'pending', NULL, '{"transport_status":"mobil"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Amik', NULL, NULL, 'pending', NULL, '{"transport_status":"-"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Izzat', NULL, NULL, 'pending', NULL, '{"transport_status":"dw"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Mila', NULL, NULL, 'pending', NULL, '{"transport_status":"-"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Zidan', NULL, NULL, 'pending', NULL, '{"transport_status":"dw"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Yakik', NULL, NULL, 'pending', NULL, '{"transport_status":"dw"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Muhyi', NULL, NULL, 'pending', NULL, '{"transport_status":"dw"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Salwa', NULL, NULL, 'pending', NULL, '{"transport_status":"-"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Salsa', NULL, NULL, 'pending', NULL, '{"transport_status":"dw"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Ara', NULL, NULL, 'pending', NULL, '{"transport_status":"-"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Nilna', NULL, NULL, 'pending', NULL, '{"transport_status":"-"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Aisy', NULL, NULL, 'pending', NULL, '{"transport_status":"-"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'mas muis', NULL, NULL, 'pending', NULL, '{"transport_status":"dw"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM events WHERE slug = 'merajut-cinta-2026'), 'Aldi', NULL, NULL, 'pending', NULL, '{"transport_status":"mobil"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
