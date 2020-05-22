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
        cout << "deleted " << delete_all(root) << " nodes" << endl;
    }

    // balance function checks if difference in length from left and right child nodes
    // is less than 2. If this condition meets for all nodes, we know the tree is balanced
    void isBlanced(){
        if(check_balance(root) == -1){
            cout << "not balanced" << endl;
        }
        else{
            cout << "balanced" << endl;
        }
    }

    //erase a target node if it exits. deleting needs to update length variable in the
    // parents nodes
    void erase(int value){
        delete_node(NULL, root, value);
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
                node_num ++;
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
                node_num ++;
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
    
    // If the balance factor is 2 or -2, we balance the tree

        if(current->balance_factor < -1 || current->balance_factor > 1){
            
     // balancing function returns a group of balanced node with a new node as a parent

            AVL_Node* result = balance_tree(current);
    // if the current node was a root node then the new node replaces it            
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

    AVL_Node* delete_node(AVL_Node* parent, AVL_Node* current, int value){
    //no value is found
        AVL_Node* result = NULL;

        if(current == NULL){
            return result;
        }

    //target value is found, we proceed to delete. there are three cases
        if(current->val == value){
            if(current->left != NULL && current->right != NULL){
                
                if(current->left_length > current->right_length){
                    result = right_node_delete(current, current->left);      
                }
                else{
                    result = left_node_delete(current, current->right);
                }
                
                result->left = current->left;
                result->right = current->right;
                result->left_length = (result->left == NULL) ? 0 : (1 + max(result->left->left_length, result->left->right_length));
                result->right_length = (result->right == NULL) ? 0 : (1 + max(result->right->left_length, result->right->right_length));
                result->balance_factor = current->left_length - current->right_length;

            }
            else if(current->left != NULL){
                if(current == root){
                    result = NULL;
                    root = current->left;
                }
                else{
                    result = current->left;
                }
            }
            else if(current->right != NULL){
                if(current == root){
                    root = current->right;
                }
                else{
                    result = current->right;
                }
            }
            else{
                if(current == root){
                    root = NULL;
                }
            }

            delete(current);

        }
        else{

            if(current->val < value){
                delete_node(current, current->right, value);
            }
            else{
                delete_node(current , current->left, value);
            }

        }


    }

    AVL_Node* left_node_delete(AVL_Node* parent, AVL_Node* node){
        AVL_Node* left_most;

        if(node->left == NULL){
            left_most = node;
            
            if(node->right != NULL){
                parent->left = node->right;
            }
            else{
                parent->left = NULL;
            }

        }
        else{
            left_most = left_node_delete(node, node->left);

            if(node->left == NULL){
                node->left_length = 0;
                node->balance_factor = node->right_length;
            }
            else{
                node->left_length = 1 + max(node->left->left_length, node->left->right_length);
                node->balance_factor = node->left_length - node->right_length;
            }

            if(node->balance_factor < -1 || node->balance_factor > 1){
                parent->left = balance_tree(node);
            }

        }

        return left_most;
    }

    AVL_Node* right_node_delete(AVL_Node* parent, AVL_Node* node){
        AVL_Node* right_most;

        if(node->right == NULL){
            right_most =  node;

            if(node->left != NULL){
                parent->right = node->left;
            }
            else{
                parent->right = NULL;
            }

        }
        else{
            right_most = right_node_delete(node, node->right);

            if(node->right == NULL){
                node->right_length = 0;
                node->balance_factor = node->left_length;
            }
            else{
                node->right_length = 1 + max(node->right->left_length, node->right->right_length);
                node->balance_factor = node->left_length - node->right_length;
            }

            if(node->balance_factor < -1 || node->balance_factor > 1){
                parent->right = balance_tree(node);
            }
        }

        return right_most;
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

        delete(node);

        return 1 + lt + rt;
    }

    int check_balance(AVL_Node* node){
        if(node == NULL){
            return 0;
        }

        int lf = check_balance(node->left);
        if(lf == -1){
            return lf;
        }

        int rt = check_balance(node->right);
        if(rt == -1){
            return rt;
        }

        int balance = lf - rt;
        if(balance > 1 || balance < -1){
            return -1;
        }

        return 1 + max(lf, rt);

        

    }

    AVL_Node* root;
    int node_num;
};