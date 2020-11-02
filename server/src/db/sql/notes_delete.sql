DELETE FROM notes
WHERE id = $2 AND user_id = $1
