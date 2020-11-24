UPDATE notes
SET deleted_at = null
WHERE id = $2 and user_id = $1
RETURNING $table_fields
