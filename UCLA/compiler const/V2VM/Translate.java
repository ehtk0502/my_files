import java.io.*;
import java.util.*;

import cs132.vapor.ast.VInstr.Visitor;
import cs132.vapor.ast.*;

class Translate extends Visitor<RuntimeException>{
    
    HashMap<String, String> findReg; // given var name give reg
    public int IndentNum;
    public int restore;
    
    Translate(VFunction func){
        RegisterAlloc registerInfo  = new RegisterAlloc(func);
        findReg = registerInfo.valToReg;
        
        IndentNum = 0;
        restore = 0;
        
        HashMap<Integer, String> m_labels = registerInfo.m_lab;
        
        Set<String> calleeinfo = registerInfo.calleeSaves; //list of all calleesaves
        int numCallee = calleeinfo.size();
        int numLocal = numCallee + registerInfo.numSpill;
        
        int outNum = registerInfo.outRegNum;
        if(outNum > 4){
            outNum = outNum - 4;
        }
        else{
            outNum = 0;
        }
        
        int inNum = func.params.length;
        if(inNum > 4){
            inNum = inNum - 4;
        }
        else{
            inNum = 0;
        }
        
        
        System.out.println("func " + func.ident + "[in " + String.valueOf(inNum) + ", out " + String.valueOf(outNum) + ", local " + String.valueOf(numCallee) +"]"); 
        
        //$s0..$s7: general use callee-saved
        
        int saveCounter = 0;
        int vCounter = 0;
        Iterator iter = calleeinfo.iterator();
        while(iter.hasNext()){
            String m_var = (String)iter.next();
            if(saveCounter < 8){
                String reg = "s"+ String.valueOf(saveCounter);
                System.out.println("local[" + saveCounter + "] = $" + reg);
                findReg.putIfAbsent(m_var, reg);
                restore += 1;
            }else{
                String reg = "local[" + saveCounter + "]";
                findReg.putIfAbsent(m_var, reg);
            }
            
            saveCounter += 1;
            /*
            if(saveCounter > 7){
                reg = "v"+ String.valueOf(vCounter);
                System.out.println("local[" + String.valueOf((saveCounter +1 + vCounter)) + "] = $" + reg);
                findReg.putIfAbsent(m_var, reg);
                vCounter += 1;
            }else{
                System.out.println("local[" + saveCounter + "] = $" + reg);
                findReg.putIfAbsent(m_var, reg);
                saveCounter += 1;
            }
            */
        }
        
        int paramNum = 0;
        int inCounter = 0;
        for(VVarRef.Local param : func.params){
            String m_param = param.ident;
            if(calleeinfo.contains(m_param)){
                String reg = (String)findReg.get(m_param);
                System.out.println("$"+ reg + "{" + m_param + "} = $a" + String.valueOf(paramNum));
            }
            else{
                if(paramNum > 3){
                    String reg = "in[" + String.valueOf(inCounter) + "]";
                    findReg.putIfAbsent(m_param, reg);
                    inCounter += 1;
                    continue;
                }
                
                String reg = "a" + String.valueOf(paramNum);
                findReg.putIfAbsent(m_param, reg);
            }
            paramNum += 1;
        }
        
        
        int InstInd = func.body[0].sourcePos.line;
       
        for(VCodeLabel lab :func.labels){
            String temp = lab.ident;
            int m_temp = lab.sourcePos.line;
            
            if(m_temp < InstInd){
                System.out.println(temp+":");
            }
        }
        
        for(VInstr inst : func.body){
            while(m_labels.containsKey(InstInd)){
                System.out.println((String)m_labels.get(InstInd)+":");
                InstInd += 1;
            }
            
            IndentNum += 1;
            inst.accept(this);
            IndentNum -= 1;
            
            
            InstInd +=1;
        }
        
    }
    
    private boolean isVar(Node var) {
        if(var == null){
            return false;
        }
        
        if(var instanceof VOperand){
            return var instanceof VVarRef.Local;
        }
        else if(var instanceof VMemRef){
            return var instanceof VMemRef.Global;
        }
        
        return false;
    }
    
    private void putIndent(){
        for(int i = 0; i < IndentNum; i++){
            System.out.print("\t");
        }
    }
    
    private void retoreCallee(){
        for(int i = 0; i < restore; i++){
            String val = String.valueOf(i);
            System.out.println("$s" + val + " = local[" + val + "]");
        }
    }
    
    private String prodReg(String reg, String name){
        String temp;
        temp = reg + "{" + name + "}";
        return temp;
    }
    
    private String isReg(String reg){
        if(Character.compare(reg.charAt(0), 'i') == 0 ){
                return reg;
        }
        else if(Character.compare(reg.charAt(0), 'l') == 0 ){
            return reg;
        }
            
        return "$" + reg;
    }
    
    @Override
    public void visit(VAssign a) throws RuntimeException{
        
        String lhs = a.dest.toString();
        String reg = (String)findReg.get(lhs);
        lhs = prodReg(reg ,lhs);
        lhs = isReg(lhs);
        
        if(reg == null){
            return;
        }
        
        
        VOperand rhs = a.source;
        String rightSide = rhs.toString();
        
        if(isVar(rhs)){
            String temp = rightSide;
            rightSide = (String)findReg.get(temp);
            rightSide = prodReg(rightSide , temp);
            rightSide = isReg(rightSide);
        }
        
        putIndent();
        System.out.println(lhs + " = " + rightSide);
        
    }
    
