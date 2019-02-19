#include "SortedList.h"
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <getopt.h>
#include <time.h>
#include <pthread.h>


int threadNum = 1;
int m_element = 1;
int listNum = 1;
pthread_mutex_t* lock;
volatile int* spinLock;
int i;
long long lockTime =0;

int opt_yield = 0;
SortedList_t** mLists = NULL;
SortedListElement_t* elements = NULL;

char* yield_opt = NULL;

enum sync_type {NO_LOCK, MUTEX, SPIN_LOCK};
enum sync_type optionSync = NO_LOCK;

void muxLockInitial(){
  lock = (pthread_mutex_t*)malloc(sizeof(pthread_mutex_t)*listNum);
  for(i = 0; i < listNum; i++){
    pthread_mutex_init(&lock[i],NULL);
  }
}

void spinLockInitial(){
  spinLock = (int*)malloc(sizeof(int)*listNum);
  for(i = 0; i < listNum; i++){
    spinLock[i] = 0;
  }
}

int hashGenerate(int index){
  int value;
  value = abs((int) *elements[index].key) % listNum;
  return value;
}

void* opHandler(void* argument){
  int Numthread = *((int*) argument);
  int i;
  struct timespec sub_begin, sub_done;
  
  for (i = Numthread; i < m_element; i=i + threadNum){
    int hashNum = hashGenerate(i);
    switch(optionSync){
    case MUTEX:
      clock_gettime(CLOCK_MONOTONIC, &sub_begin);
      pthread_mutex_lock(&lock[hashNum]);
      clock_gettime(CLOCK_MONOTONIC, &sub_done);
      lockTime += (1000000000 * (sub_done.tv_sec - sub_begin.tv_sec)) + (sub_done.tv_nsec - sub_begin.tv_nsec);
      SortedList_insert(mLists[hashNum], &elements[i]);
      pthread_mutex_unlock(&lock[hashNum]);
      break;
    case NO_LOCK:
      SortedList_insert(mLists[hashNum], &elements[i]);
      break;
    case SPIN_LOCK:
      while(__sync_lock_test_and_set(&spinLock[hashNum], 1) == 1);
      SortedList_insert(mLists[hashNum], &elements[i]);
      __sync_lock_release(&spinLock[hashNum]);
      break;
    }
  }
  int listLength = 0;
  switch(optionSync){
  case NO_LOCK:
    for(i = 0; i < listNum; i++){
      listLength += SortedList_length(mLists[i]);
    }
    break;
  case MUTEX:
    for(i = 0; i < listNum; i++){
      clock_gettime(CLOCK_MONOTONIC, &sub_begin);
      pthread_mutex_lock(&lock[i]);
      clock_gettime(CLOCK_MONOTONIC, &sub_done);
      lockTime += (1000000000 * (sub_done.tv_sec - sub_begin.tv_sec)) + (sub_done.tv_nsec - sub_begin.tv_nsec);
      listLength += listLength+ SortedList_length(mLists[i]);
      pthread_mutex_unlock(&lock[i]);
    }
    break;
  case SPIN_LOCK:
    for(i = 0; i < listNum; i++){
      while(__sync_lock_test_and_set(&spinLock[i], 1) == 1);
      listLength += listLength+ SortedList_length(mLists[i]);
      __sync_lock_release(&spinLock[i]);
    }
    break;
  }
  
  if(listLength < 0){
    fprintf(stderr, "wrong number of elements\n");
    exit(2);
  }
  
  SortedListElement_t* returnedData;
  int result;
  for (i = Numthread; i < m_element; i = i + threadNum){
    int hashNum = hashGenerate(i);
    switch(optionSync){
    case NO_LOCK:
      returnedData = SortedList_lookup(mLists[hashNum], elements[i].key);
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
      clock_gettime(CLOCK_MONOTONIC, &sub_begin);
      pthread_mutex_lock(&lock[hashNum]);
      clock_gettime(CLOCK_MONOTONIC, &sub_done);
      lockTime += (1000000000 * (sub_done.tv_sec - sub_begin.tv_sec)) + (sub_done.tv_nsec - sub_begin.tv_nsec);
      returnedData = SortedList_lookup(mLists[hashNum], elements[i].key);
      if (returnedData == NULL){
	fprintf(stderr, "lookup error\n");
	exit(2);
      }
      result = SortedList_delete(returnedData);
      if (result == 1){
	fprintf(stderr, "delete error\n");
	exit(2);
      }
      pthread_mutex_unlock(&lock[hashNum]);
      break;
    case SPIN_LOCK:
      while(__sync_lock_test_and_set(&spinLock[hashNum], 1) == 1);
      returnedData = SortedList_lookup(mLists[hashNum], elements[i].key);
      if (returnedData == NULL){
	fprintf(stderr, "lookup error\n");
	exit(2);
      }
      result = SortedList_delete(returnedData);
      if (result == 1){
	fprintf(stderr, "delete error\n");
	exit(2);
      }
      __sync_lock_release(&spinLock[hashNum]);
      break;
    }
  }
  return NULL;
}

