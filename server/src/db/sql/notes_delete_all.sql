DELETE FROM notes
WHERE user_id = $1 AND deleted_at is not null;
