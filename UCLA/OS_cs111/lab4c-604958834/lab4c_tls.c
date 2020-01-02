#include <stdlib.h>
#include <stdio.h>
#include <getopt.h>
#include <string.h>
#include <mraa/aio.h>
#include <mraa/gpio.h>
#include <unistd.h>
#include <pthread.h>
#include <poll.h>
#include <math.h>
#include <ctype.h>
#include <fcntl.h>
#include <time.h>
#include <netinet/in.h>
#include <netdb.h>
#include <sys/socket.h>
#include <sys/time.h>
#include <sys/types.h>
#include <openssl/ssl.h>
#include <openssl/evp.h>
#include <openssl/err.h>

static int period =1;
static char tempScale = 'F';
static int opFlag = 1;
static int exitFlag = 0;
static int fileFlag = 0;
static int idFlag = 0;
static int hostFlag = 0;
char* fileName = NULL;
int logFd;
int socketFd;
int R0 =100000;
int B = 4275;
int i;
const SSL_METHOD *method;
SSL_CTX *ctx;
SSL *ssl;


mraa_aio_context sensor;

void changeOp(char* str){

	if(!strcmp(str, "OFF")){
		exitFlag = 1;
		if(fileFlag){
			dprintf(logFd, "OFF\n");
		}
	}
	else if(!strcmp(str, "STOP")){
		opFlag = 0;
		if(fileFlag){
			dprintf(logFd, "STOP\n");
		}
	}
	else if(!strcmp(str,"START")){
		opFlag = 1;
		if(fileFlag){
			dprintf(logFd, "START\n");
		}
	}
	else if(!strcmp(str, "SCALE=C")){
		tempScale = 'C';
		if(fileFlag){
			dprintf(logFd, "SCALE=C\n");
		}
	}
	else if(!strcmp(str, "SCALE=F")){
		tempScale = 'F';
		if(fileFlag){
			dprintf(logFd, "SCALE=F\n");
		}
	}
	else if((strlen(str) > 4) && (str[0]== 'L') && (str[1]== 'O') && (str[2]== 'G') && (str[3]== ' ')){
		char* tempFile = str + 4;
		if(fileFlag){
			dprintf(logFd, "LOG %s\n", tempFile);
		}
	}
	else if((strlen(str) > 7) && (str[0]== 'P') && (str[1]== 'E') && (str[2]== 'R') && (str[3]== 'I')
		&& (str[4]== 'O') && (str[5]== 'D') && (str[6]== '=')){
		/*
		if(!isdigit(str+7)){
			fprintf(stderr,"not integer");
			exitFlag = 1;
			exit(1);
		}
		*/
		period = (int)atoi(str+7);
		if(period < 1){
			fprintf(stderr,"wrong period");
			exitFlag = 1;
			exit(1);
		}
		if(fileFlag){
			dprintf(logFd, "PERIOD=%d\n", period);
		}
	}
	else{
		fprintf(stderr,"wrong input\n");
	}
}

void* readTemp(){
	struct tm *localTime;
    time_t m_time;
    char buf[9];
	char buf2[20];
	
	while(!exitFlag){
		if(opFlag){
			int temp = mraa_aio_read(sensor);
			float R = (1023.0/temp) -1.0;
			R = R0*R;
			float temperature = 1.0/(log(R/R0)/B+1/298.15)-273.15;
		
			if(tempScale == 'F'){
				temperature = temperature*1.8 +32;
			}
			
			m_time = time(NULL);
			localTime = localtime(&m_time);
			strftime(buf, 9, "%H:%M:%S", localTime);
			sprintf(buf2, "%s %.1f\n", buf, temperature);
			
			SSL_write(ssl, buf2, strlen(buf2));
			
			if(fileFlag){
				dprintf(logFd, "%s %.1f\n", buf, temperature);
			}
			
		}
		sleep(period);
	}
	
	m_time = time(NULL);
	localTime = localtime(&m_time);
	strftime(buf, 9, "%H:%M:%S", localTime);
	sprintf(buf2, "%s SHUTDOWN\n", buf);
	
	SSL_write(ssl, buf2, strlen(buf2));
	
	if(fileFlag){
		dprintf(logFd, "%s SHUTDOWN\n", buf);
	}
	
	pthread_exit(0);
}

void* readStdIn(){
	char buffer[300];
	char saved[300];
	int polled;
	ssize_t ch;
	char c;
	
	struct pollfd fds[1];
	fds[0].fd = socketFd;
	fds[0].events = POLLIN | POLLHUP | POLLERR;
	fds[0].revents = 0;
	memset(saved,0,300);
	
	while(!exitFlag){
		polled = poll(fds, 1, 0);
		if(polled == -1){
			fprintf(stderr, "poll error\n");
			exit(1);
		}
		if(fds[0].revents & POLLIN){
			memset(buffer,0,300);
			ch = SSL_read(ssl, buffer,300);
			if(ch < 0){
				fprintf(stderr, "read error\n");
				exit(1);
			}
			for(i = 0; i < ch; i++){
				c = buffer[i];
				if(c == '\n'){
					changeOp(saved);
					memset(saved,0,300);
				}
				else{
					strncat(saved, &c, 1);
				}
			}
		}
		
	}
	pthread_exit(0);
}