void freeMem(){
  if(optionSync ==MUTEX){
    free(lock);
  }
  for(i = 0; i < listNum; i++){
    free(mLists[i]);
  }
  free(mLists);
  free(elements);
 
}

int main(int argc, char ** argv)
{
  int iterateNum;
  int optLong;
  int yield;
  char* outPut = "list-";
  char strName[15];
  strcpy(strName, outPut);
  
  struct option options[] ={
    {"yield", 1, NULL, 'y'},
    {"iterations", 1, NULL, 'i'},
    {"lists", 1,NULL, 'l'},
    {"threads", 1, NULL, 't'},
    {"sync", 1, NULL, 's'},
    {0,0,0,0}
  };
  
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
	break;
      case 's':
	optionSync = SPIN_LOCK;
	break;
      default:
	fprintf(stderr, "wrong argument\n");
	exit(1);
      }
      break;
    case 'l':
      listNum =(int)atoi(optarg);
      break;
    case 'y':
      yield = strlen(optarg);
      if(yield >3){
	fprintf(stderr, "Bad arguments\n");
	exit(1);
      }
      for (i = 0; i < yield; i++) {
	switch (optarg[i]) {
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
    muxLockInitial();
    strcat(strName, "-m");
  }
  else if(optionSync == SPIN_LOCK){
    spinLockInitial();
    strcat(strName, "-s");
  }
  else{
    strcat(strName, "-none");
  }

  m_element = threadNum*iterateNum;

  mLists = (SortedList_t**) malloc(listNum * sizeof(SortedList_t*));
  for(i =0; i < listNum; i++){
    mLists[i] = (SortedList_t*) malloc(sizeof(SortedList_t));
    mLists[i]->key = NULL;
    mLists[i]->next = mLists[i];
    mLists[i]->prev = mLists[i];
  }
  
  elements = (SortedListElement_t*)malloc(m_element * sizeof(SortedListElement_t));
  int j;
  srand(time(NULL));
  for (i = 0; i < m_element; ++i){
    int randLen = rand()%10 + 1;
    char* key = malloc(sizeof(char)*(randLen + 1));
    for(j = 0; j < randLen; j++)
      key[j] = (char)(rand()%95 + ' ');
    key[randLen] = '\0';
    elements[i].key = key;
  }

  pthread_t threads[threadNum];
  int Numthread[threadNum];

  struct timespec begin, done;
  if (clock_gettime(CLOCK_MONOTONIC, &begin) <0) {
    fprintf(stderr, "clock error\n");
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
  
  int listLength = 0;
  for(i = 0; i < listNum; i++){
    listLength += SortedList_length(mLists[i]);
  }
  if(listLength != 0){
    fprintf(stderr, "final length check fail");
    exit(2);
    freeMem();
  }
  
  long long muxLockCount = 0;
  if(optionSync == MUTEX){
    muxLockCount = lockTime / ( threadNum * iterateNum * 2);
  }
  

  long long timeSpent = (done.tv_sec - begin.tv_sec)* 1000000000;
  timeSpent += (done.tv_nsec - begin.tv_nsec);
  int totalOp = 3*threadNum*iterateNum;
  long long avgTime = timeSpent/totalOp;

  fprintf(stdout, "%s,%d,%d,%d,%d,%lld,%lld,%lld\n", strName, threadNum, iterateNum, listNum, totalOp, timeSpent, avgTime, muxLockCount);
  
  freeMem();
  return 0;
}
