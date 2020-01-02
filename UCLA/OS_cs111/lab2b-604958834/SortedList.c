#include "SortedList.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <pthread.h>

void SortedList_insert(SortedList_t *list, SortedListElement_t *element)
{
  if (!list || !element) {
    return;
  }
  SortedListElement_t *head = list;
  SortedListElement_t *traverse = head->next;

  while(traverse != list)
    {
      if(strcmp(element->key, traverse->key) < 0)
	break;
      traverse = traverse;
      traverse = traverse->next;
    }

  if(opt_yield & INSERT_YIELD){
    sched_yield();
  }
  
  element->next = head->next;
  element->prev = head;
  head->next = element;
  element->next->prev = element;
}

int SortedList_delete( SortedListElement_t *element)
{
  if(!element){
    return 1;
  }
  if(element->prev->next != element || element->next->prev != element){
    return 1;
  }
  if(opt_yield & DELETE_YIELD){
    sched_yield();
  }
  
  element->prev->next = element->next;
  element->next->prev = element->prev;
  return 0;
}

SortedListElement_t *SortedList_lookup(SortedList_t *list, const char *key)
{
  if(!list || !key){
    return NULL;
  }
  
  SortedListElement_t *traverse = list->next;

  while(traverse != list)
    {
      if(!strcmp(key, traverse->key)){
	return traverse;
      }
      if(opt_yield & LOOKUP_YIELD){
	sched_yield();
      }
      traverse = traverse->next;
    }

  return NULL;
}

int SortedList_length(SortedList_t *list)
{
  if(!list){
    return -1;
  }
  
  int length = 0;
    
  SortedListElement_t *traverse = list->next;
  while(traverse != list)
    {
      if(traverse->prev->next != traverse || traverse->next->prev != traverse){
	return -1;
      }
      length++;

      if(opt_yield & LOOKUP_YIELD)
	sched_yield();
        
      traverse = traverse->next;
    }
    
  return length;
}
