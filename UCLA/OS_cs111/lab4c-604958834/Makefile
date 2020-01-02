#NAME: Byung Hun Lee
#EMAIL: ehtk0502@gmail.com
#ID: 604958834

.SILENT:

default:
	gcc -Wall -Wextra -lmraa -pthread -lm -g lab4c_tcp.c -o lab4c_tcp
	gcc -Wall -Wextra -lmraa -pthread -lm -lssl -lcrypto -g lab4c_tls.c -o lab4c_tls

clean:
	rm -f lab4c-604958834.tar.gz lab4c_tcp lab4c_tls

dist: default
	tar -czvf lab4c-604958834.tar.gz lab4c_tcp.c lab4c_tls.c Makefile README
