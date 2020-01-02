import java.io.*;
import java.util.*;

import cs132.vapor.ast.*;

class RegisterAlloc{
    
    public HashMap<String, String> valToReg = new HashMap<String, String>();
    public HashMap<Integer, String> m_lab;
    public Set<String> calleeSaves;
    public int numSpill;
    public int outRegNum;
    
    RegisterAlloc(VFunction func){
        outRegNum = 0;
        numSpill = 0;
        
        LivelyVisitor m_Live = new LivelyVisitor(func);
        Hashtable<Integer, StoreObj> FromLive = m_Live.SymbolCollect; // all the objects
        
        Vector m_ind = m_Live.indices; //indices for each statment
        int VecSize = m_ind.size(); //number of indices
        
        m_lab = m_Live.m_label; // all the label
        
        calleeSaves = new HashSet<>();
        int calleeNum;
        
        HashMap<Integer, String> regAlloc = new HashMap<Integer, String>(); //manage t0..t8 registers
        
        HashMap<Integer, Integer> spillManage = new HashMap<Integer, Integer>();
        
        
        if(m_Live.isThereCall()){
            outRegNum = m_Live.outRegisterNum;
            
            Vector funcInd = m_Live.callObj; // contains indices for all func
            
            int tempSize = funcInd.size();
            
            for(int i = 0; i < tempSize; i++){
                int tempInd = (int)funcInd.elementAt(i); //actual indices for func
                StoreObj tempObj = FromLive.get(tempInd);
                
                Set in = tempObj.in;
                Set out = tempObj.out;
                
                if(in == null){
                    continue;
                }
                if(out == null){
                    continue;
                }
                // whatever is in out is alive after the function call
                Iterator iter = in.iterator();
                while(iter.hasNext()){
                    String tempStr = (String)iter.next();
                    
                    if(out.contains(tempStr)){
                        calleeSaves.add(tempStr);
                    }
                }
                
            }
        }
        
        //available callerSaves $t0..$t8
        calleeNum = calleeSaves.size();
        
        //look at each statements in order
        for(int i = 0; i < VecSize; i++){
            
            int ind = (int)m_ind.elementAt(i); //curr index
            StoreObj tempObj = FromLive.get(ind);
            String m_var = tempObj.def;
            
            Collection<String> usedReg = null; //collection of used registers.
            
            if(m_var != null){ //if there is no definition, there is no need for assigning reg.
                if(m_var.equals("Goto")){
                    continue;
                }
                if(calleeSaves.contains(m_var)){
                    continue; // callees get special registers.
                }
                //// if def is not used then dont assign
                if(!isSaved(tempObj)){
                    continue;
                }
                //regAlloc uses index to find register.
                if(!regAlloc.isEmpty()){
                    
                    Set<Integer> regUsed = regAlloc.keySet();
                    Iterator iter = regUsed.iterator();
                    Vector tempVect = new Vector();
                    
                    while(iter.hasNext()){
                        int objInd = (int)iter.next();
                        tempVect.add(objInd);
                    }
                    
                    int tempSize = tempVect.size();
                    for(int k = 0; k < tempSize; k++){
                        int objInd = (int)tempVect.elementAt(k);
                        StoreObj variable = FromLive.get(objInd);
                        
                        int isLive = variable.endRange;
                        
                        if(isLive <= ind){ // if index is less or equal to curr index
                            if(variable.spill != 1){
                                regAlloc.remove(objInd);
                            }
                        } 
                    }
                    // reg still occupied
                    usedReg = regAlloc.values();
                    
                }
                
                ////////////////////////// i need to assign the spill reg here.
                String m_reg = null;
                
                if(usedReg != null){
                    if(usedReg.size() == 9){
                        
                        //////// need to see if other var would be switched out.
                        //spillManage uses ind and ind mapping
                        if(!spillManage.isEmpty()){
                            
                            if(spillManage.size() > numSpill){
                                numSpill = spillManage.size(); //check the number of spills before earasing
                            }
                            
                            Set<Integer> indVals = spillManage.keySet();
                            Iterator iter = indVals.iterator();
                            Vector tempVect = new Vector();
                            
                            while(iter.hasNext()){
                                int objInd = (int)iter.next();
                                tempVect.add(objInd);
                            }
                            
                            int tempSize = tempVect.size();
                            for(int k = 0; k < tempSize; k++){
                                int objInd = (int)tempVect.elementAt(k);
                                StoreObj variable = FromLive.get(objInd);
                                
                                int isLive = variable.endRange;
                                
                                if(isLive <= ind){ // if index is less or equal to curr index
                                    spillManage.remove(objInd);
                                } 
                            }
                          
                            if(spillManage.isEmpty()){
                                String regVal = "local[" + String.valueOf(calleeNum) + "]";
                                if(valToReg.putIfAbsent(m_var, regVal) == null){
                                    spillManage.putIfAbsent(ind, calleeNum);
                                }
                                
                            }
                            else{
                                Collection<Integer> localVals = spillManage.values();
                                int valSize = localVals.size();
                                int m_regVal = -1;
                                for(int k = 0; k < valSize; k++){
                                    int tempInt = calleeNum + i;
                                    if(!localVals.contains(tempInt)){
                                        m_regVal = tempInt;
                                    }
                                }
                                
                                if(m_regVal == -1){
                                    m_regVal = calleeNum + valSize - 1;
                                }
                                
                                String regVal = "local[" + String.valueOf(m_regVal) + "]";
                                if(valToReg.putIfAbsent(m_var, regVal) == null){
                                    spillManage.putIfAbsent(ind, m_regVal);
                                }
                            }
                        }
                        else{
                            String regVal = "local[" + String.valueOf(calleeNum) + "]";
                            if(valToReg.putIfAbsent(m_var, regVal) == null){
                                spillManage.putIfAbsent(ind, calleeNum);
                                if(numSpill < 1){
                                    numSpill = 1;
                                }
                            }
                        }
                       
                        continue;  
                    }
                    
                    // t0..t8
                    for(int j = 0; j < 9; j++){
                        m_reg = "t" + String.valueOf(j);
                        if(!usedReg.contains(m_reg)){ //first reg available
                            break;
                        }
                    }
                }
                
                if(m_reg == null){
                    if(!valToReg.containsKey(m_var)){ // prevent duplicate variable from taking more reg
                        regAlloc.putIfAbsent(ind, "t0");
                    }
                    valToReg.putIfAbsent(m_var, "t0");
                }
                else{
                    if(!valToReg.containsKey(m_var)){
                        regAlloc.putIfAbsent(ind, m_reg);
                    }
                    valToReg.putIfAbsent(m_var, m_reg);
                }
                
                
            }
            
        }
        
        
    }
    private boolean isSaved(StoreObj a){
        boolean cond = false;
        
        if(a.out == null){
            return false;
        }
        
        if(a.out.contains(a.def)){
           cond = true;
        }
        
        return cond;
    }
}