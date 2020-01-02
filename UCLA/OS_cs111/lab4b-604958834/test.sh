#!/bin/bash

./lab4b --phony > /dev/null

if [[ $? -eq 1 ]]; then
	echo "invalid input test successful"
else
	echo "invalid input test fail"
fi

./lab4b --period=3 --scale=F --log=logFile <<-EOF > /dev/null

SCALE=C
PERIOD=5
STOP
START
OFF
EOF

ret=$?
if [ $ret -ne 0 ];
then
	echo "input test fail"
else
	echo "input test successful"
fi

if [ ! -a logFile ];
then
	echo "file found"
	for c in SCALE=C PERIOD=5 STOP START OFF SHUTDOWN
	do
		grep $c logFile > /dev/null
		if [ $? -ne 0 ]
		then
			echo "log test failed"
		else
			echo "log test successful"
		fi
	done
else
	echo "file not found. failed"
fi
