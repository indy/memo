SELECT n.id,
       n.title,
       n.content,
       n.archived_at
FROM   notes n
WHERE  n.user_id = $1 and n.archived_at is null
ORDER BY n.id desc;
