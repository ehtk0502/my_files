#include "SortedList.h"
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <getopt.h>
#include <time.h>
#include <pthread.h>


int threadNum = 1;
int m_element = 1;
static int lock = 0;
int i;
char possKeys[53]= "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
int opt_yield = 0;
SortedList_t* mLists = NULL;
SortedListElement_t* elements = NULL;

char* yield_opt = NULL;
pthread_mutex_t mutex;

enum sync_type {NO_LOCK, MUTEX, SPIN_LOCK};
enum sync_type optionSync = NO_LOCK;


void* opHandler(void* argument){
  int Numthread = *((int*) argument);
  int i;
  for (i = Numthread; i < m_element; i=i + threadNum){
    switch(optionSync){
    case MUTEX:
      pthread_mutex_lock(&mutex);
      SortedList_insert(mLists, &elements[i]);
      pthread_mutex_unlock(&mutex);
      break;
    case NO_LOCK:
      SortedList_insert(mLists, &elements[i]);
      break;
    case SPIN_LOCK:
      while(__sync_lock_test_and_set(&lock, 1) == 1);
      SortedList_insert(mLists, &elements[i]);
      __sync_lock_release(&lock);
      break;
    }
  }

  switch(optionSync){
  case MUTEX:
    pthread_mutex_lock(&mutex);
    if(SortedList_length(mLists) < 0){
      fprintf(stderr, "length error\n");
      exit(2);
    }
    pthread_mutex_unlock(&mutex);
    break;
  case NO_LOCK:
    if(SortedList_length(mLists) < 0){
      fprintf(stderr, "length error\n");
      exit(2);
    }
    break;
  case SPIN_LOCK:
    while(__sync_lock_test_and_set(&lock, 1) == 1);
    if(SortedList_length(mLists) < 0){
      fprintf(stderr, "length error\n");
      exit(2);
    }
    __sync_lock_release(&lock);
    break;
  }

  SortedListElement_t* returnedData;
  int result;
  for (i = Numthread; i < m_element; i = i + threadNum){
    switch(optionSync){
    case NO_LOCK:
      returnedData = SortedList_lookup(mLists, elements[i].key);
      if (returnedData == NULL){
	fprintf(stderr, "lookup error\n");
	exit(2);
      }
      result = SortedList_delete(returnedData);
      if (result == 1){
	fprintf(stderr, "delete error\n");
	exit(2);
      }
      break;
    case MUTEX:
      pthread_mutex_lock(&mutex);
      returnedData = SortedList_lookup(mLists, elements[i].key);
      if (returnedData == NULL){
	fprintf(stderr, "lookup error\n");
	exit(2);
      }
      result = SortedList_delete(returnedData);
      if (result == 1){
	fprintf(stderr, "delete error\n");
	exit(2);
      }
      pthread_mutex_unlock(&mutex);
      break;
    case SPIN_LOCK:
      while(__sync_lock_test_and_set(&lock, 1) == 1);
      returnedData = SortedList_lookup(mLists, elements[i].key);
      if (returnedData == NULL){
	fprintf(stderr, "lookup error\n");
	exit(2);
      }
      result = SortedList_delete(returnedData);
      if (result == 1){
	fprintf(stderr, "delete error\n");
	exit(2);
      }
      __sync_lock_release(&lock);
      break;
    }
  }
  return NULL;
}

void freeMem(){
  if(optionSync == MUTEX){
    pthread_mutex_destroy(&mutex);
  }
  if(mLists){
    free(mLists);
  }
  if(elements){
    free(elements);
  }
}

char* random_key() {
  srand((unsigned int)time(NULL));
  char* my_key = malloc((5 + 1) * (sizeof(char)));
  int i;
  for (i = 0; i < 5; i++) {
    my_key[i] = possKeys[rand() % 52];
  }
  my_key[5] = '\0';
  return my_key;
}

