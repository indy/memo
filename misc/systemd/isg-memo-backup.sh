#!/bin/sh

now=`date +"%Y%m%d"`
pg_dump memo > /home/indy/bdrive/memo/memo_${now}.psql
