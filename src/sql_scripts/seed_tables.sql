-- insert 1 user
INSERT INTO users (hashed_password, email, pseudo, settings, created_at, updated_at)
VALUES (
  'hashed_password_example',
  'user@example.com',
  'UserOne',
  '{"theme": "dark", "volume": 80}'::jsonb,
  NOW(),
  NOW()
);

-- insert 2 sounds
INSERT INTO sounds (sound_name, audio_paths, image_path, looping, volume, reverb, direction, category)
VALUES 
  (
    'Rain',
    ARRAY['/audio/rain1.mp3'],
    '/photos/rain2.jpeg',
    true,
    80,
    0,
    0,
    'Vegetation'
  ),
  (
    'Frog croaking',
    ARRAY['/audio/frog_croaking.mp3'],
    '/photos/frog1.jpg',
    true,
    50,
    0,
    0,
    'Animals'
  );

-- insert 1 ambiance
INSERT INTO ambiances (ambiance_name, author_id)
VALUES (
  'Morning Jungle',
  1
),
(
  'Evening Jungle',
  1
);


-- link the sounds to the ambiance
INSERT INTO ambiances_sounds (ambiance_id, sound_id, volume, reverb, direction)
VALUES 
  (1, 1, 50, 0, 0),
  (1, 1, 30, 0, 0),
  (1, 2, 10, 0, 0),
  (2, 1, 80, 0, 0);
