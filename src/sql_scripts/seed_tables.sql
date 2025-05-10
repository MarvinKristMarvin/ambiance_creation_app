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
INSERT INTO sounds (sound_name, audio_paths, image_path, looping, volume, reverb, direction, repeat_delay, category)
VALUES 
  (
    'Rain',
    ARRAY['/audio/rain1.mp3'],
    '/photos/rain2.jpeg',
    true,
    80,
    0,
    0,
    ARRAY[5.0, 10.0],
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
    ARRAY[3.0, 6.0],
    'Animals'
  );

-- insert 1 ambiance
INSERT INTO ambiances (ambiance_name, author_id, likes, settings, total_duration, sections)
VALUES (
  'Morning Jungle',
  1,
  0,
  '{
    "sections": [
      {
        "duration": 6000,
        "smoothing_time": 3.5,
        "sounds": [
          {
            "sound_id": 1,
            "number": 1,
            "volume": 40,
            "reverb": 0,
            "direction": 0,
            "repeat_delay": [5.0, 10.0]
          },
          {
            "sound_id": 2,
            "number": 1,
            "volume": 80,
            "reverb": 0,
            "direction": 0,
            "repeat_delay": [5.0, 10.0]
          }
        ]
      },
      {
        "duration": 30,
        "smoothing_time": 3,
        "sounds": [
          {
            "sound_id": 2,
            "number": 2,
            "volume": 10,
            "reverb": 0,
            "direction": 0,
            "repeat_delay": [5.0, 10.0]
          }
        ]
      },
      {
        "duration": 660,
        "smoothing_time": 4.5,
        "sounds": [
          {
            "sound_id": 1,
            "number": 2,
            "volume": 10,
            "reverb": 0,
            "direction": 0,
            "repeat_delay": [5.0, 10.0]
          }
        ]
      }
    ]
  }'::jsonb,
  600,
  3
);


-- link the sounds to the ambiance
INSERT INTO ambiances_sounds (ambiance_id, sound_id)
VALUES 
  (1, 1),
  (1, 2);
