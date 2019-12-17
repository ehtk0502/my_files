import java.io.*;
import java.util.*;
import syntaxtree.Node;

public class SymbolTable{
                   
    public String className;
    
    public String parent;
    
    public SymbolTable parentTable;
    
    public Hashtable<String, SymbolTable> childNodes;
    
    public HashMap<String, String> variables; 
    
    public HashMap<String, String> param;
    
    public Vector varOrder;
    
    public Vector childOrder;
    
    public String methodType;
    
    public String hasExtension;
    
    public String typeToBeSet;
    
    public int setType;
    
    public SymbolTable(String name){
        className = name;
        parent = null;
        parentTable = null;
        childNodes = null;
        variables = null;
        param = null;
        varOrder = null;
        methodType = null;
        hasExtension = null;
        typeToBeSet = null;
        setType = 0;
    }
    
    public boolean addVar(String varName, String varType){
        
        if(param == null){
        }
        else{
            if(param.containsKey(varName)){
                return false;
            }
        }
        
        if(variables == null){
            variables = new HashMap<>();
        }
        
        if(variables.containsKey(varName)){
            return false;
        }
        else{
            variables.put(varName, varType);
            addVarOrder(varName);
            return true;
        }
        
    }
    
    public boolean addParam(String varName, String varType){
        
        if(param == null){
            param = new HashMap<>();
        }
        
        if(param.containsKey(varName)){
            return false;
        }
        else{
            param.put(varName, varType);
            return true;
        }
        
    }
    
    public void addVarOrder(String name){
        if(varOrder == null){
            varOrder = new Vector();
        }
        try{
            varOrder.add(name);
        }
        catch(IllegalStateException  ISE){
            System.out.println("error");
            System.exit(0);
        }    
    }
    
    public void addChildOrder(String name){
        if(childOrder == null){
            childOrder = new Vector();
        }
        try{
            childOrder.add(name);
        }
        catch(IllegalStateException  ISE){
            System.out.println("error");
            System.exit(0);
        }    
    }
    
    public boolean addChild(String method, SymbolTable childTable){
        //System.out.println("to method " + method);
        if(childNodes == null){
            childNodes = new Hashtable<String, SymbolTable>();
        }
        if(childNodes.putIfAbsent(method, childTable) == null){
            addChildOrder(method);
            return true;
        }
        else{
            return false;
        }
        
    }
    
    public void setParent(String name, SymbolTable table){
        parent = name;
        parentTable = table;
    }
    
    public void setExtension(String name){
        hasExtension = name;
    }
    
    public void setMethodType(String type){
        methodType = type;
    }
    
    public void setWhichType(int type){
        setType = type;
    }
    public void setWhichName(String name){
        typeToBeSet = name;
    }
    
    public boolean setTypeSpecial(String type){
        if(setType ==1){
            this.setMethodType(type);
            setType = 0;
            return true;
        }
        else if(setType == 2){
            if(typeToBeSet == null){
                return false;
            }
            if(this.addVar(typeToBeSet, type)){
                typeToBeSet = null;
                setType = 0;
                return true;
            }
            else{
                return false;
            }
        }
        else if(setType == 3){
            if(typeToBeSet == null){
                return false;
            }
            if(this.addParam(typeToBeSet, type)){
                typeToBeSet = null;
                setType = 0;
                return true;
            }
            return false;
        }
        return false;
    }
}