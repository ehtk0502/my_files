#NAME:Hun Lee
#EMAIL:ehtk0502@gmail.com
#ID:604958834

.SILENT:

default:
	gcc -Wall -Wextra -o lab1b-client -g lab1b-client.c -lz
	gcc -Wall -Wextra -o lab1b-server -g lab1b-server.c -lz
dist: default
	tar -czf lab1b-604958834.tar.gz lab1b-client.c lab1b-server.c README Makefile
clean:
	rm -rf lab1b-604958834.tar.gz lab1b-client lab1b-server
