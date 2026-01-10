#!/bin/bash
rm -rf .next/dev/lock 2>/dev/null
exec npm run dev
