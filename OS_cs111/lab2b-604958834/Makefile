#Name:Hun Lee
#ID:604958834
#email:ehtk0502@gmail.com

.SILENT:

default: build

build:
	gcc -Wall -Wextra -pthread -g -lprofiler lab2_list.c SortedList.c -o lab2_list

profile:build
	-rm -f ./raw.gperf
	CPUPROFILE=./raw.gperf ./lab2_list --threads=12 --iterations=1000 --sync=s
	/usr/local/cs/bin/pprof --text ./lab2_list ./raw.gperf > profile.out
	/usr/local/cs/bin/pprof --list=opHandler ./lab2_list ./raw.gperf >> profile.out
	rm -f ./raw.gperf
tests: build
	@chmod +x test.sh
	@./test.sh

graphs: tests
	@gnuplot lab2b_list.gp

clean:
	rm -f *.tar.gz lab2_list lab2_list*.csv

dist: graphs profile
	tar -czvf lab2b-604958834.tar.gz README Makefile SortedList.h SortedList.c lab2_list.c *.csv *.gp *.png profile.out test.sh
