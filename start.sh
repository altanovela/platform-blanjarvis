#!/bin/sh
# to detach session,
# please uncomment disown, and run the command directly in shell console
#
nohup node blanjarvis.js > apps.log 2>&1 & #disown

