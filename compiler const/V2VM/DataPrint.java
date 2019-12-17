import java.io.*;
import java.util.*;

import cs132.vapor.ast.*;

class DataPrint{
    
    DataPrint(VDataSegment[] data){
        
        int dataNum = (int)data.length;
        for(int i = 0; i < dataNum; i++){
            printData(data[i]);
        }
    }
    
    
    public void printData(VDataSegment data){
        int numFunc = (int)data.values.length;
        
        System.out.println("const " + data.ident);
        
        for(int i = 0; i < numFunc; i++){
            System.out.println("\t" + data.values[i]);
        }
        
        System.out.print("\n");
    }
}