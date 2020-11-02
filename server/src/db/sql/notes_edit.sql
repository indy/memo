UPDATE notes
SET title = $3, content = $4
WHERE id = $2 and user_id = $1
RETURNING $table_fields
