# Past Continuous Quiz Insert Query

```sql
WITH
new_quiz AS (
  INSERT INTO public.quizzes (title, description)
  VALUES (
    'Past Continuous - Practice (40 Questions)',
    'Mixed multiple-choice and open-ended practice on the past continuous tense.'
  )
  RETURNING id
),
raw_questions (ord, question_text, question_type) AS (
  VALUES
    (1, '1. I _____ a book when the phone rang.', 'multiple_choice'),
    (2, '2. They _____ playing football yesterday afternoon.', 'multiple_choice'),
    (3, '3. _____ she sleeping when you knocked on the door?', 'multiple_choice'),
    (4, '4. We were eating dinner _____ the power went out.', 'multiple_choice'),
    (5, '5. While the teacher was speaking, the students _____ taking notes.', 'multiple_choice'),
    (6, '6. I _____ (watch) a documentary at 8 PM yesterday.', 'open_ended'),
    (7, '7. She _____ (not / cook) dinner last night; we ordered pizza.', 'open_ended'),
    (8, '8. The sun _____ (shine) beautifully when we woke up.', 'open_ended'),
    (9, '9. We _____ (not / listen) to the radio during the drive.', 'open_ended'),
    (10, '10. The dog _____ (bark) loudly at the mailman.', 'open_ended'),
    (11, '11. My computer _____ (not / work) properly yesterday morning.', 'open_ended'),
    (12, '12. The children _____ (play) quietly in their room.', 'open_ended'),
    (13, '13. I _____ (not / pay) attention when the instructor gave the directions.', 'open_ended'),
    (14, '14. It _____ (rain) heavily all day on Sunday.', 'open_ended'),
    (15, '15. He _____ (not / wear) a jacket, so he felt very cold.', 'open_ended'),
    (16, '16. _____ you _____ (sleep) when I called you?', 'open_ended'),
    (17, '17. What _____ he _____ (do) at midnight?', 'open_ended'),
    (18, '18. _____ they _____ (wait) for the bus at 9 AM?', 'open_ended'),
    (19, '19. Why _____ she _____ (cry) during the movie?', 'open_ended'),
    (20, '20. _____ the wind _____ (blow) hard last night?', 'open_ended'),
    (21, '21. Where _____ you _____ (drive) when the tire went flat?', 'open_ended'),
    (22, '22. _____ I _____ (talk) too fast during the presentation?', 'open_ended'),
    (23, '23. What _____ the manager _____ (say) when you walked in?', 'open_ended'),
    (24, '24. _____ you _____ (use) the printer when it broke down?', 'open_ended'),
    (25, '25. Who _____ he _____ (argue) with in the hallway?', 'open_ended'),
    (26, '26. I _____ (have) lunch when the fire alarm suddenly went off.', 'open_ended'),
    (27, '27. He drove past me while I _____ (stand) at the bus stop.', 'open_ended'),
    (28, '28. They _____ (not / look) at the map when they took the wrong turn.', 'open_ended'),
    (29, '29. _____ she _____ (run) towards the station when she dropped her bag?', 'open_ended'),
    (30, '30. We _____ (sit) in the cafe when the accident happened outside.', 'open_ended'),
    (31, '31. While Sarah _____ (clean) the house, Tom _____ (mow) the lawn.', 'open_ended'),
    (32, '32. They _____ (plan) their trip while I _____ (pack) my suitcases.', 'open_ended'),
    (33, '33. As the birds _____ (sing), the cat _____ (creep) through the tall grass.', 'open_ended'),
    (34, '34. I _____ (think) about you just as you _____ (text) me.', 'open_ended'),
    (35, '35. While the band _____ (play) their final song, the crowd _____ (cheer) wildly.', 'open_ended'),
    (36, '36. I _____ (lie) on the beach, enjoying the sun, when the storm suddenly rolled in.', 'open_ended'),
    (37, '37. The guests _____ (arrive) just as we _____ (leave) the house.', 'open_ended'),
    (38, '38. _____ you _____ (try) to fix the sink while the water _____ (leak)?', 'open_ended'),
    (39, '39. She dropped her keys as she _____ (unlock) the front door.', 'open_ended'),
    (40, '40. We _____ (argue) about the directions while he _____ (drive) in circles.', 'open_ended')
),
ins_questions AS (
  INSERT INTO public.questions (question, question_type)
  SELECT question_text, question_type
  FROM raw_questions
  ORDER BY ord
  RETURNING id, question
),
question_map AS (
  SELECT rq.ord, iq.id AS question_id
  FROM raw_questions rq
  JOIN ins_questions iq
    ON iq.question = rq.question_text
),
raw_options (ord, option_text, is_correct) AS (
  VALUES
    (1, 'was reading', true),
    (1, 'were reading', false),
    (1, 'read', false),
    (1, 'am reading', false),

    (2, 'wasn''t', false),
    (2, 'didn''t', false),
    (2, 'weren''t', true),
    (2, 'aren''t', false),

    (3, 'Were', false),
    (3, 'Was', true),
    (3, 'Did', false),
    (3, 'Is', false),

    (4, 'while', false),
    (4, 'as', false),
    (4, 'when', true),
    (4, 'then', false),

    (5, 'was', false),
    (5, 'are', false),
    (5, 'were', true),
    (5, 'did', false)
),
ins_options AS (
  INSERT INTO public.question_options (question_id, option_text, is_correct)
  SELECT qm.question_id, ro.option_text, ro.is_correct
  FROM raw_options ro
  JOIN question_map qm
    ON qm.ord = ro.ord
  RETURNING id
),
raw_answers (ord, answer_text, blank_index) AS (
  VALUES
    (1, 'was reading', 1),
    (2, 'weren''t', 1),
    (3, 'Was', 1),
    (4, 'when', 1),
    (5, 'were', 1),
    (6, 'was watching', 1),
    (7, 'wasn''t cooking', 1),
    (8, 'was shining', 1),
    (9, 'weren''t listening', 1),
    (10, 'was barking', 1),
    (11, 'wasn''t working', 1),
    (12, 'were playing', 1),
    (13, 'wasn''t paying', 1),
    (14, 'was raining', 1),
    (15, 'wasn''t wearing', 1),
    (16, 'were sleeping', 1),
    (17, 'was doing', 1),
    (18, 'were waiting', 1),
    (19, 'was crying', 1),
    (20, 'was blowing', 1),
    (21, 'were driving', 1),
    (22, 'was talking', 1),
    (23, 'was saying', 1),
    (24, 'were using', 1),
    (25, 'was arguing', 1),
    (26, 'was having', 1),
    (27, 'was standing', 1),
    (28, 'weren''t looking', 1),
    (29, 'was running', 1),
    (30, 'were sitting', 1),
    (31, 'was cleaning; was mowing', 1),
    (32, 'were planning; was packing', 1),
    (33, 'were singing; was creeping', 1),
    (34, 'was thinking; were texting', 1),
    (35, 'was playing; was cheering', 1),
    (36, 'was lying', 1),
    (37, 'were arriving; were leaving', 1),
    (38, 'were trying; was leaking', 1),
    (39, 'was unlocking', 1),
    (40, 'were arguing; was driving', 1)
),
ins_answers AS (
  INSERT INTO public.answers (question_id, answer, blank_index)
  SELECT qm.question_id, ra.answer_text, ra.blank_index
  FROM raw_answers ra
  JOIN question_map qm
    ON qm.ord = ra.ord
  RETURNING id
),
ins_quiz_questions AS (
  INSERT INTO public.quiz_questions (quiz_id, question_id, max_points)
  SELECT
    nq.id,
    qm.question_id,
    CASE
      WHEN qm.ord BETWEEN 1 AND 5 THEN 1
      WHEN qm.ord BETWEEN 6 AND 25 THEN 2
      WHEN qm.ord BETWEEN 26 AND 35 THEN 3
      WHEN qm.ord BETWEEN 36 AND 40 THEN 5
    END
  FROM question_map qm
  CROSS JOIN new_quiz nq
  ORDER BY qm.ord
  RETURNING id
)
SELECT
  (SELECT id FROM new_quiz) AS quiz_id,
  (SELECT COUNT(*) FROM ins_questions) AS inserted_questions,
  (SELECT COUNT(*) FROM ins_options) AS inserted_options,
  (SELECT COUNT(*) FROM ins_answers) AS inserted_answers,
  (SELECT COUNT(*) FROM ins_quiz_questions) AS inserted_quiz_questions;
```
