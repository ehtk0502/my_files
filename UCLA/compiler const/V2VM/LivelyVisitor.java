import java.io.*;
import java.util.*;

import cs132.vapor.ast.VInstr.Visitor;
import cs132.vapor.ast.*;
// todo: check outregister max num
class LivelyVisitor extends Visitor<RuntimeException>{
    
    public Hashtable<Integer, StoreObj> SymbolCollect = new Hashtable<Integer, StoreObj>();
    public HashMap<String, Integer> LabelCollect = new HashMap<String, Integer>();
    public HashMap<Integer, String> m_label = new HashMap<Integer, String>();
    
    public Vector indices = new Vector(); //contains indices for statements
    public Vector callObj = new Vector(); //has indices for calls
    
    public boolean callExists;
    public int outRegisterNum;
    
    public boolean isThereCall(){
        if (callExists){
            return true;
        }
        return false;
    }
    
    LivelyVisitor(VFunction func){
        callExists = false;
        outRegisterNum = 0;
        
        for(VCodeLabel lab :func.labels){
            String temp = lab.ident;
            
            if(Character.compare(temp.charAt(0), ':') == 0 ){
                temp = temp.substring(1);
            }
            
            LabelCollect.putIfAbsent(temp, lab.sourcePos.line);
            m_label.putIfAbsent(lab.sourcePos.line, temp);
        }
        
        for(VInstr inst : func.body){
            inst.accept(this);
        }
        
        
        boolean stop = true;
        int VecSize = indices.size();
        
        while(stop){
            stop = false;
            
            for(int i = 0; i < VecSize; i++){
                //System.out.println("5");
                int val1 = (int)indices.elementAt(i);
                
                
                StoreObj temp = SymbolCollect.get(val1);
                
                if(temp == null){
                    //System.out.println("123123123");
                    return;
                }
                
                if(temp.def != null){
                    if(temp.def.equals("Goto")){
                        if(CurrNode(temp)){
                            stop = true;
                        }
                        
                        if(SuccNode(temp)){
                            stop = true;
                        }
                        continue;
                    }
                }
                
                if(Integer.compare(i+1, VecSize) == 0){
                    if(CurrNode(temp)){
                        stop = true;
                    }
                    
                    if(SuccNode(temp)){
                        stop = true;
                    }
                    
                    continue;
                }
                
                //System.out.println("11");
                if(CurrNode(temp)){
                    stop = true;
                }
                
                int nextVal = (int)indices.elementAt(i+1);
                if(SuccNormal(temp, nextVal)){
                    stop = true;
                }
                
                //System.out.println("11345");
                if(SuccNode(temp)){
                    stop = true;
                }
                
            }
        }
        
        SetRange();
    }
    
    private void SetRange(){
        int VecSize = indices.size();
        
        String m_def;
        StoreObj temp;
        
        for(int i = 0; i < VecSize; i++){
            temp = SymbolCollect.get(((int)indices.elementAt(i)));
            if(!(temp.def == null)){
                m_def = temp.def;
                
                if(m_def.equals("Goto")){// goto is not a def
                    continue;
                }
                
                for(int j = (VecSize-1); j > i; j--){
                    int index = (int)indices.elementAt(j);
                    StoreObj temp1 = SymbolCollect.get(index);
                    if(temp1.in != null){
                        if(temp1.in.contains(m_def)){
                            temp.setEnd(index);
                            break;
                        }
                    }
                    
                }
            }
        }
        
    }
    
    private boolean SuccNormal(StoreObj a, int line){
        boolean cond = false;
        
        
        StoreObj nextObj = SymbolCollect.get(line);
        
        if(nextObj.in == null){
            return false;
        }
        
        Iterator iter;
        iter = nextObj.in.iterator();
        String tempStr;
        while(iter.hasNext()){
            tempStr = (String)iter.next();
            if(a.addOut(tempStr)){
                cond = true;
            }
        }
        return cond;
    }
    
    private boolean CurrNode(StoreObj a){
        boolean cond = false;
        Iterator iter;
        String tempStr;
        
        if(a.use != null){
            iter = a.use.iterator();
            while(iter.hasNext()){
                tempStr = (String)iter.next();
                if(a.addIn(tempStr)){
                    cond = true;
                }
            }
            
        }
        
        //System.out.println("2");
        
        if(a.out != null){
            iter = a.out.iterator();
            //System.out.println("2.1");
            while(iter.hasNext()){
                tempStr = (String)iter.next();
                //System.out.println("2.3");
                if(a.def != null){
                    if(!a.def.equals(tempStr)){
                        if(a.addIn(tempStr)){
                            cond = true;
                        }
                    }   
                }
                else{
                    if(a.addIn(tempStr)){
                        cond = true;
                    }
                }
            }
        }
        
        
        return cond;
    }
    