int main(int argc, char **argv){
	int optLong;
	int portNum;
	char* idNum = NULL;
	char* hostName =NULL;
	char* fileName = NULL;
	
	struct option options[] ={
    {"period", 1, NULL, 'p'},
    {"scale", 1, NULL, 's'},
    {"log", 1, NULL, 'l'},
	{"id", 1, NULL, 'i'},
	{"host", 1, NULL, 'h'},
    {0,0,0,0}
	};
	
	while ((optLong = getopt_long(argc, argv, "", options, NULL)) != -1){
		switch(optLong){
			case 'p':
				period = atoi(optarg);
				if(period < 0){
					fprintf(stderr,"invalid period\n");
					exit(1);
				}
				break;
			case 's':
				tempScale=optarg[0];
				if(tempScale != 'C' && tempScale !='F'){
					fprintf(stderr,"invalid scale input\n");
					exit(1);
				}
				break;
			case 'l':
				fileName =optarg;
				logFd =creat(fileName, S_IRWXU);
				if(logFd < 0){
					fprintf(stderr, "file open error");
					exit(1);
				}
				fileFlag = 1;
				break;
			case 'i':
				if(strlen(optarg) != 9){
					fprintf(stderr, "invalid ID\n");
					exit(1);
				}
				idNum = optarg;
				idFlag = 1;
				break;
			case 'h':
				hostName = optarg;
				hostFlag = 1;
				break;
			default:
				fprintf(stderr,"wrong input: --period=# --scale=CF --log=FILENAME\n");
				exit(1);
		}
	}
	
	if(!idFlag || !hostFlag){
		fprintf(stderr, "required input not found\n");
		exit(1);
	}
	if(optind == argc){
		fprintf(stderr, "port number not found\n");
		exit(1);
	}
	else{
		portNum = atoi(argv[optind]);
	}
	
	sensor = mraa_aio_init(1);
	
	struct sockaddr_in server_addr;
    struct hostent* server;
	
	socketFd = socket(AF_INET, SOCK_STREAM, 0);
	if(socketFd < 0){
		fprintf(stderr, "socket failure\n");
		exit(2);
	}
	
	server = gethostbyname(hostName);
	
	if(server == NULL){
		fprintf(stderr,"invalid server\n");
		exit(2);
	}
	
	memset((char*) &server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    memcpy((char*) &server_addr.sin_addr.s_addr, (char*) server->h_addr, server->h_length);
    server_addr.sin_port = htons(portNum);
	
	if(connect(socketFd, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0){
		fprintf(stderr, "connetion invalid\n");
		exit(2);
	}
	
	if(SSL_library_init() < 0){
  		fprintf(stderr, "ssl initializing error\n");
		exit(2);
  	}
	
  	OpenSSL_add_all_algorithms();
	method = TLSv1_client_method();
	
	if((ctx = SSL_CTX_new(method)) == NULL){
  		fprintf(stderr, "ssl create error\n");
		exit(2);
  	}
	ssl = SSL_new(ctx);
	if(ssl == NULL){
  		fprintf(stderr, "ssl fetching failure\n");
		exit(2);
  	}
	
	if(!SSL_set_fd(ssl, socketFd)){
		fprintf(stderr, "connection between ssl and socket failure\n");
		exit(2);
	}
	
	if(SSL_connect(ssl) != 1){
		fprintf(stderr, "ssl connection failure\n");
		exit(2);
	}

	
	char tempBuf[20];
	sprintf(tempBuf, "ID=%s\n", idNum);
	SSL_write(ssl, tempBuf, strlen(tempBuf));
	
	if(fileFlag){
		dprintf(logFd, "ID=%s\n", idNum);
	}
	
	pthread_t thread[2];
	int threadCreate;
	
	threadCreate = pthread_create(&thread[0], NULL, readTemp, NULL);
	if(threadCreate){
		fprintf(stderr,"thread create error\n");
		mraa_aio_close(sensor);
		exit(1);
	}
	threadCreate = pthread_create(&thread[1],NULL, readStdIn, NULL);
	if(threadCreate){
		fprintf(stderr,"thread create error\n");
		mraa_aio_close(sensor);
		exit(1);
	}
	
	for(i = 0; i < 2; i++){
		threadCreate = pthread_join(thread[i], NULL);
		if(threadCreate){
			fprintf(stderr,"thread join error\n");
			mraa_aio_close(sensor);
			exit(1);
		}
	}
	
	
	mraa_aio_close(sensor);
	
	
	
	return 0;
}
