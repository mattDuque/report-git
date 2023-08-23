
#!/bin/bash

VERSAO=$(jq -r '.version' package.json)

echo "Building mathduque/report-git:$VERSAO$3..."
docker build -t mathduque/report-git:$VERSAO$3 .
