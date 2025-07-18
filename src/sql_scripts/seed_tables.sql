
BEGIN;

INSERT INTO sounds (sound_name, audio_paths, image_path, looping, category, themes, repeat_delay)
VALUES 
  (
    'Rain', -- sound name
    ARRAY['/audio/rain1.mp3'], -- audio paths
    '/photos/rain2.webp', -- image
    true, -- looping
    'Nature', -- category
    ARRAY['Aquatic', 'Elemental']::theme[], -- themes
    null
  ),
  (
    'Frog croaking',
    ARRAY['/audio/frog_croaking.mp3'],
    '/photos/frog1.webp',
    true,
    'Animals',
    ARRAY['Night', 'Mysterious']::theme[],
    null
  ),
  (
    'Page flip',
    ARRAY['/audio/page_flip_1.mp3', '/audio/page_flip_2.mp3'],
    '/photos/page_flip.webp',
    false,
    'Human',
    ARRAY['Night', 'Action']::theme[],
    ARRAY[5, 10]::DECIMAL[]
  ),
  (
    'Cat purring', -- sound name
    ARRAY['/audio/cat_purring.mp3'], -- audio paths
    '/photos/cat_purring.webp', -- image
    true, -- looping
    'Animals', -- category
    ARRAY['Night', 'House']::theme[], -- themes
    null -- repeat delay
  ),
  (
    'Chopping lettuce', -- sound name
    ARRAY['/audio/chopping_lettuce.mp3'], -- audio paths
    '/photos/chopping_lettuce.webp', -- image
    true, -- looping
    'Human', -- category
    ARRAY['House', 'Action']::theme[], -- themes
    null -- repeat delay
  ),
  ('Cutting vegetables', -- sound name
    ARRAY['/audio/cutting_vegetables.mp3'], -- audio paths
    '/photos/cutting_vegetables.webp', -- image
    true, -- looping
    'Human', -- category
    ARRAY['House', 'Action']::theme[], -- themes
    null -- repeat delay
  ),
  (
    'Coast thunder', -- sound name
    ARRAY['/audio/coast_thunder.mp3'], -- audio paths
    '/photos/coast_thunder.webp', -- image
    true, -- looping
    'Nature', -- category
    ARRAY['Elemental']::theme[], -- themes
    null -- repeat delay
  ),
  (
    'Cosmic uplifting', -- sound name
    ARRAY['/audio/cosmic_uplifting_1.mp3'], -- audio paths
    '/photos/cosmic_uplifting.webp', -- image
    true, -- looping
    'Music', -- category
    ARRAY['Ethereal']::theme[], -- themes
    null -- repeat delay
  ),
  (
    'Crackling fire', -- sound name
    ARRAY['/audio/crackling_fire.mp3'], -- audio paths
    '/photos/crackling_fire.webp', -- image
    true, -- looping
    'Nature', -- category
    ARRAY['Elemental']::theme[], -- themes
    null -- repeat delay
  ),
  (
    'Frying', -- sound name
    ARRAY['/audio/frying.mp3'], -- audio paths
    '/photos/frying.webp', -- image
    true, -- looping
    'Human', -- category
    ARRAY['House', 'Action']::theme[], -- themes
    null -- repeat delay
  ),
  (
    'Grassland birds', -- sound name
    ARRAY['/audio/grassland_birds.mp3'], -- audio paths
    '/photos/grassland_birds.webp', -- image
    true, -- looping
    'Animals', -- category
    ARRAY['Bird']::theme[], -- themes
    null -- repeat delay
  ),
  (
    'Horse galloping', -- sound name
    ARRAY['/audio/horse_galloping.mp3'], -- audio paths
    '/photos/horse_galloping.webp', -- image
    true, -- looping
    'Animals', -- category
    ARRAY['Fantasy','Action']::theme[], -- themes
    null -- repeat delay
  ),
  (
    'Jungle birds', -- sound name
    ARRAY['/audio/jungle_birds.mp3'], -- audio paths
    '/photos/jungle_birds.webp', -- image
    true, -- looping
    'Animals', -- category
    ARRAY['Bird']::theme[], -- themes
    null -- repeat delay
  ),
  (
    'Kalimba atmosphere', -- sound name
    ARRAY['/audio/kalimba_atmosphere_1.mp3'], -- audio paths
    '/photos/kalimba_atmosphere.webp', -- image
    false, -- looping
    'Music', -- category
    ARRAY['Mysterious', 'Instrument']::theme[], -- themes
    ARRAY[100, 200] -- repeat delay
  ),
  (
    'Kalimba note', -- sound name
    ARRAY['/audio/kalimba_note_1.mp3'], -- audio paths
    '/photos/kalimba_note.webp', -- image
    false, -- looping
    'Music', -- category
    ARRAY['Instrument']::theme[], -- themes
    ARRAY[20, 60] -- repeat delay
  ),
  ('Peeling potatoes', -- sound name
    ARRAY['/audio/peeling_potatoes.mp3'], -- audio paths
    '/photos/peeling_potatoes.webp', -- image
    true, -- looping
    'Human', -- category
    ARRAY['House', 'Action']::theme[], -- themes
    null -- repeat delay
  ),
  (
    'River birds', -- sound name
    ARRAY['/audio/river_and_birds.mp3'], -- audio paths
    '/photos/river_and_birds.webp', -- image
    true, -- looping
    'Animals', -- category
    ARRAY['Aquatic', 'Bird']::theme[], -- themes
    null -- repeat delay
  ),
  (
    'Running water', -- sound name
    ARRAY['/audio/running_water.mp3'], -- audio paths
    '/photos/running_water.webp', -- image
    true, -- looping
    'Nature', -- category
    ARRAY['Aquatic']::theme[], -- themes
    null -- repeat delay
  ),
  ('Storm chimes', -- sound name   
    ARRAY['/audio/storm_chimes.mp3'], -- audio paths
    '/photos/storm_chimes.webp', -- image
    true, -- looping
    'Nature', -- category
    ARRAY['Elemental', 'Instrument']::theme[], -- themes
    null -- repeat delay
  ),
  ('Underwater', -- sound name
    ARRAY['/audio/underwater_bubbles.mp3'], -- audio paths
    '/photos/underwater_bubbles.webp', -- image
    true, -- looping
    'Nature', -- category
    ARRAY['Aquatic']::theme[], -- themes
    null -- repeat delay
  ),
  ('Violent wind', -- sound name
    ARRAY['/audio/violent_wind.mp3'], -- audio paths
    '/photos/violent_wind.webp', -- image
    true, -- looping
    'Nature', -- category
    ARRAY['Elemental']::theme[], -- themes
    null -- repeat delay
  ),
  -- wind_thunder
  (
    'Wind thunder', -- sound name
    ARRAY['/audio/wind_thunder.mp3'], -- audio paths
    '/photos/wind_rain_thunder.webp', -- image
    true, -- looping
    'Nature', -- category
    ARRAY['Elemental']::theme[], -- themes
    null -- repeat delay
  ),
  -- wind_trees
  (
    'Wind trees', -- sound name
    ARRAY['/audio/wind_trees.mp3'], -- audio paths
    '/photos/wind_trees.webp', -- image
    true, -- looping
    'Nature', -- category
    ARRAY['Elemental']::theme[], -- themes
    null -- repeat delay
  ),
  -- creepy_voices
  (
    'Creepy voices', -- sound name
    ARRAY['/audio/creepy_voices_1.mp3'], -- audio paths
    '/photos/creepy_voices.webp', -- image
    true, -- looping
    'Human', -- category
    ARRAY['Mysterious', 'Night', 'Fantasy']::theme[], -- themes
    null -- repeat delay
  ),
  -- cricket_fast
  (
    'Cricket fast', -- sound name
    ARRAY['/audio/cricket_fast.mp3'], -- audio paths
    '/photos/cricket_fast.webp', -- image
    true, -- looping
    'Animals', -- category
    ARRAY['Insect']::theme[], -- themes
    null -- repeat delay
  ),
  -- cricket_soft
  (
    'Cricket soft', -- sound name
    ARRAY['/audio/cricket_soft.mp3'], -- audio paths
    '/photos/cricket_soft.webp', -- image
    true, -- looping
    'Animals', -- category
    ARRAY['Insect']::theme[], -- themes
    null -- repeat delay
  ),
  -- crickets_and_bugs
  (
    'Crickets and bugs', -- sound name
    ARRAY['/audio/crickets_and_bugs.mp3'], -- audio paths
    '/photos/crickets_and_bugs.webp', -- image
    true, -- looping
    'Animals', -- category
    ARRAY['Insect', 'Night']::theme[], -- themes
    null -- repeat delay
  ),
  -- dry_thunder
  (
    'Dry thunder', -- sound name
    ARRAY['/audio/dry_thunder.mp3'], -- audio paths
    '/photos/dry_thunder.webp', -- image
    true, -- looping
    'Nature', -- category
    ARRAY['Elemental']::theme[], -- themes
    null -- repeat delay
  ),
