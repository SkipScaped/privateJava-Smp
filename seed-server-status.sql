-- Insert initial server status
INSERT INTO server_status (online, player_count, max_players, version, last_updated)
VALUES (true, 12, 50, 'Java 1.20.4', CURRENT_TIMESTAMP)
RETURNING *;
