#include <stdio.h>
#include <stdlib.h>

int frobcmp(const void* av, const void* bv) {
	const char* a = *(const char **)av;
	const char* b = *(const char **)bv;

	while (*a != ' ') {
		if (*b == ' ') {
			return 1;
		}
		else if ((*a ^ 42) > (*b ^ 42)) {
			return 1;
		}
		else if ((*a ^ 42) < (*b ^ 42)) {
			return -1;
		}
		a++;
		b++;
	}
	if (*b == ' ')
		return 0;
	return -1;
}



int main(void) {
	char readChar;
	char* charArr;
	char** ptrToArr;
	const int multiple = 5;
	int inc = 1;
	int arrayIndex = 0;
	int ptrArrInd = 0;
	int inc_ptr = 1;

	charArr = (char*)malloc(sizeof(char)*multiple);
	ptrToArr = (char**)malloc(sizeof(char*)*multiple);

	if (charArr == NULL) {
		fprintf(stderr, "malloc error");
		exit(1);
	}
	if (ptrToArr == NULL) {
		fprintf(stderr, "malloc error");
		exit(1);
	}

	while (!feof(stdin) && !ferror(stdin)) {
		readChar = getchar();
		if (readChar == EOF)
			break;
		if (ferror(stdin)) {
			fprintf(stderr, "error reading the input");
			exit(1);
		}

		if (arrayIndex == (inc*multiple - 1)) {
			inc++;
			charArr = realloc(charArr, sizeof(char)*multiple*inc);
			if (charArr == NULL) {
				fprintf(stderr, "realloc error");
				exit(1);
			}
		}

		charArr[arrayIndex] = readChar;
		arrayIndex++;

		if (readChar == ' ') {
			if (arrayIndex == 1) {
				fprintf(stderr, "single space is not a word");
				free(charArr);
				charArr = (char*)malloc(sizeof(char)*multiple);
				arrayIndex = 0;
				continue;
			}

			if (((ptrArrInd+1) % multiple) == 0) {
				inc_ptr++;
				ptrToArr = realloc(ptrToArr, sizeof(char*)*multiple*inc_ptr);
			}

			if (ptrToArr == NULL) {
				fprintf(stderr, "reallocation problem");
				exit(1);
			}
			ptrToArr[ptrArrInd] = charArr;
			ptrArrInd++;

			charArr = (char*)malloc(sizeof(char)*multiple);
			inc = 1;
			arrayIndex = 0;
		}
	}
	
	if (readChar != ' ') {
		if (arrayIndex == (inc*multiple - 1)) {
			inc++;
			charArr = realloc(charArr, sizeof(char)*multiple*inc);
			if (charArr == NULL) {
				fprintf(stderr, "realloc error");
				exit(1);
			}
		}

		charArr[arrayIndex] = ' ';

		if (((ptrArrInd + 1) % multiple) == 0) {
			inc_ptr++;
			ptrToArr = realloc(ptrToArr, sizeof(char*)*multiple*inc_ptr);
		}
		if (ptrToArr == NULL) {
			fprintf(stderr, "reallocation problem");
			exit(1);
		}

		ptrToArr[ptrArrInd] = charArr;
		ptrArrInd++;
	}


	qsort(ptrToArr, ptrArrInd, sizeof(char*), frobcmp);

	int i = 0;
	for (i = 0; i < ptrArrInd; i++) {
		int j = 0;
		for (; ptrToArr[i][j] != ' '; j++)
			putchar(ptrToArr[i][j]);
		putchar('\n');
	}

	i = 0;
	for (i = 0; i < ptrArrInd; i++)
		free(ptrToArr[i]);
	
	free(ptrToArr);

	return 0;
}