    private boolean SuccNode(StoreObj a){
        boolean cond = false;
        String tempStr;
        
        if(a.succ == null){
            return false;
        }
        
        //System.out.println("1");
        int m_Succ = (int)LabelCollect.get(a.succ) + 1; // next node ind
        StoreObj temp = SymbolCollect.get(m_Succ);
        
        while(temp == null){ // if no obj found then its lebel and find the next obj
            m_Succ += 1;
            temp = SymbolCollect.get(m_Succ);
        }
        
        if(temp.in != null){
            Iterator iter = temp.in.iterator();
            while(iter.hasNext()){
                tempStr = (String)iter.next();
                if(a.addOut(tempStr)){
                    cond = true;
                }
            }
        }
        
        return cond;
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
    
    @Override
    public void visit(VAssign a) throws RuntimeException{
        int line = a.sourcePos.line;
        indices.add(line);
        
        
        VVarRef lhs = a.dest;
        
        
        VOperand rhs = a.source;
        
        StoreObj newObj = new StoreObj();
        
        
        
        if(isVar(rhs)){
            newObj.addUse(rhs.toString());
            
        }
        
        newObj.addDef(lhs.toString());
        
        SymbolCollect.putIfAbsent(line, newObj);
        
    }
    
    @Override
    public void visit(VCall c) throws RuntimeException{
        int line = c.sourcePos.line;
        indices.add(line);
        
        
        callExists = true;
        callObj.add(line);
        
        StoreObj newObj = new StoreObj();
        
        VOperand lhs = c.dest;
        
        if(isVar(lhs)) {
            newObj.addDef(lhs.toString());
        }
        
        String rhs = c.addr.toString();
        
        // if i get rid of this 22 points
        if(Character.compare(rhs.charAt(0), ':') == 0 ){
        }
        else{
            newObj.addUse(rhs);
        }

        
        if(c.args.length > outRegisterNum){
            outRegisterNum = c.args.length;
        }
        
        for(VOperand arguments : c.args){
            if(isVar(arguments)){
                
                newObj.addUse(arguments.toString());
            }
        }
        
        SymbolCollect.putIfAbsent(line, newObj);
        
    }
    
    @Override
    public void visit(VBuiltIn c) throws RuntimeException{
        int line = c.sourcePos.line;
        indices.add(line);
        
        StoreObj newObj = new StoreObj();
        
        VVarRef lhs = c.dest;
        
        if(lhs != null){
            newObj.addDef(lhs.toString());
        }
        
        if(Character.compare(c.op.name.charAt(0), 'H') == 0 ){
            newObj.setSpill(1);
        }
        
        for(VOperand arguments : c.args){
            if(isVar(arguments)){
                
                newObj.addUse(arguments.toString());
            }
        }
        
        SymbolCollect.putIfAbsent(line, newObj);
    }
    
    @Override
    public void visit(VMemWrite w) throws RuntimeException{
        int line = w.sourcePos.line;
        indices.add(line);
        
        
        StoreObj newObj = new StoreObj();
        
        VMemRef lhs = w.dest;
        
        if(isVar(lhs)) {
            newObj.addUse(((VMemRef.Global)lhs).base.toString());
        }
        
        VOperand rhs = w.source;
        
        if(isVar(rhs)) {
            newObj.addUse(rhs.toString());
        }
        
        SymbolCollect.putIfAbsent(line, newObj);
        
    }
        

    
    @Override
    public void visit(VMemRead r) throws RuntimeException{
        int line = r.sourcePos.line;
        indices.add(line);
        
        StoreObj newObj = new StoreObj();
        
        VVarRef lhs = r.dest;
        
        
        if(isVar(lhs)) {
            newObj.addDef(lhs.toString());
        }
        
        VMemRef rhs = r.source;
        
        if(isVar(rhs)) {
            newObj.addUse(((VMemRef.Global)rhs).base.toString());
        }
        
        SymbolCollect.putIfAbsent(line, newObj);
        
    }
    
    @Override
    public void visit(VBranch b) throws RuntimeException{
        int line = b.sourcePos.line;
        indices.add(line);
        
        StoreObj newObj = new StoreObj();
        
        VOperand val = b.value;
        newObj.addUse(val.toString());
        
        
        String m_lable = b.target.getTarget().ident;
        
        if(Character.compare(m_lable.charAt(0), ':') == 0 ){
                m_lable = m_lable.substring(1);
        }
        newObj.addSucc(m_lable);
        
        SymbolCollect.putIfAbsent(line, newObj);
        
    }
    
    @Override
    public void visit(VGoto g) throws RuntimeException{
        int line = g.sourcePos.line;
        indices.add(line);
        
        StoreObj newObj = new StoreObj();
        newObj.addDef("Goto");
        
        String m_lable = g.target.toString();
        
        
        if(Character.compare(m_lable.charAt(0), ':') == 0 ){
                m_lable = m_lable.substring(1);
        }
        
        newObj.addSucc(m_lable);
        
        SymbolCollect.putIfAbsent(line, newObj);
        
    }
    
    @Override
    public void visit(VReturn r) throws RuntimeException{
        int line = r.sourcePos.line;
        indices.add(line);
        
        StoreObj newObj = new StoreObj();
        
        VOperand retVal = r.value;
        
        if(isVar(retVal)){
            newObj.addUse(retVal.toString());
        }
        
        SymbolCollect.putIfAbsent(line, newObj);
        
    }
    
}
