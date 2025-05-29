-- create ENUM type for sound category
CREATE TYPE sound_category AS ENUM (
  'Vegetation',
  'Animals',
  'Insects',
  'Human',
  'Objects'
);

CREATE TABLE sounds (
  id SERIAL PRIMARY KEY,
  sound_name TEXT UNIQUE NOT NULL,
  audio_paths TEXT[] NOT NULL,
  image_path TEXT,
  looping BOOLEAN,
  volume INT,
  reverb INT,
  direction INT,
  category sound_category
);

CREATE TABLE ambiances (
  id SERIAL PRIMARY KEY,
  ambiance_name TEXT NOT NULL,
  author_id INT REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE ambiances_sounds (
  id SERIAL PRIMARY KEY,
  -- if an ambiance is deleted, delete the association rows where the ambiance was appearing, same for a sound
  ambiance_id INT NOT NULL REFERENCES ambiances(id) ON DELETE CASCADE,
  sound_id INT NOT NULL REFERENCES sounds(id) ON DELETE CASCADE,
  volume INT,
  reverb INT,
  direction INT
);
