#NAME: Hun Lee
#ID: 604958834
#EMAIL: ehtk0502@gmail.com

.SILENT:

default: build

build:
	gcc -Wall -Wextra -pthread -lmraa -g lab4b.c -o lab4b -lm

check: default
	@chmod +x test.sh
	@./test.sh

clean:
	rm -f *.tar.gz lab4b

dist:
	tar -czvf lab4b-604958834.tar.gz README Makefile test.sh lab4b.c