-- fireplace
  (
    'Fireplace', -- sound name
    ARRAY['/audio/fireplace.mp3'], -- audio paths
    '/photos/fireplace.webp', -- image
    true, -- looping
    'Nature', -- category
    ARRAY['Elemental']::theme[], -- themes
    null -- repeat delay
  ),
  -- flute_ethereal 
  (
    'Ethereal flute', -- sound name
    ARRAY['/audio/flute_ethereal.mp3'], -- audio paths
    '/photos/flute_ethereal.webp', -- image
    true, -- looping
    'Music', -- category
    ARRAY['Instrument', 'Ethereal']::theme[], -- themes
    null -- repeat delay
  ),
  -- forest_storm 
  (
    'Forest storm', -- sound name
    ARRAY['/audio/forest_storm.mp3'], -- audio paths
    '/photos/forest_storm.webp', -- image
    true, -- looping
    'Nature', -- category
    ARRAY['Elemental']::theme[], -- themes
    null -- repeat delay
  );

INSERT INTO ambiances (id, ambiance_name, author_id, categories, themes)
VALUES 
  (1, 'Abyssal dive with big creatures', 'nUnk8X6wJozubjGALNir5ZBUyjNjfXn1',
   ARRAY['Nature', 'Human']::category[], ARRAY['Fantasy', 'Mysterious', 'Night', 'Aquatic']::theme[]),
  (2, 'Reading next to a river', 'nUnk8X6wJozubjGALNir5ZBUyjNjfXn1',
   ARRAY['Animals', 'Nature', 'Human']::category[], ARRAY['Night', 'Bird', 'Insect', 'Aquatic', 'Action']::theme[]),
  (3, 'Japan mountain with slow flute', 'nUnk8X6wJozubjGALNir5ZBUyjNjfXn1',
   ARRAY['Nature', 'Music']::category[], ARRAY['Instrument', 'Ethereal', 'Elemental']::theme[]),
  (4, 'Cooking with the window open', 'nUnk8X6wJozubjGALNir5ZBUyjNjfXn1',
   ARRAY['Human', 'Animals']::category[], ARRAY['House', 'Action', 'Bird']::theme[]),
  (5, 'Hut with a fireplace, stormy outside', 'nUnk8X6wJozubjGALNir5ZBUyjNjfXn1',
   ARRAY['Nature']::category[], ARRAY['Elemental']::theme[]);

