-- Seed the rubric criteria used for project scoring (TS-49).
-- Data only: no schema change. Safe to run once; re-running is a no-op.
INSERT INTO "rubric_criteria" ("id", "name", "description", "max_score") VALUES
  ('functionality', 'Functionality', 'Does the project work and do what it claims?', 5),
  ('code_quality', 'Code quality', 'Is the code readable, organised and reasonably safe?', 5),
  ('documentation', 'Documentation', 'Is there a clear README or docs explaining how to run and use it?', 5),
  ('ownership', 'Ownership', 'Is there clear evidence the candidate really built it?', 5)
ON CONFLICT ("id") DO NOTHING;