    //$a0..$a3
    @Override
    public void visit(VCall c) throws RuntimeException{
        
        int opNum = 0;
        int outReg = 0;
        String a_reg;
        for(VOperand arguments : c.args){
            if(opNum < 4){ 
                a_reg = "$a" + String.valueOf(opNum);
            }
            else{
                a_reg = "out[" + String.valueOf(outReg) + "]";
                outReg += 1;
            }
            
            String rhsVal = arguments.toString();
            if(isVar(arguments)){  
                String temp = (String)findReg.get(rhsVal);
                rhsVal = prodReg(temp, rhsVal);
                rhsVal = isReg(rhsVal);
            }
            
            putIndent();
            System.out.println(a_reg + " = " + rhsVal);
            
            opNum += 1;
        }
        
        String rhs = c.addr.toString();
        String reg = findReg.get(rhs);
        /////
        
        
        if(reg == null ){
            putIndent();
            System.out.println("call " + rhs);
        }
        else{
            reg = findReg.get(rhs);
            putIndent();
            System.out.println("call $" + reg + "{" + rhs + "}");   
        }
  
        
        VOperand lhs = c.dest;
        if(lhs == null){
            return;
        }
        String lhsVal = lhs.toString();
        String regVal = findReg.get(lhsVal);
        
        if(regVal == null){
            return;
        }
        lhsVal = prodReg(regVal, lhsVal);
        lhsVal = isReg(lhsVal);
        
        putIndent();
        System.out.println(lhsVal + " = $v0");
        
    }
    
    @Override
    public void visit(VBuiltIn c) throws RuntimeException{
        VVarRef lhs = c.dest;
        String lhsVal = "";
        
        if(lhs != null){
            lhsVal = lhs.toString();
            String tempReg = findReg.get(lhsVal);
            if(tempReg == null){
                System.out.println("prolly Error");
                return;
            }
            lhsVal = prodReg(tempReg, lhsVal);
            lhsVal = isReg(lhsVal) + " = ";
            
        }
        
        putIndent();
        System.out.print(lhsVal + c.op.name +"(" );
        
        for(VOperand arguments : c.args){
            String argVal = arguments.toString();
            
            
            if(isVar(arguments)){
                String tempReg = findReg.get(argVal);
                argVal = prodReg(tempReg, argVal);
                argVal = isReg(argVal);
            }
            System.out.print(" " + argVal);
            
        }
        
        System.out.println(")");
    }
    
    @Override
    public void visit(VMemWrite w) throws RuntimeException{
        
        VMemRef.Global lhs = (VMemRef.Global)w.dest;
        String lhsVal = lhs.base.toString();
        String lhsRg = findReg.get(lhsVal);
        if(lhsRg == null){
            System.out.println("memwrite lhs error");
            return;
        }
        
        lhsVal = prodReg(lhsRg, lhsVal);
        lhsVal = isReg(lhsVal);
        
        VOperand rhs = w.source;
        String rhsVal = rhs.toString();
        if(isVar(rhs)) {
            String tempReg = findReg.get(rhsVal);
            if(tempReg == null){
                System.out.println("memwrite rhs error");
                return;
            }
            
            if(Character.compare(tempReg.charAt(0), 'a') == 0 ){
                rhsVal = "$"+tempReg;
            }
            else{
                rhsVal = prodReg(tempReg, rhsVal);
                rhsVal = isReg(rhsVal);
            }

        }
        
        int offSet = lhs.byteOffset;
        String offS = "+" + String.valueOf(offSet);
        if(offSet == 0){
            offS = "";
        }
        
        putIndent();
        System.out.println("[" + lhsVal + offS + "] = " + rhsVal);
        
    }
        

    
    @Override
    public void visit(VMemRead r) throws RuntimeException{
        
        
        VVarRef lhs = r.dest;
        String lhsVal = lhs.toString();
        String tempReg = findReg.get(lhsVal);
        if(tempReg == null){
            System.out.println("memread lhs error");
            return;
        }
        lhsVal = prodReg(tempReg, lhsVal);
        lhsVal = isReg(lhsVal);
        
        VMemRef.Global rhs = (VMemRef.Global)r.source;
        String rhsVal = rhs.base.toString();
        tempReg = findReg.get(rhsVal);
        
        if(tempReg == null){
            System.out.println("memread rhs error");
            return;
        }
        rhsVal = prodReg(tempReg, rhsVal);
        rhsVal = isReg(rhsVal);
        
        int offSet = rhs.byteOffset;
        String offS = "+" + String.valueOf(offSet);
        if(offSet == 0){
            offS = "";
        }
        
        putIndent();
        System.out.println(lhsVal + " = [" + rhsVal + offS + "]");
        
    }
    
    @Override
    public void visit(VBranch b) throws RuntimeException{
        
        VOperand val = b.value;
        String useVal = val.toString();
        String tempReg = findReg.get(useVal);
        
        if(tempReg == null){
            System.out.println("if error");
            return;
        }
        
        useVal = prodReg(tempReg, useVal);
        useVal = isReg(useVal);
        
        String isPositive = "0";
        if(b.positive){
            isPositive = "";
        }
        
        putIndent();
        System.out.println("if" + isPositive + " " + useVal + " " + "goto " + b.target.toString());
        
    }
    
    @Override
    public void visit(VGoto g) throws RuntimeException{
       String val = g.target.toString();
       
       putIndent();
       System.out.println("goto " + val);
       
    }
    
    @Override
    public void visit(VReturn r) throws RuntimeException{
        
        VOperand retVal = r.value;
        
        if(retVal == null){
            putIndent();
            System.out.println("ret\n");
            return;
        }
        
        String theVal = retVal.toString();
        
        if(isVar(retVal)){
            String temp = (String)findReg.get(theVal);
            theVal = prodReg(temp, theVal);
            theVal = isReg(theVal);
        }
        
        putIndent();
        System.out.println("$v0 = " + theVal);
        
        putIndent();
        retoreCallee();
        
        putIndent();
        System.out.println("ret\n");
    }
    
}