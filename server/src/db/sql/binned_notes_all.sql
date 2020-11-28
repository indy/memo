SELECT n.id,
       n.title,
       n.content,
       n.triaged_at,
       n.category_id
FROM   notes n
WHERE  n.user_id = $1 and n.deleted_at is not null
ORDER BY n.deleted_at desc;
