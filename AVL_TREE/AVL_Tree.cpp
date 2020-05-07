using namespace std;
#include <iostream>
#include <algorithm>
#include <stdio.h>
#include "AVL_Node.h"



class AVL_Tree{
    public:

    // constructor initializes member variables
    AVL_Tree(){
        root = NULL;
        node_num = 0;
    }

    // destroys all nodes before exiting
    ~AVL_Tree(){
        clear();
    }

    bool empty(){
        return (node_num == 0) ? true : false;
    }

    // if first elemen is inserted, root gets the new node
    // else we call a helping function that returns the max length
    void insert(int new_val){
        if(root == NULL){
            root = new AVL_Node(new_val);
        }
        else{
            insertElement(NULL, root, new_val);
        }
    }
    
    void clear(){
        cout << delete_all(root) << endl;
    }

    private:

    // each time new node is added, new depth is returned. this value is used
    // to update the balance factor which wiil be then used as a thresh for balancing operation.
    // the parent node is passed as an argument in case balancing needs to happen. Newly balanced
    // branch needs to become a child of the parent.

    int insertElement(AVL_Node* parent, AVL_Node* current, int new_val){
        if(new_val == current->val){
            return -1;
        }
        
        if(current->val < new_val){
            if(current->right == NULL){
                current->right = new AVL_Node(new_val);
                current->right_length = 1;
            }
            else{
                int res = insertElement(current, current->right, new_val);
                
                if(res == -1){
                    return res;
                }

                current->right_length = res;
            }
        }
        else{
            if(current->left == NULL){
                current->left = new AVL_Node(new_val);
                current->left_length = 1;
            }
            else{
                int res = insertElement(current, current->left, new_val);

                if(res == -1){
                    return res;
                }

                current->left_length = res;

            }
        }

        current->balance_factor = current->left_length - current->right_length;

        if(current->balance_factor < -1 || current->balance_factor > 1){
            AVL_Node* result = balance_tree(current);
            
            if(current == root){
                root = result;
                return -1;
            }

            if(parent->left == current){
                parent->left = result;
            }
            else{
                parent->right = result;
            }

            return 1 + max(result->left_length, result->right_length);

        }

        return 1 + max(current->left_length, current->right_length);
    }

    //figures out what balancing the tree needs and the set the right parent after the procedure
    AVL_Node* balance_tree(AVL_Node* current){
        //See what balancing is needed. LL LR RR or RL

        AVL_Node* result;

        if(current->balance_factor > 0){ //Left
            if(current->left->balance_factor > 0){ //Left
                result = LL_balance(current);
            }
            else{// Right
                result = LR_balance(current);
            }
        }
        else{  //Right
            if(current->right->balance_factor > 0){ //Left
                result = RL_balance(current);
            }
            else{ //Right
                result = RR_balance(current);
            }
        }


        return result;

    }

    // The four balancing functions balance the tree and return an address
    // of the top node so the calling function can set the parent for it.
    AVL_Node* LL_balance(AVL_Node* current){
        cout << "LL" << endl;
        AVL_Node* node_2 = current->left;
        AVL_Node* node_3 = node_2->left;

        current->left = node_2->right;
        node_2->right = current;
        
        current->left_length = (current->left == NULL) ? 0 : (1 + max(current->left->left_length, current->left->right_length));
        current->balance_factor = current->left_length - current->right_length;
        
        node_2->right_length = 1 + max(current->left_length, current->right_length);
        node_2->balance_factor = node_2->left_length - node_2->right_length;

        return node_2;
    }

    AVL_Node* LR_balance(AVL_Node* current){
        cout << "LR" << endl;
        AVL_Node* node_2 = current->left;
        AVL_Node* node_3 = node_2->right;

        node_2->right = node_3->left;
        current ->left = node_3->right;

        node_3->left = node_2;
        node_3->right = current;

        node_2->right_length = (node_2->right == NULL) ? 0 : 1 + max(node_2->right->left_length, node_2->right->right_length);
        node_2->balance_factor = node_2->left_length - node_2->right_length;

        current->left_length = (current->left == NULL) ? 0 : 1 + max(current->left->left_length, current->left->right_length);
        current->balance_factor = current->left_length - current->right_length;

        node_3->left_length = 1 + max(node_3->left->left_length, node_3->left->right_length);
        node_3->right_length = 1 + max(node_3->right->left_length, node_3->right->left_length);
        node_3->balance_factor = node_3->left_length - node_3->right_length;

        return node_3;
    }

    AVL_Node* RR_balance(AVL_Node* current){
        cout << "RR" << endl;

        AVL_Node* node_2 = current->right;
        AVL_Node* node_3 = node_2->right;

        current->right = node_2->left;
        node_2->left = current;

        current->right_length = (current->right == NULL) ? 0 : (1 + max(current->right->left_length, current->right->left_length));
        current->balance_factor = current->left_length - current->right_length;
        
        node_2->left_length = 1 + max(current->left_length, current->right_length); 
        node_2->balance_factor = node_2->left_length - node_2->right_length;
        
        return node_2;
    }

    AVL_Node* RL_balance(AVL_Node* current){
        cout << "RL" << endl;

        AVL_Node* node_2 = current->right;
        AVL_Node* node_3 = node_2->left;

        node_2->left = node_3->right;
        current->right = node_3->left;

        node_3->left = current;
        node_3->right = node_2;


        node_2->left_length = (node_2->left == NULL) ? 0 : 1 + max(node_2->left->left_length, node_2->left->right_length);
        node_2->balance_factor = node_2->left_length - node_2->right_length;

        current->right_length = (current->right == NULL) ? 0 : 1 + max(current->right->left_length, current->right->right_length);
        current->balance_factor = current->left_length - current->right_length;

        node_3->left_length = 1 + max(node_3->left->left_length, node_3->left->right_length);
        node_3->right_length = 1 + max(node_3->right->left_length, node_3->right->right_length);

        return node_3;
    }
    
    int delete_all(AVL_Node* node){
        
        if(node == NULL){
            return 0;
        }

        int lt = delete_all(node->left);
        int rt = delete_all(node->right);

        cout << "deleting: " << node->val << endl;

        delete(node);

        return 1 + lt + rt;
    }

    AVL_Node* root;
    int node_num;
};