int main(int argc, char ** argv)
{
  char* outPut = "list-";
  char strName[15];
  strcpy(strName, outPut);

  struct option options[] ={
    {"yield", 1, NULL, 'y'},
    {"iterations", 1, NULL, 'i'},
    {"threads", 1, NULL, 't'},
    {"sync", 1, NULL, 's'},
    {0,0,0,0}
  };
  int iterateNum;
  int optLong;
  int yield;
  while ((optLong = getopt_long(argc, argv, "", options, NULL)) != -1){
    switch(optLong){
    case 'i':
      iterateNum = (int)atoi(optarg);
      break;
    case 't':
      threadNum = (int)atoi(optarg);
      break;
    case 's':
      switch(*optarg){
      case'm':
	optionSync = MUTEX;
	pthread_mutex_init(&mutex, NULL);
	break;
      case 's':
	optionSync = SPIN_LOCK;
	break;
      default:
	fprintf(stderr, "wrong argument\n");
	exit(1);
      }
      break;
    case 'y':
      yield = strlen(optarg);
      if(yield >3){
	fprintf(stderr, "Bad arguments\n");
	exit(1);
      }
      for (i = 0; i < yield; i++){
	switch(optarg[i]){
	case 'i':
	  opt_yield = opt_yield | INSERT_YIELD;
	  strcat(strName, "i");
	  break;
	case 'd':
	  opt_yield = opt_yield | DELETE_YIELD;
	  strcat(strName, "d");
	  break;
	case 'l':
	  opt_yield = opt_yield | LOOKUP_YIELD;
	  strcat(strName, "l");
	  break;
	default:
	  fprintf(stderr, "wrong yield output\n");
	  exit(1);
	}
      }
      break;
    default:
      fprintf(stderr, "usage:lab2_list [--yield=[idl]][--iterations=#][--threads=#][--sync=ms]\n");
      exit(1);
    }
  }
  if(opt_yield ==0){
    strcat(strName, "none");
  }

  if (optionSync == MUTEX){
    strcat(strName, "-m");
  }
  else if(optionSync == SPIN_LOCK){
    strcat(strName, "-s");
  }
  else{
    strcat(strName, "-none");
  }

  m_element = threadNum*iterateNum;

  mLists = malloc(sizeof(SortedList_t));
  mLists->key = NULL;
  mLists->next = mLists;
  mLists->prev = mLists;
  elements = malloc(m_element * sizeof(SortedListElement_t));

  for (i = 0; i < m_element; ++i){
    elements[i].key = random_key();
  }

  pthread_t threads[threadNum];
  int Numthread[threadNum];

  struct timespec begin, done;
  if (clock_gettime(CLOCK_MONOTONIC, &begin) <0) {
    fprintf(stderr, "clock error\n");
    freeMem();
    exit(1);
  }

  int threadCreate;
  for (i = 0; i < threadNum; ++i){
    Numthread[i]= i;
    threadCreate = pthread_create(&threads[i], NULL, opHandler, &Numthread[i]);
    if (threadCreate < 0){
      fprintf(stderr, "thread create error\n");
      freeMem();
      exit(2);
    }
  }

  for (i = 0; i < threadNum; ++i){
    threadCreate = pthread_join(threads[i], NULL);
    if (threadCreate < 0){
      fprintf(stderr, "error join\n");
      freeMem();
      exit(2);
    }
  }

  if (clock_gettime(CLOCK_MONOTONIC, &done) < 0){
    fprintf(stderr, "clock error\n");
    freeMem();
    exit(1);
  }

  if (SortedList_length(mLists) != 0){
    fprintf(stderr, "wrong length\n");
    freeMem();
    exit(2);
  }

  long long timeSpent = (done.tv_sec - begin.tv_sec)* 1000000000;
  timeSpent += done.tv_nsec- begin.tv_nsec;
  int totalOp = 3*threadNum*iterateNum;
  long long avgTime = timeSpent/totalOp;

  fprintf(stdout, "%s,%d,%d,%d,%d,%lld,%lld\n", strName, threadNum, iterateNum, 1, totalOp, timeSpent, avgTime);
  freeMem();

  return 0;
}
