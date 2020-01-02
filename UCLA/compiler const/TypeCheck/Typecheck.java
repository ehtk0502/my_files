import java.io.*;
import syntaxtree.Node;
import java.util.*;

class Typecheck{
    public static void main (String[] args){
        InputStream in = System.in;
        try{
            Node root = new MiniJavaParser(in).Goal();
            Myvisitor mv = new Myvisitor();
            
            root.accept(mv, null);
            //acyclic check
            
            if(!mv.acyclicHelper.isEmpty()){
                Set<String> m_acycle = mv.acyclicHelper.keySet();
                Iterator m_iter = m_acycle.iterator();
                int setSize = m_acycle.size()- 1;
                
                while(m_iter.hasNext()){
                    String currentKey = (String)m_iter.next();
                    String currVal = (String)mv.acyclicHelper.get(currentKey);
                    
                    if(mv.acyclicHelper.containsKey(currVal)){
                        String valToFind = (String)mv.acyclicHelper.get(currVal);
                        int i = 0;
                        while(mv.acyclicHelper.containsKey(valToFind) && i < setSize){
                            valToFind = (String)mv.acyclicHelper.get(valToFind);
                            if(valToFind.equals(currentKey)){
                                System.out.println("Type error");
                                System.exit(0);
                            }
                            i += 1;
                        }
                        
                    }
                }
                
            }
            
            Typevisitor tv = new Typevisitor();
            root.accept(tv, mv.SymbolCollect);
            
            System.out.println("Program type checked successfully");
        }
        catch(ParseException pe){
            System.out.println("Type error");
        }
    }
}

