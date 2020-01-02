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
#include <assert.h>
#include <zlib.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <netdb.h>


pid_t cpid;
int status;
char lf[1] = {0x0A};

int main(int argc, char** argv){
  int portNum;
  int clientFd;
  int optLong;
  int cmpr = 0;
  socklen_t mClient;
  
  if(argc < 2){
    fprintf(stderr, " need arguments, Usage: ./lab1b-client --port=# --log=logfile --compress\n");
    exit(1);
  }
  else if(argc < 4){
    static struct option long_options[] = {
      {"port", 1, NULL, 'p'},
      {"compress", 0, NULL, 'c'},
      {0, 0, 0, 0}
    };
    while( (optLong = getopt_long(argc, argv, "p:c:l", long_options, NULL)) != -1) {
      switch (optLong) {
      case 'p':
	portNum = atoi(optarg);
	break;
      case 'c':
	cmpr = 1;
	break;
      default:
	fprintf(stderr, "wrong agument, Usage: ./lab1b-client --port=# --log=logfile --compress\n");
	exit(1);
      }
    }
  }
  else{
    fprintf(stderr, "wrong number of argument, Usage: ./lab1b-client --port=# --log=logfile --compress\n");
    exit(1);
  }
  
  int sockCreate;
  struct sockaddr_in servAddr, m_client;
    
  
  sockCreate = socket(AF_INET, SOCK_STREAM, 0);
  if (sockCreate < 0) {
    fprintf(stderr, "socket creating error\n");
    exit(1);
  }
  
  memset((char *) &servAddr, 0, sizeof(servAddr));
  servAddr.sin_family = AF_INET;
  servAddr.sin_addr.s_addr = INADDR_ANY;
  servAddr.sin_port = htons(portNum);
  
  if(bind(sockCreate, (struct sockaddr *)&servAddr, sizeof(servAddr)) < 0){
    fprintf(stderr, "binding failed\n");
    exit(1);
  }
  if(listen(sockCreate,5) < 0){
    fprintf(stderr, "listening failed\n");
    exit(1);
  }
  mClient = sizeof(m_client);
  clientFd = accept(sockCreate, (struct sockaddr*) &m_client, &mClient);
  
  if(clientFd<0){
    fprintf(stderr, "connection failed\n");
    exit(1);
  }
  
  int toParent[2];
  int toChild[2];
  
  if(pipe(toParent) == -1){
    fprintf(stderr,"parent pipe error\n");
    exit(1);
  }
  if(pipe(toChild) == -1){
    fprintf(stderr,"child pipe error\n");
    exit(1);
  }
  
  cpid = fork();
  
  if(cpid == -1){
    fprintf(stderr,"fork error\n");
    exit(1);
  }
  int i;
  if(cpid == 0){//child process
    close(toChild[1]);
    close(toParent[0]);
    dup2(toChild[0], 0);
    dup2(toParent[1], 1);
    close(toChild[0]);
    close(toParent[1]);
    
    int exec;
    char *const exeArg[2] = {"/bin/bash", NULL};
    exec = execvp("/bin/bash", exeArg);
    
    if(exec == -1){
      fprintf(stderr, "child exec function failed\n");
      exit(1);
    }
    
  }
  else{
    close(toParent[1]);
    close(toChild[0]);
    
    unsigned char buf[256];
    unsigned char outbuf[256];
    char c;
    ssize_t ch;
    int byteNum;
    
    int polled;
    struct pollfd fds[2];
    
    z_stream stream_1, stream_2;
    
    while(1){
      fds[0].fd = clientFd; 
      fds[1].fd = toParent[0]; 
      fds[0].events = POLLIN;
      fds[1].events = POLLIN;

      polled = poll(fds, 2, 0);
      if(polled < 0){
	fprintf(stderr, "poll error\n");
	exit(1);
      }
      
      
      if(fds[0].revents & POLLIN){
	
	ch = read(clientFd, buf, 256);
	if(ch < 0){
	  fprintf(stderr, "reading error\n");
	  exit(1);
	}
	if(cmpr == 1){
	  stream_1.zalloc = Z_NULL;
	  stream_1.zfree = Z_NULL;
	  stream_1.opaque = Z_NULL;

	  if(inflateInit(&stream_1) != Z_OK){
	    inflateEnd(&stream_1);
	    fprintf(stderr, "inflateInit() failed!\n");
	    exit(1);
	  }
	  
	  stream_1.avail_in = ch;
	  stream_1.next_in = buf;
	  stream_1.avail_out = 256;
	  stream_1.next_out = outbuf;

	  do{
	    inflate(&stream_1, Z_SYNC_FLUSH);
	  } while(stream_1.avail_in > 0);
	  inflateEnd(&stream_1);
	  
	  byteNum = 256 - stream_1.avail_out;
	  for(i=0; i<byteNum; i++){
	    c = outbuf[i];
	    
	    if(c == 0x04){
	      close(toChild[1]);
	    }
	    else if(c == 0x03){
	      kill(cpid, SIGINT);
	    }
	    else if(c == 0x0D || c ==0x0A){
	      write(toChild[1], lf, 1);
	    }
	    else{
	      write(toChild[1], &c, 1);
	    }
	  }
	}
	else{
	  for(i=0; i<ch; i++){
	    c = buf[i];
	    if(c == 0x04){
	      close(toChild[1]);
	    }
	    else if(c == 0x03){
	      kill(cpid, SIGINT);
	    }
	    else if(c == 0x0D || c ==0x0A){
	      write(toChild[1], lf, 1);
	    }
	    else{
	      write(toChild[1], &c, 1);
	    }
	  }
	}
      }


      if(fds[0].revents & (POLLHUP | POLLERR)){
	waitpid(0, &status, 0);
	fprintf(stderr, "SHELL EXIT SIGNAL=%d STATUS=%d\n", WTERMSIG(status), WEXITSTATUS(status));
	break;
      }

      
      if(fds[1].revents & POLLIN){
	ch = read(toParent[0], buf, 256);
	if(ch < 0){
	  fprintf(stderr, "reading error\n");
	  exit(1);
	}

	if(cmpr == 1){
	  
	  stream_2.zalloc = Z_NULL;
	  stream_2.zfree = Z_NULL;
	  stream_2.opaque = Z_NULL;

	  if(deflateInit(&stream_2, Z_DEFAULT_COMPRESSION) != Z_OK){
	    deflateEnd(&stream_2);
	    fprintf(stderr, "deflateInit error\n");
	    
	    exit(1);
	  }
	  
	  stream_2.avail_in = ch;
	  stream_2.next_in = buf;
	  stream_2.avail_out = 256;
	  stream_2.next_out = outbuf;
	  
	  do{
	    deflate(&stream_2, Z_SYNC_FLUSH);
	  } while(stream_2.avail_in > 0);
	  deflateEnd(&stream_2);
	  
	  byteNum = 256 - stream_2.avail_out;
	  write(clientFd, &outbuf, byteNum);
	  
	}
	else{
	  for(i=0; i<ch; i++){
	    c = buf[i];
	    write(clientFd, &c, 1);
	  }
	}

	
	
      }

      if(fds[1].revents & (POLLHUP | POLLERR)){
	waitpid(0, &status, 0);
	fprintf(stderr, "SHELL EXIT SIGNAL=%d STATUS=%d\n", WTERMSIG(status), WEXITSTATUS(status));
	break;
      }
    }
  }
  
  return 0;
}
