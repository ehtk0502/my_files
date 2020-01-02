import java.io.*;
import java.util.*;

import cs132.vapor.ast.*;

class DataPrint{
    
    DataPrint(VDataSegment[] data){
        
        System.out.println(".data\n");
        
        int dataNum = (int)data.length;
        for(int i = 0; i < dataNum; i++){
            printData(data[i]);
        }
        
        System.out.println(".text\n");
        System.out.println("\tjal Main\n\tli $v0 10\n\tsyscall\n");
    }
    
    
    public void printData(VDataSegment data){
        int numFunc = (int)data.values.length;
        
        System.out.println(data.ident + ":");
        
        for(int i = 0; i < numFunc; i++){
            String temp = data.values[i].toString();
            System.out.println("\t" + temp.substring(1));
        }
        
        System.out.print("\n");
    }
}