#include <stdio.h>
#include <stdlib.h>
#include <string.h> 

int main(int argcnt, char* argv[]) {
	
	if (argcnt != 3) {
		fprintf(stderr, "number of arguments not 2");
		exit(1);
	}
	
	char* from = argv[1];
	char* to = argv[2];

	int fromlen = strlen(from);
	int tolen = strlen(to);

	if (fromlen == 0 || tolen == 0) {
		fprintf(stderr, "empty argument");
		exit(1);
	}

	if (fromlen != tolen) {
		fprintf(stderr, "argument size doesn't match");
		exit(1);
	}

	int i = 0;
	int j;
	
	for (i = 0; i < (fromlen-1); i++) {
		for (j = i + 1; j < fromlen; j++) {
			if (from[i] == from[j]) {
				fprintf(stderr, "duplicate bytes");
				exit(1);
			}
		}
	}
	
	
	char ch = getchar();
	while (ch != EOF) {

		int found = 0;

		for (i = 0; i < fromlen; i++) {
			if (ch == from[i]) {
				putchar(to[i]);
				found = 1;
				break;
			}
		}

		if (found == 0) {
			putchar(ch);
		}

		ch = getchar();
	}

	return 0;
}