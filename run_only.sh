#!/bin/bash

if [ $# -lt 2 ]; then
	echo "./run_only.sh VERSAO PORTA_ACESSO"
	echo
	echo "Ex.: ./run_only.sh 1.0.0 8071"
	echo
	echo
	exit 1
fi


VERSAO=$1
PORTAO=$2

docker run --env-file ./env.list --name report-git-${VERSAO}-${PORTAO} -d -p ${PORTAO}:80 mathduque/report-git:${VERSAO}

docker logs -f report-git-${VERSAO}-${PORTAO}

