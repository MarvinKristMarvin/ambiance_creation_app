
-- INSERT INTO ambiances (id, ambiance_name, author_id, categories, themes)
-- VALUES (
--   10002,
--   'Abyssal dive with big creatures 3',
--   'nUnk8X6wJozubjGALNir5ZBUyjNjfXn1',
--   ARRAY['Nature', 'Human']::category[],
--   ARRAY['Fantasy', 'Mysterious', 'Night', 'Aquatic']::theme[]
-- );

-- INSERT INTO ambiances_sounds (
--   id, ambiance_id, sound_id, volume, reverb, reverb_duration, direction, speed,
--   repeat_delay, low, mid, high, low_cut, high_cut
-- )
-- VALUES 
--   (
--     1000001, 10002, 20, 92, 0, 0, 0, 0.8,
--     NULL, -3, 0, 0, 20, 20000
--   ),
--   (
--     1000002, 10002, 24, 20, 78, 8, 0, 0.7,
--     NULL, -3, -12, -2, 20, 20000
--   );

--     INSERT INTO user_has_favorite_ambiances (user_id, ambiance_id)
-- VALUES
--   ('nUnk8X6wJozubjGALNir5ZBUyjNjfXn1', 10002);