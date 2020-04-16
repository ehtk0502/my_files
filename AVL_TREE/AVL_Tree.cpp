using namespace std;
#include <iostream>
#include "AVL_Node.h"


class AVL_Tree{
    public:

    AVL_Tree(){
        root = NULL;
        node_num = 0;
    }

    ~AVL_Tree(){
        clear();
    }

    bool empty(){
        return (node_num == 0) ? true : false;
    }

    void insert(int new_val){
        if(root == NULL){
            root = new AVL_Node(new_val);
        }
        else{

        }
    }
    
    void clear(){
        delete_all(root);
    }

    private:
    
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