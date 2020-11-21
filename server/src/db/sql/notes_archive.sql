UPDATE notes
SET archived_at = now()
WHERE id = $2 and user_id = $1
RETURNING $table_fields
