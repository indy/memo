UPDATE notes
SET triaged_at = null, category_id = null
WHERE id = $2 and user_id = $1
RETURNING $table_fields
