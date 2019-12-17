import java.io.*;
import java.util.*;

import cs132.util.ProblemException;
import cs132.vapor.parser.VaporParser;
import cs132.vapor.ast.*;
import cs132.vapor.ast.VBuiltIn.Op;

class VM2M{
    
    public static void main (String[] args) throws IOException{
        InputStream in = System.in;
        
        Op[] ops = {
        Op.Add, Op.Sub, Op.MulS, Op.Eq, Op.Lt, Op.LtS,
        Op.PrintIntS, Op.HeapAllocZ, Op.Error,
        };
        
        boolean allowLocals = false;
        String[] registers = {
          "v0", "v1",
          "a0", "a1", "a2", "a3",
          "t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7",
          "s0", "s1", "s2", "s3", "s4", "s5", "s6", "s7",
          "t8",
        };
        boolean allowStack = true;

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
        
        //YayOneVisitor m_visitor = new YayOneVisitor(program.functions[1]);
        
        for(VFunction func : program.functions){
            YayOneVisitor temp = new YayOneVisitor(func);
        }
        
        System.out.println("_print:\n\tli $v0 1\n\tsyscall\n\tla $a0 _newline\n\tli $v0 4\n\tsyscall\n\tjr $ra\n");
        System.out.println("_error:\n\tli $v0 4\n\tsyscall\n\tli $v0 10\n\tsyscall\n");
        System.out.println("_heapAlloc:\n\tli $v0 9\n\tsyscall\n\tjr $ra\n");
        System.out.println(".data");
        System.out.println(".align 0");
        System.out.println("_newline: .asciiz \"\\n\"");
        System.out.println("_str0: .asciiz \"null pointer\\n\"");
    }
}
