NAME: Hun Lee
EMAIL: ehtk0502@gmail.com
ID: 604958834


FILES = lab2_add.c lab2_list.c Makefile README SortedList.h SortedList.c *.csv *.png test.sh *.gp


default:
	@gcc -pthread -Wall -Wextra -g lab2_add.c -o lab2_add
	@gcc -pthread -Wall -Wextra -g lab2_list.c SortedList.c -o lab2_list

build:default

tests:build
	@chmod +x test.sh
	@-./test.sh

graphs:tests
	@gnuplot lab2_add.gp
	@gnuplot lab2_list.gp

clean:
	@rm -f  lab2_*.csv lab2_*.png lab2*.tar.gz

dist:build graphs
	@tar -czf lab2a-604958834.tar.gz $(FILES)
