CREATE TABLE IF NOT EXISTS event_counts (
  event TEXT PRIMARY KEY CHECK (event IN ('visit', 'copy', 'share')),
  count INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0)
);

INSERT OR IGNORE INTO event_counts (event, count) VALUES
  ('visit', 0),
  ('copy', 0),
  ('share', 0);
