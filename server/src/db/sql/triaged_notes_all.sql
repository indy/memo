SELECT n.id,
       n.title,
       n.content,
       n.triaged_at,
       n.category_id
FROM   notes n
WHERE  n.user_id = $1 and n.triaged_at is not null and n.deleted_at is null
ORDER BY n.id desc;
