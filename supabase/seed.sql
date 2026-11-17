-- Seed data for local development and demos.
-- Administrators are created manually in Supabase Auth, then promoted:
--   update profiles set role = 'admin' where id = '<auth-user-id>';

insert into hostels (name, location, capacity, gender_type)
values
  ('Kuti Hall', 'North Campus', 120, 'male'),
  ('Tedder Hall', 'North Campus', 120, 'male'),
  ('Queen Idia Hall', 'South Campus', 140, 'female')
on conflict (name) do nothing;

insert into rooms (hostel_id, room_number, capacity)
select h.id, r.room_number, r.capacity
from (
  values
    ('Kuti Hall', 'A101', 4),
    ('Kuti Hall', 'A102', 4),
    ('Kuti Hall', 'A103', 2),
    ('Tedder Hall', 'B101', 4),
    ('Tedder Hall', 'B102', 4),
    ('Tedder Hall', 'B103', 2),
    ('Queen Idia Hall', 'C101', 4),
    ('Queen Idia Hall', 'C102', 4),
    ('Queen Idia Hall', 'C103', 2)
) as r (hostel_name, room_number, capacity)
join hostels h on h.name = r.hostel_name
on conflict (hostel_id, room_number) do nothing;
