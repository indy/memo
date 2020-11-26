UPDATE notes
SET triaged_at = now(), category_id = $3
WHERE id = $2 and user_id = $1
RETURNING $table_fields
