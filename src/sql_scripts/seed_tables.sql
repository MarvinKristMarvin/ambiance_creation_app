
-- insert 2 sounds
INSERT INTO sounds (sound_name, audio_paths, image_path, looping, volume, reverb, direction, category, themes)
VALUES 
  (
    'Rain',
    ARRAY['/audio/rain1.mp3'],
    '/photos/rain2.jpeg',
    true,
    80,
    0,
    0,
    'Elemental',
    ARRAY['Aquatic']::theme[]
  ),
  (
    'Frog croaking',
    ARRAY['/audio/frog_croaking.mp3'],
    '/photos/frog1.jpg',
    true,
    50,
    0,
    0,
    'Animals',
    ARRAY['Night', 'Spooky']::theme[]
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
  'Evening Jungle',
  'nUnk8X6wJozubjGALNir5ZBUyjNjfXn1',
  ARRAY['Elemental']::category[],
  ARRAY['Aquatic']::theme[]
);


-- link the sounds to the ambiance
INSERT INTO ambiances_sounds (ambiance_id, sound_id, volume, reverb, direction)
VALUES 
  (1, 1, 50, 0, 0),
  (1, 1, 30, 0, 0),
  (1, 2, 10, 0, 0),
  (2, 1, 80, 0, 0);

INSERT INTO user_has_favorite_sounds (user_id, sound_id)
VALUES
  ('nUnk8X6wJozubjGALNir5ZBUyjNjfXn1', 2);

  INSERT INTO user_has_favorite_ambiances (user_id, ambiance_id)
VALUES
  ('nUnk8X6wJozubjGALNir5ZBUyjNjfXn1', 1);
