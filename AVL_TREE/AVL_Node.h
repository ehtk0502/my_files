using namespace std;

struct AVL_Node{
    int val;
    int balance_factor;
    int left_length;
    int right_length;

    AVL_Node* left;
    AVL_Node* right;


    AVL_Node(int x) : val(x), balance_factor(0), left_length(0), right_length(0), left(NULL), right(NULL){}
};