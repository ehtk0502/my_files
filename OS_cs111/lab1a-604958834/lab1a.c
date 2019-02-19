#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <fcntl.h>
#include <unistd.h>
#include <getopt.h>
#include <termios.h>
#include <errno.h>
#include <poll.h>
#include <signal.h>
#include <sys/types.h>
#include <sys/wait.h>

int errno;
char crlf[2] = {0x0D,0x0A};
char lf[1] = {0x0A};
int sh;
struct termios save_att;
int terFd;

void restore_att(){
  if(tcsetattr(terFd, TCSANOW, &save_att)<0){
    fprintf(stderr,"saving terminal attribute failure %s \n", strerror(errno));
    exit(1);
  }
}

void exeShell(){
  int toParent[2];
  int toChild[2];
  
  if(pipe(toParent) == -1){
    fprintf(stderr,"parent pipe error %s \n", strerror(errno));
    restore_att();
    exit(1);
  }
  if(pipe(toChild) == -1){
    fprintf(stderr,"child pipe error %s \n", strerror(errno));
    restore_att();
    exit(1);
  }
  
  pid_t cpid = fork();
  struct pollfd fds[2];
  
  if(cpid == -1){
    fprintf(stderr,"fork error %s \n", strerror(errno));
    restore_att();
    exit(1);
  }
  if(cpid == 0){//child process
    close(toChild[1]);
    close(toParent[0]);
    dup2(toChild[0], STDIN_FILENO);
    dup2(toParent[1], STDOUT_FILENO);
    close(toChild[0]);
    close(toParent[1]);
    
    int exec;
    char *const exeArg[2] = {"/bin/bash", NULL};
    exec = execvp("/bin/bash", exeArg);
    if(exec == -1){
      fprintf(stderr, "child exec function failed, reason: %s \n", strerror(errno));
      restore_att();
      exit(1);
    }
  }
  else{ //parent
    close(toParent[1]);
    close(toChild[0]);
    
    fds[0].fd = STDIN_FILENO;
    fds[1].fd = toParent[0];
    fds[0].events = POLLIN;
    fds[1].events = POLLIN;
    
    char buf[256];
    ssize_t ch;
    char c;
    int i;
    int polled;
    int status = 0;
    
    while(1){
      polled = poll(fds, 2, 0);
      if(polled == -1){
	fprintf(stderr, "poll error: %s \n", strerror(errno));
	restore_att();
	exit(1);
      }
      if(fds[0].revents & POLLIN){
	ch = read(STDIN_FILENO, buf, 256);
	if(ch < 0){
	  fprintf(stderr, "read from terminal fail %s \n", strerror(errno));
	  restore_att();
	  exit(1);
	}
	for(i = 0; i < ch; i++){
	  c = buf[i];
	  if(c == 0x04){
	    close(toChild[1]);
	  }
	  else if(c == 0x03){
	    kill(cpid, SIGINT);
	  }
	  else if(c == 0x0D || c ==0x0A){
	    write(STDIN_FILENO, crlf, 2);
	    write(toChild[1], lf, 1);
	  }
	  else{
	    write(STDIN_FILENO, &c, 1);
	    write(toChild[1], &c, 1);
	  }
	}
      }
      
      if(fds[0].revents & (POLLHUP+POLLERR)){
	waitpid(0, &status, 0);
	fprintf(stderr, "SHELL EXIT SIGNAL=%d STATUS=%d\n", WTERMSIG(status), WEXITSTATUS(status));
	return;
      }
      
      if(fds[1].revents & POLLIN){
	char bufs[256];
	ssize_t chs;
	char cs;
	int j;
	chs = read(toParent[0], bufs, 256);
	
	for(j = 0; j < chs; j++ ){
	  cs = bufs[j];
	  if (cs == 0x0A){
	    write(STDOUT_FILENO, crlf, 2);
	  }
	  else{
	    write(STDOUT_FILENO, &cs, 1);
	  }
	}
      }
      
      if(fds[1].revents & (POLLHUP+POLLERR)){
	waitpid(0, &status, 0);
	fprintf(stderr, "SHELL EXIT SIGNAL=%d STATUS=%d\n", WTERMSIG(status), WEXITSTATUS(status));
	return;
      }
    }
    
  }
  
}

void exeNoArg(){

  char buf[100];
  ssize_t ch =0;
  int i;
  
  while (1) {
    ch = read(0, buf, 100);
    for (i = 0; i < ch; i++) {
      char c = buf[i];
            
      if (c == 0x04) {
	return;
      }
      else if (c == 0x0D || c == 0x0A) {
	write(1, crlf, 2);
      }
      else {
	write(1, &c, 1);
      }
    }
  }
  
  
  /*
    while(1){
    ch = read(0, buf, 100);
    for(i = 0; i < ch; i++);{
    char c = buf[i];
    if(c == 0x0D || c == 0x0A){
    write(1, crlf, 2);
    }
    else if(c == 0x04){ //^D
    return;
    }
    else{
    write(1, &c, 1);
    }
    }
    }
  */
}




int main(int argc, char** argv){
  int sh =0;
  int optLong;
  
  if(argc == 1){
  }
  else if(argc == 2){
    static struct option long_options[] = {
      {"shell", 0, NULL, 's'},
      {0, 0, 0, 0}
    };
    while( (optLong = getopt_long(argc, argv, "s:", long_options, NULL)) != -1) {
      switch (optLong) {
      case 's':
	sh = 1;
	break;
	
      default:
	fprintf(stderr, "usage ./lab1 or ./lab1 --shell\n");
	exit(1);
      }
    }
  }
  else{
    fprintf(stderr, "usage ./lab1 or ./lab1 --shell \n");
    exit(1);
  }
  
  terFd = STDIN_FILENO;
  
  if(!isatty(terFd)){
    fprintf(stderr, "input is not terminal %s \n", strerror(errno));
    exit(1);
  }
  
  if(tcgetattr(terFd, &save_att)<0){
    fprintf(stderr,"saving terminal attribute failure %s \n", strerror(errno));
    exit(1);
  }
  
  struct termios change_att;
  
  if(tcgetattr(terFd, &change_att)<0){
    fprintf(stderr,"saving terminal attribute failure %s \n", strerror(errno));
    exit(1);
  }
  else{
    change_att.c_iflag = ISTRIP;
    change_att.c_oflag = 0;
    change_att.c_lflag = 0;
    
    change_att.c_lflag &= ~(ICANON|ECHO);
    change_att.c_cc[VMIN] = 1;
    change_att.c_cc[VTIME] = 0;
  }
  
  if(tcsetattr(terFd, TCSANOW, &change_att)<0){
    fprintf(stderr,"saving terminal attribute failure %s \n", strerror(errno));
    exit(1);
  }
  
  
  if(sh){
    exeShell();
  }
  else{
    exeNoArg();
  }
  restore_att();
  
  return 0;
}
