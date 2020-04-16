using namespace std;

struct AVL_Node{
    int val;
    int balance_factor;
    int max_height;

    AVL_Node* left;
    AVL_Node* right;


    AVL_Node(int x) : val(x), balance_factor(0), max_height(0), left(NULL), right(NULL){}
};