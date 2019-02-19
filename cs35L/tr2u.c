#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

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
	
	ssize_t result;
	char ch;

	while (1) {
		result = read(0, &ch, 1);

		if (result == 0) { // eof
			break;
		}
		if (result < 0) {
			fprintf(stderr, "error");
			exit(1);
		}

		int len;
		for (len = 0; len < fromlen; len++) {
			if (ch = from[len]) {
				ch = to[len];
			}
		}

		result = write(1, &ch, 1);
		if (result < 0) {
			fprintf(stderr, "error");
			exit(1);
		}
	}

	return 0;
}