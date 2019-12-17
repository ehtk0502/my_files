import java.io.*;
import java.util.*;

import cs132.vapor.ast.VInstr.Visitor;
import cs132.vapor.ast.*;

class YayOneVisitor extends Visitor<RuntimeException>{
    int in;
    int out;
    int local;
    int rep_pointer;
    
    YayOneVisitor(VFunction func){
        
        in = func.stack.in;
        out = func.stack.out;
        local = func.stack.local;
        rep_pointer = 8 + ((out + local)*4);
        
        System.out.println(func.ident+":");
        System.out.println("\tsw $fp -8($sp)");
        System.out.println("\tmove $fp $sp");
        System.out.println("\tsubu $sp $sp " + rep_pointer);
        System.out.println("\tsw $ra -4($fp)");
        
        int ind = func.body[0].sourcePos.line;
        int labelPos = 0;
        if(func.labels.length != 0){
            int label = func.labels[0].sourcePos.line;
            while(label < ind){
                System.out.println(func.labels[labelPos].ident + ":");
                labelPos += 1;
                label = func.labels[labelPos].sourcePos.line;
            }
        }
     
        for(VInstr inst : func.body){
            int currInd = inst.sourcePos.line;
            
            while(currInd != ind){
                System.out.println(func.labels[labelPos].ident + ":");
                ind += 1;
                labelPos += 1;
            }
            
            inst.accept(this);
            ind += 1;
        }
    }
    
    private boolean isImm(String var) {
        if(var == null){
            return false;
        }
        
        if(var.contains("$")){
            return false;
        }
        else if(var.contains(":")){
            return false; //var instanceof VMemRef.Stack);
        }
        else if(var.contains("lo") || var.contains("in") || var.contains("out")){
            return false;
        }
        
        return true;
    }
    
    
    @Override
    public void visit(VAssign a) throws RuntimeException{
        String lhs = a.dest.toString();
        String rhs = a.source.toString();
        
        if(rhs.contains("$")){
            System.out.println("\tmove " + lhs + " " + rhs);
        }
        else{
            if(rhs.contains(":")){
                System.out.println("\tla " + lhs + " " + rhs.substring(1));
            }
            else{
                System.out.println("\tli " + lhs + " " + rhs);
            }
        }
    }
    
    @Override
    public void visit(VCall c) throws RuntimeException{
        
        VAddr addr = c.addr;
        String addrVal = c.addr.toString();
        String jmp;
        
        if(addr instanceof VAddr.Var){
            jmp = "jalr ";
        }
        else{
            jmp = "jal ";
            addrVal = addrVal.substring(1);
            
        }
        
        System.out.println("\t" + jmp + addrVal);
    }
    
    @Override
    public void visit(VBuiltIn c) throws RuntimeException{
        
        VVarRef lhs = c.dest;
        String lhsVal  = ""; 
        
        if(lhs != null){
            lhsVal = lhs.toString();
        }
        
        String operation = c.op.name; //function name
        
        boolean imm = false;
        if(c.args.length == 1){
            String m_arg = c.args[0].toString();
            imm = isImm(m_arg);
            
            if(operation.contains("Er")){
                System.out.println("\tla $a0 _str0");
                System.out.println("\tj _error");
            }
            else if(operation.contains("Pr")){
                
                String inst;
                if(imm){
                    inst = "li $a0";
                }
                else{
                    inst = "move $a0";
                }
                System.out.format("\t%s %s\n\tjal _print\n", inst, m_arg);

            }
            else if(operation.contains("He")){
                
                String inst;
                
                if(imm){
                    inst = "li $a0";
                }
                else{
                    inst = "move $a0";
                }
                
                System.out.format("\t%s %s\n\tjal _heapAlloc\n", inst, m_arg);
                System.out.format("\tmove %s $v0\n", lhsVal);
            }
         
        }
        else{
            String m_arg1 = c.args[0].toString();
            String m_arg2 = c.args[1].toString();
            
            imm = isImm(m_arg1);
            if(!imm){
                imm = isImm(m_arg2);
            }
            else{
                System.out.println("\tli $t9 " + m_arg1);
                m_arg1 = "$t9";
            }
            
            switch(operation){
                case "LtS":
                    
                    if(imm){
                        operation = "slti";
                    }
                    else{
                        operation = "slt";
                    }
                    
                    break;
                    
                case "Add":
                    operation = "addu";
                    
                    break;
                
                case "Lt":    
                    operation = "sltu";
                    break;
                    
                case "Sub": // no i 
                    operation = "sub";
                    break;
                    
                case "MulS": //no i
                    operation = "mul";
                    break;    
                    
                default:
            }
            
            System.out.format("\t%s %s %s %s\n", operation, lhsVal, m_arg1, m_arg2);
            
        }
        
    }
    
    @Override
    public void visit(VMemWrite w) throws RuntimeException{
        
        VMemRef lhs = w.dest;
        
        String rhs = w.source.toString();
        
        if(lhs instanceof VMemRef.Global){
            String reg = ((VMemRef.Global)lhs).base.toString();
            int byteOff = ((VMemRef.Global)lhs).byteOffset;
            reg = byteOff + "(" + reg + ")";
            
            if(rhs.contains(":")){
                rhs = rhs.substring(1);
                System.out.format("\tla $t9 %s\n\tsw $t9 %s\n", rhs, reg);
            }
            else{
                if(!rhs.contains("$")){
                    System.out.format("\tli $t9 %s\n", rhs);
                    rhs = "$t9";
                }
                System.out.format("\tsw %s %s\n", rhs, reg);
            }
        }
        else{
            int offSet = 4 * ((VMemRef.Stack)lhs).index;
            String reg = offSet + "($sp)";
            
            if(rhs.contains("$")){
                System.out.format("\tsw %s %s\n", rhs, reg);
            }
            else{
                System.out.format("\tli $t9 %s\n", rhs);
                System.out.format("\tsw $t9 %s\n", reg);
            }
        }
        
    }
        

    
    @Override
    public void visit(VMemRead r) throws RuntimeException{
        String lhs = r.dest.toString();
        
        VMemRef rhs = r.source;
        
        if(rhs instanceof VMemRef.Global){
            String reg = ((VMemRef.Global)rhs).base.toString();
            int byteOff = ((VMemRef.Global)rhs).byteOffset;
            
            System.out.format("\tlw %s %d(%s)\n", lhs, byteOff, reg);
        }
        else{
            String reg = ((VMemRef.Stack)rhs).region.toString();
            int byteOff = 4 * ((VMemRef.Stack)rhs).index;
            
            if(reg.contains("Lo")){
                reg ="($sp)";
            }
            else{
                reg ="($fp)";
            }
            
            System.out.format("\tlw %s %d%s\n", lhs, byteOff, reg);
        }
        
    }
    
    @Override
    public void visit(VBranch b) throws RuntimeException{
        String bVal = b.value.toString();
        String m_lable = b.target.getTarget().ident;
        String ifVal;
        
        if(b.positive){
            ifVal = "bnez ";
        }
        else{
            ifVal = "beqz ";
        }
        
        
        System.out.println("\t" + ifVal + bVal + " " + m_lable);
        
    }
    
    @Override
    public void visit(VGoto g) throws RuntimeException{
        
        String m_lable = g.target.toString();
        
        System.out.println("\tj " + m_lable.substring(1));
    }
    
    @Override
    public void visit(VReturn r) throws RuntimeException{
        
        System.out.println("\tlw $ra -4($fp)");
        System.out.println("\tlw $fp -8($fp)");
        System.out.println("\taddu $sp $sp " + rep_pointer);
        System.out.println("\tjr $ra\n");
    }

}