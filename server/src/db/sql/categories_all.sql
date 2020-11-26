SELECT c.id,
       c.title
FROM   categories c
WHERE  c.user_id = $1
ORDER BY n.title desc;
