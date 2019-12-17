import java.io.*;
import java.util.*;

class StoreObj{
    public String def;
    public String succ;
    public String regVal;
    public Set<String> use;
    public Set<String> in;
    public Set<String> out;
    public int endRange;
    public int spill;
    
    
    StoreObj(){
        def = null;
        succ = null;
        use = null;
        in = null;
        out = null;
        regVal = null;
        endRange = -1;
        spill = -1;
    }
    
    public void setSpill(int val){
        spill = val;
    }
    
    public void setReg(String var){
        regVal = var;
    }
    
    public void setEnd(int range){
        endRange = range;
    }
    
    public void addDef(String var){
        def = var;
    }
    
    public void addSucc(String var){
        succ = var;
    }
    
    public boolean addUse(String var){
        if(use == null){
            use = new HashSet<>();
        }
        
        if(!use.add(var)){
            return false;
        }
        
        return true;
    }
    
    public boolean addIn(String var){
        if(in == null){
            in = new HashSet<>();
        }
        
        if(!in.add(var)){
            return false;
        }
        
        return true;
    }
    
    public boolean addOut(String var){
        if(out == null){
            out = new HashSet<>();
        }
        
        if(!out.add(var)){
            return false;
        }
        
        return true;
    }
    
    
}