#include <stdlib.h>
#include <stdio.h>
#include <getopt.h>
#include <string.h>
#include <sched.h>
#include <pthread.h>
#include <time.h>


pthread_mutex_t mymutex = PTHREAD_MUTEX_INITIALIZER;
int lock = 0;
int nthread = 1;
int iterateNum = 1;

struct m_threadArg{
  long long *counter;
  int iterateNum;
  char syncOption;
};

int opt_yield;
void add(long long *pointer, long long value) {
  long long sum = *pointer + value;
  if (opt_yield){
    sched_yield();
  }
  *pointer = sum;
}

void cAdd(long long *pointer, long long value)
{
  int update, changed;
    do
      {
	changed = *pointer;
	if (opt_yield){
	  sched_yield();
	}
	update = changed + value;
      }while(__sync_val_compare_and_swap(pointer, changed, update) != changed);
}


void mAdd(long long *pointer, long long value)
{
  pthread_mutex_lock(&mymutex);
  long long sum = *pointer + value;
  if (opt_yield){
    sched_yield();
  }
  *pointer = sum;
  pthread_mutex_unlock(&mymutex);
}


void sAdd(long long *pointer, long long value){
  while (__sync_lock_test_and_set(&lock, 1));
  long long sum = *pointer + value;
  if (opt_yield){
    sched_yield();
  }
  *pointer = sum;
  __sync_lock_release(&lock);
}

void* opHandler(void *arguments){
  struct m_threadArg *m_data = (struct m_threadArg*) arguments;
  long long *counter = m_data->counter;
  int iterateNum = m_data->iterateNum;
  char syncOption = m_data->syncOption;
  int i,j;
  for (i=0; i< iterateNum; i++){
    if((syncOption) == 'm'){
      mAdd(counter, 1);
    }
    else if(syncOption == 's'){
      sAdd(counter, 1);
    }
    else if(syncOption == 'c'){
      cAdd(counter, 1);
    }
    else if(syncOption == ' '){
      add(counter, 1);
    }
  }
  for (j=0; j < iterateNum; j++){
    if((m_data->syncOption) == 'm'){
      mAdd(counter, -1);
    }
    else if((m_data->syncOption) == 's'){
      sAdd(counter, -1);
    }
    else if((m_data->syncOption) == 'c'){
      cAdd(counter, -1);
    }
    else if((m_data->syncOption) == ' '){
      add(counter, -1);
    }
  }
  pthread_exit(0);
}


int main(int argc, char **argv)
{
  long long counter = 0;
  char syncOption = ' ';
  int longOpt;
  int iterateNum;
  int i;

  static struct option long_options[] = {
    {"threads", 1, NULL, 't'},
    {"iterations", 1, NULL, 'i'},
    {"yield", 0, NULL, 'y'},
    {"sync", 1, NULL, 's'},
    {0,0,0,0}
  };
  while(1){
    longOpt = getopt_long(argc, argv, "", long_options, NULL);
    if(longOpt == -1){
      break;
    }
    switch(longOpt){
    case 't':
      nthread = atoi(optarg);
      if(nthread < 1){
	fprintf(stderr, "invalid thread number\n");
	exit(1);
      }
      break;
    case 'i':
      iterateNum = atoi(optarg);
      if(iterateNum < 1){
	fprintf(stderr, "invalid iteration\n");
	exit(1);
      }
      break;
    case 'y':
      opt_yield = 1;
      break;
    case 's':
      syncOption = (char)* optarg;
      if((syncOption != 'm') && (syncOption != 's') && (syncOption != 'c')){
	fprintf(stderr, "sync option invalid\n");
	exit(1);
      }
      break;
    default:
      fprintf(stderr, "wrong argument\n");
      exit(1);
    }
  }



  struct m_threadArg arguments;
  arguments.iterateNum = iterateNum;
  arguments.syncOption = syncOption;
  arguments.counter = &counter;


  struct timespec begin, done;

  if(clock_gettime(CLOCK_MONOTONIC, &begin) == -1){
    fprintf(stderr, "clock error\n");
    exit(1);
  }
  int threadCreate;
  pthread_t thread[nthread];
  for(i=0; i < nthread; i++){
    threadCreate = pthread_create(&thread[i], NULL, opHandler, (void*) &arguments);
    if(threadCreate){
      fprintf(stderr, "thread create error\n");
      exit(1);
    }
  }

  for(i=0; i<nthread; i++){
    pthread_join(thread[i], NULL);
  }

  if(clock_gettime(CLOCK_MONOTONIC, &done) == -1){
    fprintf(stderr, "clock error\n");
    exit(1);
  }

  switch(syncOption){
  case 's':
    if(opt_yield){
      fprintf(stdout, "add-yield-s,");
    }
    else{
      fprintf(stdout,"add-s,");
    }
    break;
  case 'm':
    if(opt_yield){
      fprintf(stdout, "add-yield-m,");
    }
    else{
      fprintf(stdout, "add-m,");
    }
    break;
  case 'c':
    if(opt_yield){
      fprintf(stdout,"add-yield-c,");
    }
    else{
      fprintf(stdout, "add-c,");
    }
    break;

  default:
    if(opt_yield){
      fprintf(stdout,"add-yield-none,");
    }
    else{
      fprintf(stdout,"add-none,");
    }
  }

  long long totalOpNum = 2*nthread*iterateNum;
  long long runtime = 1000000000L * (done.tv_sec - begin.tv_sec) + (done.tv_nsec - begin.tv_nsec);
  long long aveTime = runtime / totalOpNum;

  printf("%d,%d,%lld,%lld,%lld,%lld\n", nthread, iterateNum, totalOpNum, runtime, aveTime, counter);

  if(counter != 0){
    exit(2);
  }

  return 0;
}
