SELECT n.id,
       n.title,
       n.content
FROM   notes n
WHERE  n.user_id = $1
ORDER BY n.id desc;
