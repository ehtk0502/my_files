#Name:Hun Lee
#ID:604958834
#email:ehtk0502@gmail.com

.SILENT:

default:
	gcc -Wall -Wextra -o lab0 -g lab0.c
dist: default
	tar -czf lab0-604958834.tar.gz lab0.c README Makefile backtrace.png breakpoint.png
clean:
	rm -rf lab0*.txt*tar.gz
check: default in_out_test wrong_arg_test signal_handle_test open_missingFile_test write_test

in_out_test: 
	echo "abcde" > inTest.txt; \
	chmod +777 inTest.txt; \
	./lab0 --input=inTest.txt --output=outTest.txt &> /dev/null; \
	if [[ $$? -ne 0 ]]; then \
	echo "test failed input does not match output"; \
	else \
	echo "test successful input matches output"; \
	fi;\
	rm -f inTest.txt outTest.txt
wrong_arg_test:
	echo | ./lab0 --wrong &> /dev/null; \
	if [[ $$? -ne 1 ]]; then \
	echo "wrong argument test fail"; \
	else \
	echo "wrong argument test good"; \
	fi
signal_handle_test:
	echo | ./lab0 --segfault --catch &> /dev/null; \
	if [[ $$? -ne 4 ]]; then \
	echo "seg fault test failed"; \
	else \
	echo "seg fault test successful";\
	fi
open_missingFile_test:
	echo | ./lab0 --input=missing.txt &> /dev/null; \
	if [[ $$? -ne 2 ]]; then \
	echo "misssing file test fail"; \
	else \
	echo "missing file test successful"; \
	fi
write_test:
	echo "asdfg" > test.txt; \
	echo "asdfg" > intest.txt; \
	chmod +777 intest.txt; \
	chmod -w test.txt;\
	./lab0 --input=intest.txt --output=test.txt &> /dev/null; \
	if [[ $$? -ne 3 ]]; then \
	echo "write test failed"; \
	else \
	echo "write test successful"; \
	fi
	rm -f test.txt intest.txt
