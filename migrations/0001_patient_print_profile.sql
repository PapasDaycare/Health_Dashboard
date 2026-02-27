CREATE TABLE IF NOT EXISTS patient_print_profile (
  user_id BIGINT PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT '',
  dob TEXT NOT NULL DEFAULT '',
  allergies TEXT NOT NULL DEFAULT '',
  emergency_contact TEXT NOT NULL DEFAULT '',
  pharmacy TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
