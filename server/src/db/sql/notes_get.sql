SELECT n.id,
       n.title,
       n.content
FROM notes n
WHERE n.id = $2 AND n.user_id = $1
