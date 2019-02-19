#include <unistd.h>
#include <stdio.h>     // for printf
#include <stdlib.h>    // for exit
//#include <getopt.h>
#include <signal.h>    // for signal handling
#include <fcntl.h>     // to get rid of error: 'O_RDONLY' undeclared
#include <string.h>
#include <errno.h>

#include "ext2_fs.h"
#include "sys/stat.h"
#include <time.h>
#include <math.h>

struct ext2_super_block super_block;
struct ext2_group_desc *group_block;
//struct ext2_inode inode_block;

int group_num;

int number_blocks = 0;
int number_inodes = 0;

int inode_number = 0;

int ifd;
int blockSize;

//int number_inodes_group;



void indirectSum(int nodeNum, int blockNum, int numDir, int offSet){
    int opNum = blockSize / 4;
    int blockArr[opNum];
    int blockVal;
    int i;
    int newoffSet = 0;
    if(blockNum ==0){
        return;
    }
    pread(ifd, blockArr, blockSize, blockNum*blockSize);
    for(i = 0; i < opNum; i++){

        blockVal = blockArr[i];
        if(blockVal != 0){
           
        
        newoffSet =offSet + i;
        printf("INDIRECT,%d,%d,%d,%d,%d\n", nodeNum, numDir,newoffSet , blockNum, blockVal);
        

        if(numDir == 3)
        {
//            offSet = offSet + 0;
            indirectSum(nodeNum, blockVal, numDir-1, newoffSet);
            
        }
        else if (numDir == 2)
        {
//            offSet = offSet + 2;
            indirectSum(nodeNum, blockVal, numDir-1, newoffSet);
        }
        else if (numDir == 1)
        {
//            offSet = offSet + 1;
        }
        }
    
    }

}


void directInd(int numDir, int blockNum, int nodeNum, int offset){

    struct ext2_dir_entry* directory;
    char bufD[blockSize];
    int opNum = blockSize / 4;
    int blockArr2[opNum];
    int blockVal;
    int i;
    if(blockNum ==0){
        return;
    }
    pread(ifd, blockArr2, blockSize, blockNum*blockSize);

    for(i = 0; i < opNum; i++){
        blockVal = blockArr2[i];
        if(blockVal == 0){
            continue;
        }
        if(numDir > 1){
            directInd(numDir-1, blockVal, nodeNum, offset);
        }

        pread(ifd, bufD, blockSize, blockVal*blockSize);
        directory = (struct ext2_dir_entry*) bufD;

        while(1){
            if((offset >= blockSize) ||(directory->inode == 0)|| (directory->file_type == 0)){
                break;
            }

            int entLen = directory->rec_len;
            int nameLen = directory->name_len ;
            char* strName = directory->name ;

            printf("DIRENT,%d,%d,%d,%d,%d,'%s'\n", i, offset, directory->inode, entLen, nameLen, strName);

            offset += entLen;
            directory = (void*)directory + entLen;
        }

    }
}



void DirSum(struct ext2_inode node, int nodeNum){
    struct ext2_dir_entry* directory;
    char bufD[blockSize];
    int byteOffset = 0;
    int i;

    for(i = 0; i < 15; i++){
        if(node.i_block[i] == 0){
            continue;
        }

        if(i < 12){
            pread(ifd, bufD, blockSize, (node.i_block[i]) *blockSize);
            directory = (struct ext2_dir_entry*) bufD;

            while(1){
                if((byteOffset >= blockSize)||(directory->inode == 0)|| (directory->file_type == 0)){
                    break;
                }

                int entLen = directory->rec_len;
                int nameLen = directory->name_len ;
                char fName[nameLen + 1];
                memcpy(fName, directory->name, nameLen);
                fName[nameLen] ='\0';

                printf("DIRENT,%d,%d,%d,%d,%d,'%s'\n", nodeNum, byteOffset, directory->inode, entLen, nameLen, fName);

                byteOffset += entLen;
                directory = (void*)directory + entLen;
            }
        }
        if(i == 12){
            directInd(1, node.i_block[12], nodeNum, byteOffset);
        }
        else if(i == 13){
            directInd(2, node.i_block[13], nodeNum, byteOffset);
        }
        else if(i == 14){
            directInd(3, node.i_block[14], nodeNum, byteOffset);
        }
    }
}




