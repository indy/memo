SELECT n.id,
       n.title,
       n.content,
       n.triaged_at
FROM   notes n
WHERE  n.user_id = $1 and n.triaged_at is not null
ORDER BY n.id desc;