INSERT INTO ambiances_sounds (
  ambiance_id, sound_id, volume, reverb, reverb_duration, direction, speed,
  repeat_delay, low, mid, high, low_cut, high_cut
)
VALUES
  (1, 20, 92, 0, 0, 0, 0.8, NULL, -3, 0, 0, 20, 20000),
  (1, 24, 20, 78, 8, 0, 0.7, NULL, -3, -12, -2, 20, 20000),

  (2, 25, 4, 0, 0, 0, 0.9, NULL, -50, -24, 0, 20, 20000),
  (2, 11, 7, 0, 0, 0, 0.9, NULL, -50, -25, 0, 20, 20000),
  (2, 18, 7, 0, 2, 0, 0.6, NULL, -33, 0, -6, 20, 20000),
  (2, 3, 15, 0, 2, 0, 1.2, ARRAY[40, 80]::DECIMAL[], 0, -4, 0, 20, 20000),

  (3, 19, 85, 56, 8.3, 0, 1.0, NULL, -3, -2, 0, 20, 20000),
  (3, 30, 14, 67, 7, 0, 0.5, NULL, 0, -27, -50, 20, 20000),

  (4, 11, 5, 20, 2, 0, 0.8, NULL, -25, 0, -25, 20, 20000),
  (4, 5, 18, 0, 2, 0, 0.7, NULL, 0, 0, 0, 20, 20000),
  (4, 10, 50, 0, 2, 0, 1.0, NULL, 0, 0, 0, 20, 20000),

  (5, 29, 52, 0, 0, 0, 0.9, NULL, -24, 0, 0, 20, 20000),
  (5, 31, 87, 17, 1.8, 0, 1.0, NULL, 0, 0, -5, 20, 20000);

INSERT INTO user_has_favorite_ambiances (user_id, ambiance_id)
VALUES
  ('nUnk8X6wJozubjGALNir5ZBUyjNjfXn1', 1),
  ('nUnk8X6wJozubjGALNir5ZBUyjNjfXn1', 2),
  ('nUnk8X6wJozubjGALNir5ZBUyjNjfXn1', 3),
  ('nUnk8X6wJozubjGALNir5ZBUyjNjfXn1', 4),
  ('nUnk8X6wJozubjGALNir5ZBUyjNjfXn1', 5);


INSERT INTO user_has_favorite_sounds (user_id, sound_id)
VALUES
  ('nUnk8X6wJozubjGALNir5ZBUyjNjfXn1', 2);

-- Update the serial sequence id to avoid duplicate id conflicts
SELECT setval(
  pg_get_serial_sequence('ambiances', 'id'),
  (SELECT MAX(id) FROM ambiances),
  true
);

COMMIT;