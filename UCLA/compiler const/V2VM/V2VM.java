import java.io.*;
import java.util.*;

import cs132.util.ProblemException;
import cs132.vapor.parser.VaporParser;
import cs132.vapor.ast.*;
import cs132.vapor.ast.VBuiltIn.Op;

class V2VM{
    
    public static void main (String[] args) throws IOException{
        InputStream in = System.in;
        
        Op[] ops = {
        Op.Add, Op.Sub, Op.MulS, Op.Eq, Op.Lt, Op.LtS,
        Op.PrintIntS, Op.HeapAllocZ, Op.Error,
        };
        
        boolean allowLocals = true;
        String[] registers = null;
        boolean allowStack = false;

        VaporProgram program = null;
        
        try{
        program = VaporParser.run(new InputStreamReader(in), 1, 1,
                    java.util.Arrays.asList(ops),
                    allowLocals, registers, allowStack);
        }
        catch(ProblemException pe){
            System.out.println(pe.getMessage());
            return;
        }
       
        if(program == null){
            System.out.println("Parsing Error");
            return;
        }
        
        DataPrint m_data = new DataPrint(program.dataSegments);
        
        //Translate m_Trans = new Translate(program.functions[0]);
        
        Translate m_Trans;
        for(VFunction func : program.functions){
            new Translate(func);
        }
        
        /*
        LivelyVisitor
        Translate m_Trans;
        for(VFunction func : program.functions){
            new Translate(func);
        }
        */
    }
}
