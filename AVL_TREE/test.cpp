using namespace std;
#include <iostream>
#include <string>
# include "AVL_Tree.cpp"


int main(){

    AVL_Tree* m_tree = new AVL_Tree();

    m_tree->insert(5);
    m_tree->insert(3);
    m_tree->insert(6);
    m_tree->insert(7);
    m_tree->insert(1);
    m_tree->insert(9);
    m_tree->insert(10);
    m_tree->clear();
    cout << "works" << endl;

    return 0;
}

