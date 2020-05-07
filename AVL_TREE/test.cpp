using namespace std;
#include <iostream>
#include <string>
#include "AVL_Tree.cpp"
#include <vector>
#include <unordered_set>

int main(){

    AVL_Tree* m_tree = new AVL_Tree();

    unordered_set<int> m_set;
    vector<int> rand_arr;

    for(int i=0; i < 100; i++){
        int random = (int)(rand()%101);
        
        if(m_set.find(random) == m_set.end()){
            rand_arr.push_back(random);
            m_set.insert(random);
        }
    }

    for(int i=0; i<rand_arr.size(); i++){
        m_tree->insert(rand_arr[i]);
    }

/*
    m_tree->insert(10);
    m_tree->insert(15);
    m_tree->insert(5);
    m_tree->insert(13);
    m_tree->insert(17);
    m_tree->insert(12);
    m_tree->insert(46);
    m_tree->insert(55);
    m_tree->insert(77);
    m_tree->insert(88);
    m_tree->insert(99);
    m_tree->insert(44);
    m_tree->insert(21);
    m_tree->insert(23);
    m_tree->insert(27);
    m_tree->insert(37);
    m_tree->insert(39);
    m_tree->insert(1);
    m_tree->insert(2);
    m_tree->insert(100);
    m_tree->insert(102);
    m_tree->insert(7);
    m_tree->insert(3);
    m_tree->insert(4);

*/
    m_tree->clear();
    cout << "works" << endl;
    cout << rand_arr.size() << endl;
    return 0;
}

