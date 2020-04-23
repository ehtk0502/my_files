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
        delete_all(root);
    }

    private:

    // each time new node is added, new depth is returned. this value is used
    // to update the balance factor which wiil be then used as a thresh for balancing operation.
    // the parent node is passed as an argument in case balancing needs to happen. Newly balanced
    // branch needs to become a child of the parent.

    int insertElement(AVL_Node* parent, AVL_Node* current, int new_val){
        if(current->val < new_val){
            if(current->right == NULL){
                set_right_child(current, new AVL_Node(new_val));
                current->right_length = 1;
            }
            else{
                current->right_length = insertElement(current, current->right, new_val);
            }
        }
        else{
            if(current->left == NULL){
                set_left_child(current, new AVL_Node(new_val));
                current->left_length = 1;
            }
            else{
                current->left_length = insertElement(current, current->left, new_val);
            }
        }

        current->balance_factor = current->left_length - current->right_length;

        if(current->balance_factor < -1 || current->balance_factor > 1){
            balance_tree(parent, current);
        }

        return 1 + max(current->left_length, current->right_length);
    }

    //figures out what balancing the tree needs and the set the right parent after the procedure
    void balance_tree(AVL_Node* parent, AVL_Node* current){
        //See what balancing is needed. LL LR RR or RL

        //decides which node function is invoked 
        void (AVL_Tree::*set_child)(AVL_Node*, AVL_Node*) 
            = (parent->left == current) ?  &AVL_Tree::set_left_child: &AVL_Tree::set_right_child; 
        

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
                result = RR_balance(current);
            }
            else{ //Right
                result = RL_balance(current);
            }
        }

        //set child node to a parent.
        (this->*set_child)(parent, result);
    }

    // The four balancing functions balance the tree and return an address
    // of the top node so the calling function can set the parent for it.
    AVL_Node* LL_balance(AVL_Node* current){
        AVL_Node* node_2 = current->left;
        AVL_Node* node_3 = node_2->left;

        current->left = node_2->right;
        node_2->right = current;
        
        balance_height(node_2, node_3, current);

        return node_2;
    }

    AVL_Node* LR_balance(AVL_Node* current){
        AVL_Node* node_2 = current->left;
        AVL_Node* node_3 = node_2->right;

        node_2->right = node_3->left;
        current ->left = node_3->right;

        balance_height(node_3, node_2, current);

        return node_3;
    }

    AVL_Node* RR_balance(AVL_Node* current){
        AVL_Node* node_2 = current->right;
        AVL_Node* node_3 = node_2->right;

        current->right = node_2->left;
        node_2->left = current;

        balance_height(node_2, current, node_3);

        return node_2;
    }

    AVL_Node* RL_balance(AVL_Node* current){
        AVL_Node* node_2 = current->right;
        AVL_Node* node_3 = node_2->left;

        node_2->left = node_3->right;
        current->right = node_3->left;
        node_3->left = current;
        node_3->right = node_2;

        balance_height(node_3, current, node_2);

        return node_3;
    }

    // this function refactors the height of the tree after balancing takes place.
    // we only need to look at the three nodes balanced and their immediate children.
    void balance_height(AVL_Node* parent, AVL_Node* node_left, AVL_Node* node_right){
        if(node_left->left == NULL){
            node_left->left_length = 0;
        }
        else{
            AVL_Node* temp_left = node_left->left;
            node_left->left_length = 1 + max(temp_left->left_length, temp_left->right_length);
        }

        if(node_left->right == NULL){
            node_left->right_length = 0;
        }
        else{
            AVL_Node* temp_right = node_left->right;
            node_left->right_length = 1 + max(temp_right->left_length, temp_right->right_length);
        }

        if(node_right->left == NULL){
            node_right->left_length = 0;
        }
        else{
            AVL_Node* temp_left = node_right->left;
            node_right->left_length = 1 + max(temp_left->left_length, temp_left->right_length);
        }

        if(node_right->right == NULL){
            node_right->right_length = 0;
        }
        else{
            AVL_Node* temp_right = node_right->right;
            node_right->right_length = 1 + max(temp_right->left_length, temp_right->right_length);
        }

        parent->left_length = 1 + max(node_left->left_length, node_left->right_length);
        parent->right_length = 1 + max(node_right->left_length, node_right->right_length);
    }

    void set_right_child(AVL_Node* parent, AVL_Node* child){
        if(parent == NULL){
            return;
        }
        parent->right = child;
    }

    void set_left_child(AVL_Node* parent, AVL_Node* child){
        if(parent == NULL){
            return;
        }
        parent->left = child;
    }
    
    void delete_all(AVL_Node* node){
        
        if(node == NULL){
            return;
        }

        delete_all(node->left);
        delete_all(node->right);

        cout << "deleting: " << node->val << endl;

        delete(node);

    }

    AVL_Node* root;
    int node_num;
};