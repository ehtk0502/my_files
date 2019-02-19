#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <fcntl.h>
#include <unistd.h>
#include <getopt.h>
#include <termios.h>
#include <poll.h>
#include <signal.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <assert.h>
#include <zlib.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <netdb.h>

struct termios save_att;
int cmpr =0;
char crlf[2] = {0x0D,0x0A};
int terFd;
int logFd;
int logFlag=0;


void restore_att(){
  if(tcsetattr(terFd, TCSANOW, &save_att)<0){
    fprintf(stderr,"saving terminal attr error\n");
    exit(1);
  }
}

void communicate(int openSock, int openFile){
  z_stream strm1, strm2;
  struct pollfd fds[2];
  int polled;
  int byteNum;
  int ch;
  char c;
  
  unsigned char buf[256];
  unsigned char outbuf[256]; 
  
  fds[0].fd = 0; 
  fds[1].fd = openSock;  
  fds[0].events = POLLIN;
  fds[1].events = POLLIN;
  
  while(1){
    int i;
    fds[0].fd = 0; 
    fds[1].fd = openSock;  
    fds[0].events = POLLIN;
    fds[1].events = POLLIN;

    polled = poll(fds, 2, 0);
    if(polled < 0){
      fprintf(stderr, "poll() error\n");
      restore_att();
      exit(1);
    } 
    if(fds[0].revents & POLLIN){
      ch = read(0, buf, 256);
      if(ch < 0){
	fprintf(stderr, "reding error\n");
	restore_att();
	exit(1);
      }

      if(cmpr == 1){
	strm1.zalloc = Z_NULL;
	strm1.zfree = Z_NULL;
	strm1.opaque = Z_NULL;
	if(deflateInit(&strm1, Z_DEFAULT_COMPRESSION) != Z_OK){
	  deflateEnd(&strm1);
	  fprintf(stderr, "deflateInit error\n");
	  restore_att();
	  exit(1);
	}
	
	strm1.avail_in = ch;
	strm1.next_in = buf;
	strm1.avail_out = 256;
	strm1.next_out = outbuf;

	do{
	  if(deflate(&strm1, Z_SYNC_FLUSH) != Z_OK){
	    fprintf(stderr, "deflate error\n");
	    restore_att();
	    exit(1);
	  }
	} while(strm1.avail_in > 0);
	deflateEnd(&strm1);
	
	byteNum = 256-strm1.avail_out;

	if(logFlag==1) {
	  char len[256];
	  sprintf(len, "SENT %d bytes: %s\n", byteNum, outbuf);
	  write(openFile, len, strlen(len));
	}
	write(openSock, &outbuf, byteNum);
      }

      
      if(logFlag==1 && (!cmpr)){
	char len[256];
	sprintf(len, "SENT %d bytes: %s\n", ch, buf);
	write(openFile, len, strlen(len));

      }

      for(i=0; i<ch; i++){
	c = buf[i];

	if(c == 0x0D || c ==0x0A){
	  write(1, crlf, 2);
	  if(!cmpr){
	    write(openSock, &c, 1);
	  }
	}
	else{
	  write(1, &c, 1);
	  if(!cmpr){
	    write(openSock, &c, 1);
	  }
	}
      }
    }
    
    if(fds[0].revents & (POLLHUP | POLLERR)){
      return;
    }
    
    if(fds[1].revents & POLLIN){
      ch = read(openSock, buf, 256);
      
      if(ch < 0){
	fprintf(stderr, "reading error\n");
	restore_att();
	exit(1);
      }
      if(ch == 0){
	restore_att();
	exit(0);
      }
      if(logFlag == 1){
	char s[256];
	sprintf(s, "RECEIVED %d bytes: %s\n", ch, buf);
	write(openFile, s, strlen(s));
      }

      if(cmpr == 1){ 
	strm2.zalloc = Z_NULL;
	strm2.zfree = Z_NULL;
	strm2.opaque = Z_NULL;

	if(inflateInit(&strm2) != Z_OK){
	  inflateEnd(&strm2);
	  fprintf(stderr, "inflateInit error\n");
	  restore_att();
	  exit(1);
	}
	
	strm2.avail_in = ch;
	strm2.next_in = buf;
	strm2.avail_out = 256;
	strm2.next_out = outbuf;
	
	do{
	  inflate(&strm2, Z_SYNC_FLUSH);
	}while(strm2.avail_in > 0);
	inflateEnd(&strm2);
	
	byteNum = 256 - strm2.avail_out;
	for(i=0; i< byteNum; i++){
	  c = outbuf[i];
	  if(c == 0x0D || c ==0x0A){
	    write(1, "crlf", 2);
	  }
	  else{
	    write(1, &c, 1);
	  }
	}

      }
      else {
	for(i=0; i<ch; i++){
	  c = buf[i];
	  if(c == 0x0D || c ==0x0A){
	    write(1, "crlf", 2);
	  }
	  else{
	    write(1, &c, 1);
	  }
	}
      }
    }

    if(fds[1].revents & (POLLHUP | POLLERR)){
      return;
    }
  }
}

int main(int argc, char** argv){
  int portnum =0;
  int optLong;
  int openFile;
  char* logfile;
  
  if(argc < 2){
    fprintf(stderr, " need arguments, Usage: ./lab1b-client --port=# [--log=logfile] [--compress]\n");
    exit(1);
  }
  else if(argc < 5){
    static struct option long_options[] = {
      {"port", 1, NULL, 'p'},
      {"compress", 0, NULL, 'c'},
      {"log", 1, NULL, 'l'},
      {0, 0, 0, 0}
    };
    while( (optLong = getopt_long(argc, argv, "p:c:l", long_options, NULL)) != -1) {
      switch (optLong) {
      case 'p':
	portnum = atoi(optarg);
	break;
      case 'c':
	cmpr = 1;
	break;
      case 'l':
	logfile = optarg;
	logFlag = 1;
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
  
  if(logFlag){
    openFile = open(logfile, O_WRONLY|O_CREAT|O_TRUNC, 0666);
    if(openFile < 0){
      fprintf(stderr, "open file error\n");
      exit(1);
    }
  }
  
  terFd = STDIN_FILENO;
  
  if(tcgetattr(terFd, &save_att)<0){
    fprintf(stderr,"saving attr error\n");
    exit(1);
  }
  
  struct termios change_att;
  
  if(tcgetattr(terFd, &change_att)<0){
    fprintf(stderr,"saving attr error\n");
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
    fprintf(stderr,"saving attr error\n");
    exit(1);
  }
  
  int openSock;
  struct sockaddr_in s_addr;
  struct hostent *server;
  
  openSock = socket(AF_INET, SOCK_STREAM, 0);
  if(openSock < 0){
    fprintf(stderr, "socket error\n");
    restore_att();
    exit(1);
  }

  server = gethostbyname("localhost");
  if(server == NULL){
    fprintf(stderr, "server error\n");
    restore_att();
    exit(1);
  }

  memset((char*) &s_addr, 0, sizeof(s_addr));
  s_addr.sin_family = AF_INET;
  
  memcpy((char*) &s_addr.sin_addr.s_addr, (char*) server->h_addr, server->h_length);
  s_addr.sin_port = htons(portnum);

  if(connect(openSock, (struct sockaddr*)&s_addr, sizeof(s_addr)) < 0){
    fprintf(stderr, "connection error\n");
    restore_att();
    exit(1);
  }
  
  
  communicate(openSock,openFile);
  
  
  restore_att();
  return 0;
}
