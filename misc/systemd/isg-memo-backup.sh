#!/bin/sh

now=`date +"%Y%m%d"`

# Do not use `cp` to back up SQLite databases. It is not transactionally safe.
sqlite3 /home/indy/work/memo/memo.db '.backup /home/indy/bdrive/memo/memo.db'

tar -Jcf /home/indy/bdrive/memo/memo_${now}.tar.xz -C /home/indy/bdrive/memo memo.db
rm /home/indy/bdrive/memo/memo.db
