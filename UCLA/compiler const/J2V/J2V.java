import java.io.*;
import syntaxtree.Node;
import java.util.*;

class J2V{
    public static void main (String[] args){
        InputStream in = System.in;
        try{
            Node root = new MiniJavaParser(in).Goal();
            Myvisitor mv = new Myvisitor();
            
            root.accept(mv, null);
            
            
            Typevisitor tv = new Typevisitor();
            root.accept(tv, mv.collection);
            
        }
        catch(ParseException pe){
            System.out.println("error");
        }
    }
}

