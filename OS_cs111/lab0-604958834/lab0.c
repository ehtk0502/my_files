//NAME: Hun Lee
//ID:604958834
//EMAIL: ehtk0502@gmail.com

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <fcntl.h>
#include <unistd.h>
#include <getopt.h>
#include <errno.h>
#include <signal.h>



void segmentFault(){
  char *segptr = NULL;
  *segptr = 'a';
}

void sighandler(int sigNum){
  if(sigNum == SIGSEGV){
    fprintf(stderr, "Seg fault caught: error = %d, message =  %s \n", errno, strerror(errno));
    exit(4);
  }
}

int errno;

int main(int argc,char **argv){
  static struct option long_options[] = {
    {"input", 1, NULL, 'i'},
    {"output", 1, NULL, 'o'},
    {"segfault", 0, NULL, 's'},
    {"catch", 0, NULL, 'c'},
    {0, 0, 0, 0}
  };
  
  int optLong;
  int inputFd, outputFd;
  char* inputFile = NULL;
  char* outputFile = NULL;
  int seg = 0;
  int catch = 0;
  while( (optLong = getopt_long(argc, argv, "i:o:sc", long_options, NULL)) != -1) {
    switch (optLong) {
    case 'i':
      inputFile = optarg;
      break;
    case 'o':
      outputFile = optarg;
      break;
    case 's':
      seg = 1;
      break;
    case 'c':
      catch = 1;
      break;
    default:
      printf("usage is --input=File1 --output=File2 [sc] \n");
      exit(1);
    }
  }
  
  if(inputFile){
    inputFd = open(inputFile, O_RDONLY);
    if(inputFd >= 0){
      close(0);
      dup(inputFd);
      close(inputFd);
    }
    else{
      fprintf(stderr, "--input file %s error reason: %s \n", inputFile, strerror(errno));
      exit(2);
    }
    
  }
  
  if(outputFile){
    outputFd = creat(outputFile, 0666);
    if(outputFd >= 0){
      close(1);
      dup(outputFd);
      close(outputFd);
    }
    else{
      fprintf(stderr, "--output file %s error reason: %s \n",outputFile, strerror(errno));
      exit(3);
    }
    
  }
  if(catch){
    signal(SIGSEGV, sighandler);
  }
  
  if(seg){
    segmentFault();
  }
  
  char buf[1];
  ssize_t r;
  r = read(0, buf, 1);
  while(r > 0){
    write(1, buf, 1);
    r = read(0, buf, 1);
  }
  
  return 0;
}