int main(int argc, char **argv)
{
    void catch(int);
    signal(SIGSEGV, catch);
    
    (void)argc;
    

    ifd = open(argv[1], O_RDONLY);
    if (ifd >= 0)
    {
        //do nothing
    }
    else
    {
        fprintf(stderr, "Error in opening file \n");
        printf ("Error Number: %d\n",errno);
        printf ("Error: %s\n",strerror(errno));
        exit(1);
    }
    
    
    //superblock summary
    
    if (pread(ifd, &super_block, 1024, 1024) < 0)
    {
        fprintf(stderr, "Error in reading the file using pread call. \n");
        printf ("Error Number: %d\n",errno);
        printf ("Error: %s\n",strerror(errno));
        exit(1);
    }

    blockSize = 1024 << super_block.s_log_block_size;
    printf("SUPERBLOCK,%d,%d,%d,%d,%d,%d,%d\n",super_block.s_blocks_count, super_block.s_inodes_count, (1024 << super_block.s_log_block_size), super_block.s_inode_size, super_block.s_blocks_per_group, super_block.s_inodes_per_group, super_block.s_first_ino);
    
    //group summary
//    number_inodes_group = (signed int)super_block.s_inodes_per_group;
    
    group_num = super_block.s_blocks_count / super_block.s_blocks_per_group;  //first group number will be 0
    
//    printf("--group number = %d\n", group_num);
    
    group_block = malloc((group_num+1)* sizeof(struct ext2_group_desc));
    
    int i = 0;
    for(i = 0; i <= group_num; i++)
    {
        if (pread(ifd, &group_block[i], sizeof(group_block[i]),2048+(i*sizeof(group_block[i]))) < 0)
            {
                fprintf(stderr, "Error in reading the file using pread call. \n");
                printf ("Error Number: %d\n",errno);
                printf ("Error: %s\n",strerror(errno));
                exit(1);
            }
            
        number_blocks = super_block.s_blocks_per_group;
        number_inodes = super_block.s_inodes_per_group;
        
        //if the number of blocks is less than the blocks a group can have, then the group will have the lesser number of groups
        if(super_block.s_blocks_count < super_block.s_blocks_per_group)
        {
            number_blocks = super_block.s_blocks_count;
        }
        
        //same with inode number
        if(super_block.s_inodes_count < super_block.s_inodes_per_group)
        {
            number_inodes = super_block.s_inodes_count;
        }
            
        printf("GROUP,%d,%d,%d,%d,%d,%d,%d,%d\n",i, number_blocks, number_inodes, group_block[i].bg_free_blocks_count, group_block[i].bg_free_inodes_count, group_block[i].bg_block_bitmap, group_block[i].bg_inode_bitmap, group_block[i].bg_inode_table);
        
    }
                        
//    char * block_entry = malloc(1024*sizeof(char));
    char block_entry;
    char inode_entry;
    
    
    //free block entries
    
    int j = 0;
    int k = 0;
    int l = 0;
    for (j = 0; j <= group_num; j++)
    {
        for (k = 0; k < (1024 << super_block.s_log_block_size); k++)
        {
            if (pread(ifd, &block_entry, 1 ,(group_block[j].bg_block_bitmap * (1024 << super_block.s_log_block_size))+k) < 0)
                //group_block[j].bg_block_bitmap gives the block id starting from 0, and so we multiply with block size to find the offset.
//            if (pread(ifd, &block_entry, 1 ,(group_block[j].bg_block_bitmap)+k) < 0)
            {
                fprintf(stderr, "Error in reading the file using pread call. \n");
                printf ("Error Number: %d\n",errno);
                printf ("Error: %s\n",strerror(errno));
                exit(1);
            }
            
            //reading 8 different bits from the 1 byte block entry
            for (l = 0; l< 8; l++)
            {
                if (((block_entry >> l)  & 0x01) == 0)
                {
                    printf("BFREE,%d\n",(j*number_blocks) + (k*8) + l + 1);
                }
            }
        }
    }
    
    //free I-node entries
    
    for (j = 0; j <= group_num; j++)
    {
        for (k = 0; k < (1024 << super_block.s_log_block_size); k++)
        {
            if (pread(ifd, &inode_entry, 1 ,(group_block[j].bg_inode_bitmap * (1024 << super_block.s_log_block_size))+k) < 0)
                //group_block[j].bg_inode_bitmap gives the block id starting from 0, and so we multiply with block size to find the offset.
//            if (pread(ifd, &inode_entry, 1 ,(group_block[j].bg_inode_bitmap)+k) < 0)
            {
                fprintf(stderr, "Error in reading the file using pread call. \n");
                printf ("Error Number: %d\n",errno);
                printf ("Error: %s\n",strerror(errno));
                exit(1);
            }
            
            //reading 8 different bits from the 1 byte inode entry
            for (l = 0; l< 8; l++)
            {
                if (((inode_entry >> l)  & 0x01) == 0)
                {
                    printf("IFREE,%d\n",(j*number_inodes) + (k*8) + l + 1);
                }
            }
        }
    }
    
    
    //inode summary
    struct ext2_inode inode_block;
    
//    unsigned int inodes_per_block = 0;
//    unsigned int itable_blocks = 0;   /// size in blocks of the inode table
    
    int is_file = 0;
    int is_directory = 0;
    int is_symlink = 0;

    
    for (i = 0; i <= group_num; i++)
    {
//        inodes_per_block = (group_block[i].bg_inode_table*(1024 << super_block.s_log_block_size)) / sizeof(struct ext2_inode);
        
//        itable_blocks = super_block.s_inodes_per_group / inodes_per_block;
        
//        printf("---itable_blocks = %d\n", itable_blocks);
       
        
//        printf("1111\n");
        for (j = 0; j < (signed int)super_block.s_inodes_per_group; j++)
        {
//            printf("abc\n");
            if (pread(ifd, &inode_block, sizeof(struct ext2_inode), (group_block[i].bg_inode_table*(1024 << super_block.s_log_block_size))+ (j*sizeof(struct ext2_inode))) < 0)
            {
                fprintf(stderr, "Error in reading the file using pread call. \n");
                printf ("Error Number: %d\n",errno);
                printf ("Error: %s\n",strerror(errno));
                exit(1);
            }
            
            is_file = 0;
            is_directory = 0;
            is_symlink = 0;
            
            //inode 1 rejected because we defined inode number 1 as bad blocks inode
            if ((j != 0) &&(inode_block.i_links_count != 0) && (inode_block.i_mode != 0))
            {
                printf("INODE,%d,",(i*super_block.s_inodes_per_group) + j + 1);
                
                inode_number = j +1;
                
                if(inode_block.i_mode & S_IFREG)
                {
                    is_file = 1;
                }
                
                if(inode_block.i_mode & S_IFDIR)
                {
                    is_directory = 1;
                }
                
                if(inode_block.i_mode & S_IFLNK)
                {
                    is_symlink = 1;
                }
                
                if (is_file == 1)
                {
                    printf("f,");
//                    indirectSum(0, inode_block.i_block[12], 1, 12);
//                    indirectSum(0, inode_block.i_block[13], 2, 268);
//                    indirectSum(0, inode_block.i_block[14], 3, 65804);
                }
                else if (is_directory == 1)
                {
                    printf("d,");
//                    DirSum(inode_block, 0);
//                    indirectSum(0, inode_block.i_block[12], 1, 12);
//                    indirectSum(0, inode_block.i_block[13], 2, 268);
//                    indirectSum(0, inode_block.i_block[14], 3, 65804);
                }
                else if (is_symlink == 1)
                {
                    printf("s,");
                }
                else
                {
                    printf("?,");
                }
                
                printf("%o,",inode_block.i_mode & 0xFFF);
                
                printf("%d,%d,%d,",inode_block.i_uid, inode_block.i_gid, inode_block.i_links_count );
                
                struct tm *info;
//                struct tm epoch_time_m;
//                time_t seconds = inode_block.i_mtime;
                time_t seconds = inode_block.i_ctime;
                if (inode_block.i_ctime > inode_block.i_dtime )
                {
                    seconds = inode_block.i_ctime;
                }
                else
                {
                    seconds = inode_block.i_dtime;
                }
//                memcpy(&epoch_time_m, gmtime(&seconds), sizeof (struct tm));
                char buffer[80];
                info = gmtime (&seconds);
                strftime(buffer,80,"%m/%d/%y %H:%M:%S", info);
                printf("%s,",buffer);
                
                struct tm *info2;
                //                struct tm epoch_time_m;
                time_t seconds2 = inode_block.i_mtime;
                //                memcpy(&epoch_time_m, gmtime(&seconds), sizeof (struct tm));
                char buffer2[80];
                info2 = gmtime (&seconds2);
                strftime(buffer2,80,"%m/%d/%y %H:%M:%S", info2);
                printf("%s,",buffer2);
                
                struct tm *info3;
                //                struct tm epoch_time_m;
                time_t seconds3 = inode_block.i_atime;
                //                memcpy(&epoch_time_m, gmtime(&seconds), sizeof (struct tm));
                char buffer3[80];
                info3 = gmtime (&seconds3);
                strftime(buffer3,80,"%m/%d/%y %H:%M:%S", info3);
                printf("%s,",buffer3);
                
                printf("%d,",inode_block.i_size);
                
                printf("%d,",inode_block.i_blocks);
                
                if ((is_file == 1) || (is_directory == 1))
                {
                    int q = 0;
                    for (q=0; q<14; q++)
                    {
                        printf("%d,",inode_block.i_block[q] );
                    }
                    printf("%d",inode_block.i_block[14] );
                }
                
                if ((is_symlink == 1) && (is_file == 0) && (is_directory == 0)&&(inode_block.i_size > 60))
                {
                    int q = 0;
                    for (q=0; q<14; q++)
                    {
                        printf("%d,",inode_block.i_block[q] );
                    }
                    printf("%d",inode_block.i_block[14] );
                }
                
                printf("\n");
            }
            
//            printf("reached here\n");
            //directory entries
            if (is_directory == 1)
            {
                DirSum(inode_block, inode_number);
            }
            
            
            if (is_file == 1)
            {
                indirectSum(inode_number, inode_block.i_block[12], 1, 12); //12 blocks
                indirectSum(inode_number, inode_block.i_block[13], 2, 268);  //256+12 blocks
                indirectSum(inode_number, inode_block.i_block[14], 3, 65804);
            }
            else if (is_directory == 1)
            {
//                DirSum(inode_block, inode_number);
                indirectSum(inode_number, inode_block.i_block[12], 1, 12);
                indirectSum(inode_number, inode_block.i_block[13], 2, 268);
                indirectSum(inode_number, inode_block.i_block[14], 3, 65804);
            }
//            printf ("--passed value: %d\n", inode_number);
            
        }
    }
    
    
    
    //indirect block references
    
    
    
   
    close (ifd);
    exit(0);
}

void catch(int catchnum) {
    if (catchnum == SIGSEGV)
    {
        fprintf(stderr, "Segmentation Fault Detected by Signal Handler. \n");
        printf ("Error Number: %d\n",errno);
        printf ("Error: %s\n",strerror(errno));
        exit(1);
    }
}