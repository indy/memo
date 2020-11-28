SELECT n.id,
       n.title,
       n.content,
       n.triaged_at,
       n.category_id
FROM notes n
WHERE n.id = $2 AND n.user_id = $1
