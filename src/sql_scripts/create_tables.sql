-- create ENUM type for sound category
CREATE TYPE category AS ENUM (
  'Nature',
  'Animals',
  'Human',
  'Music'
);

CREATE TYPE theme AS ENUM (
  'Mysterious',
  'Aquatic',
  'Night',
  'House',
  'Ethereal',
  'Fantasy',
  'Elemental',
  'Insect',
  'Instrument',
  'Bird',
  'Action'
);

CREATE TABLE sounds (
  id SERIAL PRIMARY KEY,
  sound_name TEXT UNIQUE NOT NULL,
  audio_paths TEXT[] NOT NULL,
  image_path TEXT,
  looping BOOLEAN,
  volume INT default 50,
  reverb INT default 0,
  reverb_duration DECIMAL(3, 1) default 2.0,
  speed DECIMAL(2, 1) default 1.0,
  direction DECIMAL(2, 1) default 0.0,
  category category,
  themes theme[],
  -- Ponctual sounds options
  repeat_delay DECIMAL[]
);

CREATE TABLE ambiances (
  id SERIAL PRIMARY KEY,
  ambiance_name TEXT NOT NULL,
  author_id TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  categories category[],
  themes theme[]
);

CREATE TABLE ambiances_sounds (
  id SERIAL PRIMARY KEY,
  -- if an ambiance is deleted, delete the association rows where the ambiance was appearing, same for a sound
  ambiance_id INT NOT NULL REFERENCES ambiances(id) ON DELETE CASCADE,
  sound_id INT NOT NULL REFERENCES sounds(id) ON DELETE CASCADE,
  volume INT,
  direction DECIMAL(2, 1),
  speed DECIMAL(2, 1),
  reverb INT,
  reverb_duration DECIMAL(3, 1),
  low INT,
  mid INT,
  high INT,
  low_cut INT,
  high_cut INT,
  -- Ponctual sounds options
  repeat_delay DECIMAL[]
);

CREATE TABLE user_has_favorite_sounds (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  sound_id INT NOT NULL REFERENCES sounds(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_sound UNIQUE (user_id, sound_id)
);

CREATE TABLE user_has_favorite_ambiances (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  ambiance_id INT NOT NULL REFERENCES ambiances(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_ambiance UNIQUE (user_id, ambiance_id)
);
