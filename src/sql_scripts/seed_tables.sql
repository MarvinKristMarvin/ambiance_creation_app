
-- insert 2 sounds
INSERT INTO sounds (sound_name, audio_paths, image_path, looping, volume, reverb, reverb_duration, direction, speed, category, themes, repeat_delay)
VALUES 
  (
    'Rain', -- sound name
    ARRAY['/audio/rain1.mp3'], -- audio paths
    '/photos/rain2.jpeg', -- image
    true, -- looping
    50, -- volume
    0, -- reverb
    3, -- reverb duration
    0, -- direction
    1, -- speed
    'Elemental', -- category
    ARRAY['Aquatic']::theme[], -- themes
    null
  ),
  (
    'Frog croaking',
    ARRAY['/audio/frog_croaking.mp3'],
    '/photos/frog1.jpg',
    true,
    50,
    0,
    3,
    0,
    1,
    'Animals',
    ARRAY['Night', 'Spooky']::theme[],
    null
  ),
  (
    'Page flip',
    ARRAY['/audio/page_flip_1.mp3', '/audio/page_flip_2.mp3'],
    '/photos/page_flip.jpeg',
    false,
    50,
    0,
    3,
    0,
    1,
    'Human',
    ARRAY['Night']::theme[],
    -- repeat delay in seconds 1.5 to 10
    ARRAY[5, 10]::DECIMAL[]
  );

-- insert 1 ambiance
INSERT INTO ambiances (ambiance_name, author_id, categories, themes)
VALUES (
  'Morning Jungle',
  'nUnk8X6wJozubjGALNir5ZBUyjNjfXn1', -- marv@example.com marvmarv
  ARRAY['Elemental', 'Animals']::category[],
  ARRAY['Night', 'Spooky']::theme[]
),
(
  'Before sleeping books',
  'nUnk8X6wJozubjGALNir5ZBUyjNjfXn1', -- marv@example.com marvmarv
  ARRAY['Elemental', 'Human']::category[],
  ARRAY['Night', 'Aquatic']::theme[]
),
(
  'Evening Jungle',
  'nUnk8X6wJozubjGALNir5ZBUyjNjfXn1',
  ARRAY['Elemental']::category[],
  ARRAY['Aquatic']::theme[]
);


-- link the sounds to the ambiance
INSERT INTO ambiances_sounds (ambiance_id, sound_id, volume, reverb, reverb_duration, direction, speed, repeat_delay, low, mid, high, low_cut, high_cut)
VALUES 
  (1, 1, 50, 0, 3, 0, 1, null, 0, 0, 0, 20, 20000),
  (1, 1, 30, 0, 3, 0, 1, null, 0, 0, 0, 20, 20000),
  (1, 2, 10, 0, 3, 0, 1, null, 0, 0, 0, 20, 20000),
  (2, 1, 50, 0, 3, 0, 1, null, 0, 0, 0, 20, 20000),
  (2, 3, 50, 0, 3, 0, 1, ARRAY[15, 30]::DECIMAL[], 0, 0, 0, 20, 20000),
  (3, 1, 80, 0, 3, 0, 1, null, 0, 0, 0, 20, 20000);

INSERT INTO user_has_favorite_sounds (user_id, sound_id)
VALUES
  ('nUnk8X6wJozubjGALNir5ZBUyjNjfXn1', 2);

  INSERT INTO user_has_favorite_ambiances (user_id, ambiance_id)
VALUES
  ('nUnk8X6wJozubjGALNir5ZBUyjNjfXn1', 1);
