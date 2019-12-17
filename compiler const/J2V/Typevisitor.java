import syntaxtree.*;
import visitor.GJDepthFirst;
import java.util.*;


public class Typevisitor extends GJDepthFirst<String, SymbolTable>{
    
    public Hashtable<String, SymbolTable> Classes;
    public Hashtable<String, Vector> typeOrderVec;
    public Vector paramList;
    
    public int t_counter;
    public int null_counter;
    public int indent_tracker;
    public int if_counter;
    public int while_counter;
    public int andCounter;
    public int boundCounter;
    
    public String m_varType;
    
    public boolean arrfunc;
    
    public void error(){
        System.out.println("error");
        System.exit(0);
    }
    
    public void addIndentation(int num){
        for(int i = 0; i < num; i++){
            System.out.print("\t");
        }
    }
    
    // call it from method //////////////////////////////////////
    public void arrFunction(){
        System.out.println("func AllocArray(size)");
        System.out.println("\tbytes = MulS(size 4)");
        System.out.println("\tbytes = Add(bytes 4) ");
        System.out.println("\tv = HeapAllocZ(bytes)");
        System.out.println("\t[v] = size");
        System.out.println("\tret v");
    }
    
    public void nullError(String var){
        addIndentation(indent_tracker);
        System.out.println("if " + var + " goto :null" + String.valueOf(null_counter));
           
        addIndentation(indent_tracker);
        System.out.println("\tError(\"null pointer" + null_counter + "\")");
            
        addIndentation(indent_tracker);
        System.out.println("null" + String.valueOf(null_counter) + ":");
        null_counter += 1;
    }
    
    public void boundError(String var){
        addIndentation(indent_tracker);
        System.out.println("if " + var + " goto :bounds" + String.valueOf(boundCounter));
            
        addIndentation(indent_tracker);
        System.out.println("\tError(\"array index out of bounds\")");
            
        addIndentation(indent_tracker);
        System.out.println("bounds" + boundCounter + ":");
        boundCounter += 1;    
    }
    
    public int getVarNum(String ClassName){
        int howMany = 0;
        
        SymbolTable tempTable = Classes.get(ClassName);
        
        if(tempTable == null){
            error();
        }
        
        if(tempTable.variables != null){
            howMany += tempTable.variables.size();
        }
        
        if(tempTable.hasExtension != null){
            SymbolTable m_Table = Classes.get(tempTable.hasExtension);
            while(m_Table != null){
                if(m_Table.variables != null){
                    howMany += m_Table.variables.size();
                }   
            
                if(m_Table.hasExtension != null){
                    m_Table = Classes.get(m_Table.hasExtension);
                }
                else{
                    m_Table = null;
                }
                
            }
        } 
        
        return howMany;
    }
    
    public int getVarOrder(String varName, SymbolTable argu){
        int m_order = 0;
        boolean exists = false;
        Vector m_childs;
        Vector m_Vec = new Vector();
        
        SymbolTable tempTable = argu.parentTable;
        if(tempTable == null){
            return -1;
        }
        
        if(tempTable.variables != null){
            if(tempTable.variables.containsKey(varName)){
                m_order += tempTable.varOrder.indexOf(varName);
                exists = true;
            }
        }
        
        if(tempTable.hasExtension != null){
            SymbolTable m_Table = Classes.get(tempTable.hasExtension);
            while(m_Table != null){
                m_childs = m_Table.varOrder;
                if(m_childs != null){
                    int vecSize = m_childs.size();
                    for(int i = (vecSize -1); i > -1; i--){
                        m_Vec.add((String)m_childs.elementAt(i));
                    }
                }
            
                if(m_Table.hasExtension != null){
                    m_Table = Classes.get(m_Table.hasExtension);
                }
                else{
                    m_Table = null;
                }
                
            }
        } 
        
        
        if(exists){
            m_order += m_Vec.size();
        }
        else{
            m_order = m_Vec.indexOf(varName);
        }
        
        return m_order;
    }
    
    public int getMethodOrder(String className, String methodName){
        Vector tempVec = typeOrderVec.get(className);
        if(tempVec == null){
            error();
        }
        
        int tempInt = tempVec.indexOf(methodName);
        
        if(tempInt == -1){
            Set<String> m_tempSet = typeOrderVec.keySet();
            Iterator iter = m_tempSet.iterator();
            while(iter.hasNext()){
                String m_className = (String)iter.next();
                SymbolTable tempT = Classes.get(m_className);
                if(tempT != null){
                    if(tempT.hasExtension != null){
                        if(tempT.hasExtension.equals(className)){
                            tempVec = typeOrderVec.get(tempT.className);
                            if(tempVec != null){
                                tempInt = tempVec.indexOf(methodName);
                                if(tempInt != -1){
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
        
        if(tempInt == -1){
            error();
        }
        
        return tempInt;
    }
    
    
    public String getType(String varName, SymbolTable argu){
        boolean found = false;
        String retType = null;
        SymbolTable tempTable = null;
        
        if(argu.param != null){
            if(argu.param.containsKey(varName)){
                retType = (String)argu.param.get(varName);
                found = true;
            }
        }
        
        if(!found){
            if(argu.variables != null){
                if(argu.variables.containsKey(varName)){
                    retType = (String)argu.variables.get(varName);
                    found = true;
                }
            }
        }
        
        if(!found){
            tempTable = argu.parentTable;
            if(tempTable!= null){
                if(tempTable.variables != null){
                    if(tempTable.variables.containsKey(varName)){
                        retType = (String)tempTable.variables.get(varName);
                        found = true;
                    }
                }
            }
        }
        
        if(!found){
            if(argu.hasExtension != null){
                SymbolTable m_Table = Classes.get(argu.hasExtension);
                while(m_Table != null && !found){
                    if(m_Table.variables != null){
                        if(m_Table.variables.containsKey(varName)){
                            retType = (String)m_Table.variables.get(varName);
                            found = true;
                        }
                    }
                    
                
                    if(m_Table.hasExtension != null){
                        m_Table = Classes.get(m_Table.hasExtension);
                    }
                    else{
                        m_Table = null;
                    }
                }
                
            }
        }
        
        if(!found){
            System.out.println("type not found");
            error();
        }
        
        return retType;
    }
    
    public String validString(String m_string){
        String tempString = m_string;
        if(tempString.regionMatches(0, "call", 0, 4)){
            addIndentation(indent_tracker);
            System.out.println("t." + String.valueOf(t_counter) + " = " + tempString);
            tempString = "t." + String.valueOf(t_counter);
            t_counter += 1;
        }
        
        if(tempString.regionMatches(0, "[th", 0, 3)){
            addIndentation(indent_tracker);
            System.out.println("t." + String.valueOf(t_counter) + " = " + tempString);
            tempString = "t." + String.valueOf(t_counter);
            t_counter += 1;
        }
        
        
        return tempString;
    }
    
    ////////////////////////////////////////////////////////////
    @Override
    public String visit(Goal n ,SymbolTable argu){
        
        if(argu.childNodes == null){
            error();
        }
        
        typeOrderVec = new Hashtable<String, Vector>();
        null_counter = 1;
        if_counter = 1;
        while_counter = 1;
        andCounter = 1;
        boundCounter = 1;
        arrfunc = false;
        
        Classes = argu.childNodes;
        paramList = new Vector();
        
        Set<String> m_tempSet = Classes.keySet();
        Iterator iter = m_tempSet.iterator();
        while(iter.hasNext()){
            String className = (String)iter.next();
            if(!className.equals("Main")){
                System.out.println("const vmt_" + className);
                SymbolTable tempTable = Classes.get(className);
                Vector m_childs;
                Vector m_Vec = new Vector();
                Vector m_ParenVec = new Vector();
                
                if(tempTable.hasExtension != null){
                    SymbolTable m_Table = Classes.get(tempTable.hasExtension);
                    while(m_Table != null){
                        m_childs = m_Table.childOrder;
                        if(m_childs != null){
                            int vecSize = m_childs.size();
                            for(int i = (vecSize -1); i > -1; i--){
                                String m_str = (String)m_childs.elementAt(i);
                                int m_index = m_Vec.indexOf(m_str);
                                if(m_index != -1){
                                    m_Vec.removeElementAt(m_index);
                                    m_ParenVec.removeElementAt(m_index);
                                }
                                
                                m_Vec.add(m_str);
                                m_ParenVec.add(m_Table.className);
                                
                            }
                        }
                        
                        if(m_Table.hasExtension != null){
                            m_Table = Classes.get(m_Table.hasExtension);
                        }
                        else{
                            m_Table = null;
                        }
                    }
                }
                
                m_childs = tempTable.childOrder;
                Vector tempVec = new Vector();
                if(m_childs != null){
                    int vecSize = m_childs.size();
                    if(!m_Vec.isEmpty()){
                        for(int i = 0; i < vecSize; i++){
                            String m_str = (String)m_childs.elementAt(i);
                            int m_index = m_Vec.indexOf(m_str);
                            if(m_index != -1){
                                m_Vec.set(m_index, m_str);
                                m_ParenVec.set(m_index, className);
                            }
                            else{
                                m_Vec.insertElementAt(m_str, 0);
                                m_ParenVec.insertElementAt(className, 0);
                            }
                        }
                        int tempSize = m_Vec.size();
                        for(int i = tempSize-1; i > -1; i--){
                            String temp1 = (String)m_Vec.elementAt(i);
                            String temp2 = (String)m_ParenVec.elementAt(i);
                            tempVec.add(temp1);
                            
                            System.out.println("\t:"+ temp2 +"."+ temp1);
                        }
                        
                        typeOrderVec.put(className, tempVec);
                    }
                    else{
                        for(int i = 0; i < vecSize; i++){
                            System.out.println("\t:"+ className +"."+ (String)m_childs.elementAt(i));
                        }
                        typeOrderVec.put(className, m_childs);
                    }
                }
              
                System.out.print("\n");
            }
        }
        
        n.f0.accept(this, argu);
        
        for(Node node : n.f1.nodes) {
            node.accept(this, argu);
        }
        
        if(arrfunc){
            arrFunction();
        }
        
        return null;
    }
    
    @Override
    public String visit(MainClass n , SymbolTable argu){
        String firstLevel = n.f1.f0.toString();
        SymbolTable m_table = argu.childNodes.get(firstLevel);
        
        t_counter = 0;
        indent_tracker = 1;
        
        System.out.println("func Main()");
        
        for(Node node : n.f15.nodes){
            node.accept(this, m_table);
        }
    
        
        System.out.println("\tret\n");
        indent_tracker = 0;
        return null;
    }
    
    @Override
    public String visit(TypeDeclaration n ,SymbolTable argu){
        
        n.f0.accept(this, argu);
        
        return null;
    }
    
    @Override
    public String visit(ClassDeclaration n ,SymbolTable argu){
        String firstLevel = n.f1.f0.toString();
        SymbolTable m_table = argu.childNodes.get(firstLevel);
        
        indent_tracker = 1;
        
        for(Node node : n.f4.nodes) {
            node.accept(this, m_table);
        }
        
        indent_tracker = 0;
        return null;
    }
    
    @Override
    public String visit(ClassExtendsDeclaration n ,SymbolTable argu){
        String firstLevel = n.f1.f0.toString();
        SymbolTable m_table = argu.childNodes.get(firstLevel);
        
        indent_tracker = 1;
        
        for(Node node : n.f6.nodes) {
            node.accept(this, m_table);
        }
        
        indent_tracker = 0;
        return null;
    }
    
    @Override
    public String visit(MethodDeclaration n ,SymbolTable argu){
        String SecondLevel = n.f2.f0.toString();
        SymbolTable m_table = argu.childNodes.get(SecondLevel);
        t_counter = 0;
        
        System.out.print("func " + (String)argu.className + "." + SecondLevel +"(this");
        
        n.f4.accept(this, m_table);
        
        System.out.println(")");
        
        for(Node node : n.f8.nodes) {
            node.accept(this, m_table);
        }
        
        
        String retExp = (String)n.f10.accept(this, m_table);
        retExp = validString(retExp);
        
        addIndentation(indent_tracker);
        System.out.println("ret " + retExp + "\n");
        
        return null;
    }
    ///////////////////// added for param ////////////////////////////////////////
    @Override
    public String visit(FormalParameterList n , SymbolTable argu){
        n.f0.accept(this, argu);
        
        for(Node node : n.f1.nodes) {
            node.accept(this, argu);
        }
        
        return null;
    }
    
    @Override
    public String visit(FormalParameter n , SymbolTable argu){
        String param = n.f1.f0.toString();
        
        System.out.print(" " + param);
        
        return null;
    }
    
    @Override
    public String visit(FormalParameterRest n , SymbolTable argu){
        n.f1.accept(this, argu);
        
        return null;
    }
    /////////////////////////////////////////////////////////////////////////////
    
    
    @Override
    public String visit(Statement n ,SymbolTable argu){
        
        n.f0.accept(this, argu);
        
        return null;
    }
    
    @Override
    public String visit(Block n , SymbolTable argu){
        
        for(Node node : n.f1.nodes) {
            node.accept(this, argu);
        }
        
        return null;
    }

////start working from here.
    @Override
    public String visit(AssignmentStatement n , SymbolTable argu){
        
        String ret1 = n.f0.accept(this, argu);

        String ret2 = n.f2.accept(this, argu);
        
        if(ret1.regionMatches(0, "[th", 0, 3)){
            if(ret2.regionMatches(0, "call", 0, 4)){
                ret2 = validString(ret2);
            }
        }
        
        addIndentation(indent_tracker);
        System.out.println(ret1 + " = " + ret2);
        
        
        return null;
    }
    
    @Override
    public String visit(ArrayAssignmentStatement n , SymbolTable argu){
        String ret1 = n.f0.accept(this, argu);
        ret1 = validString(ret1);
        nullError(ret1);
        
        String ret2 = n.f2.accept(this, argu);
        ret2 = validString(ret2);
        
        String ret3 = n.f5.accept(this, argu);
        ret3 = validString(ret3);
        
        
        addIndentation(indent_tracker);
        System.out.println("t."+ String.valueOf(t_counter) + " = [" + ret1 + "]");
        
        addIndentation(indent_tracker);
        System.out.println("t."+ String.valueOf(t_counter) + " = Lt(" + ret2 + " " + "t."+ String.valueOf(t_counter) + ")");        
        boundError("t."+ String.valueOf(t_counter));
        
        addIndentation(indent_tracker);
        System.out.println("t."+ String.valueOf(t_counter) + " = MulS(" + ret2 + " 4)");
        
        addIndentation(indent_tracker);
        System.out.println("t."+ String.valueOf(t_counter) + " = Add(t." + String.valueOf(t_counter) + " " + ret1 + ")");
        t_counter += 1;
        
        addIndentation(indent_tracker);
        System.out.println("[t." + String.valueOf(t_counter-1) + "+4] = "  + ret3);
   
        
        return null;
    }
    
    @Override
    public String visit(IfStatement n , SymbolTable argu){
        int currentNode = if_counter;
        if_counter += 1;
        
        
        String ret1 = n.f2.accept(this, argu);
        ret1 = validString(ret1);
        
        addIndentation(indent_tracker);
        System.out.println("if0 " + ret1 + " goto :if" + String.valueOf(currentNode) +"_else");
        indent_tracker += 1;
        
        n.f4.accept(this, argu);
        addIndentation(indent_tracker);
        System.out.println("goto :if"+ String.valueOf(currentNode) +"_end");
        
        indent_tracker -= 1;
        addIndentation(indent_tracker);
        System.out.println("if" + String.valueOf(currentNode) +"_else:");
        
        indent_tracker += 1;
        String ret3 = n.f6.accept(this, argu);
        indent_tracker -= 1;
        
        addIndentation(indent_tracker);
        System.out.println("if"+ String.valueOf(currentNode) +"_end:");
        
        return null;
    }
    
    @Override
    public String visit(WhileStatement n , SymbolTable argu){
        int currentNode = while_counter;
        while_counter += 1;
        
        addIndentation(indent_tracker);
        System.out.println("while" + String.valueOf(currentNode) + "_top:");
        
        String ret1 = n.f2.accept(this, argu);
        ret1 = validString(ret1);
        
        addIndentation(indent_tracker);
        System.out.println("if0 " + ret1 + " goto :while" + String.valueOf(currentNode) + "_end");
        
        indent_tracker += 1;
        n.f4.accept(this, argu);
        addIndentation(indent_tracker);
        System.out.println("goto :while" + String.valueOf(currentNode) + "_top");
        indent_tracker -= 1;
        
        addIndentation(indent_tracker);
        System.out.println("while" + String.valueOf(currentNode) + "_end:");
        
        
        return null;
    }
    
    @Override
    public String visit(PrintStatement n , SymbolTable argu){
        
        String ret1 = n.f2.accept(this, argu);
        ret1 = validString(ret1);
        
        addIndentation(indent_tracker);
        System.out.println("PrintIntS(" + ret1 + ")");
        
        return null;
    }
    
    @Override
    public String visit(Expression n , SymbolTable argu){
      
       return n.f0.accept(this, argu);
    }
    
    @Override
    public String visit(AndExpression n , SymbolTable argu){
        int m_counter = andCounter;
        andCounter += 1;
        
        String ret1 = n.f0.accept(this, argu);
        ret1 = validString(ret1);
        
        addIndentation(indent_tracker);
        System.out.println("if0 " + ret1 +  " goto :ss" + String.valueOf(m_counter) + "_else");
        
        indent_tracker += 1;
        String ret2 = n.f2.accept(this, argu);
        ret2 = validString(ret2);
        
        addIndentation(indent_tracker);
        System.out.println("goto :ss" + String.valueOf(m_counter) + "_end");
        indent_tracker -= 1;
        
        addIndentation(indent_tracker);
        System.out.println("ss" + String.valueOf(m_counter) + "_else:");
        addIndentation(indent_tracker);
        System.out.println("\t" + ret2 + " = 0");
        
        addIndentation(indent_tracker);
        System.out.println("ss" + String.valueOf(m_counter) + "_end:");
      
        return ret2;
    }
    
    @Override
    public String visit(CompareExpression n , SymbolTable argu){
        
        String ret1 = n.f0.accept(this, argu);
        ret1 = validString(ret1);
        
        String ret2 = n.f2.accept(this, argu);
        ret2 = validString(ret2);
        
        addIndentation(indent_tracker);
        System.out.println("t."+ String.valueOf(t_counter) + " = " + "LtS(" + ret1 + " " + ret2 + ")");
        t_counter += 1;
        
        return "t." + String.valueOf(t_counter-1);
    }
    
    @Override
    public String visit(PlusExpression n , SymbolTable argu){
        
        String ret1 = n.f0.accept(this, argu);
        ret1 = validString(ret1);
        
        String ret2 = n.f2.accept(this, argu);
        ret2 = validString(ret2);
        
        addIndentation(indent_tracker);
        System.out.println("t."+ String.valueOf(t_counter) + " = " + "Add(" + ret1 + " " + ret2 + ")");
        t_counter += 1;
        
        return "t." + String.valueOf(t_counter-1);
    }
    
    @Override
    public String visit(MinusExpression n , SymbolTable argu){
        
        String ret1 = n.f0.accept(this, argu);
        ret1 = validString(ret1);
        
        String ret2 = n.f2.accept(this, argu);
        ret2 = validString(ret2);
        
        addIndentation(indent_tracker);
        System.out.println("t."+ String.valueOf(t_counter) + " = " + "Sub(" + ret1 + " " + ret2 + ")");
        t_counter += 1;
        
        return "t." + String.valueOf(t_counter-1);
    }
    
    @Override
    public String visit(TimesExpression n , SymbolTable argu){
        
        String ret1 = n.f0.accept(this, argu);
        ret1 = validString(ret1);
        
        String ret2 = n.f2.accept(this, argu);
        ret2 = validString(ret2);
        
        addIndentation(indent_tracker);
        System.out.println("t."+ String.valueOf(t_counter) + " = " + "MulS(" + ret1 + " " + ret2 + ")");
        t_counter += 1;
        
        return "t." + String.valueOf(t_counter-1);
    }
    
    @Override
    public String visit(ArrayLookup n , SymbolTable argu){
        
        String ret1 = n.f0.accept(this, argu);
        ret1 = validString(ret1);
        
        String ret2 = n.f2.accept(this, argu);
        ret2 = validString(ret2);
        
        nullError(ret1);
        
        addIndentation(indent_tracker);
        System.out.println("t."+ String.valueOf(t_counter) + " = [" + ret1 + "]");
        
        addIndentation(indent_tracker);
        System.out.println("t."+ String.valueOf(t_counter) + " = Lt(" + ret2 + " " + "t."+ String.valueOf(t_counter) + ")");        
        boundError("t."+ String.valueOf(t_counter));
        
        addIndentation(indent_tracker);
        System.out.println("t."+ String.valueOf(t_counter) + " = MulS(" + ret2 + " 4)");
        
        addIndentation(indent_tracker);
        System.out.println("t."+ String.valueOf(t_counter) + " = Add(t." + String.valueOf(t_counter) + " " + ret1 + ")");
        t_counter += 1;
        
        addIndentation(indent_tracker);
        System.out.println("t."+ String.valueOf(t_counter) + " = [t." + String.valueOf(t_counter-1) + "+4]");
        t_counter += 1;
        
        return "t." + String.valueOf(t_counter-1);
    }
    
    @Override
    public String visit(ArrayLength n , SymbolTable argu){
        String ret1 = n.f0.accept(this, argu);
        ret1 = validString(ret1);
        
        addIndentation(indent_tracker);
        System.out.println("t."+ String.valueOf(t_counter) + " = [" + ret1 + " + 0]");
        t_counter += 1;

        return "t." + String.valueOf(t_counter-1);
    }
    
    @Override
    public String visit(MessageSend n, SymbolTable argu){
        
        String ret1 = n.f0.accept(this, argu);
        ret1 = validString(ret1);
           
        int type = n.f0.f0.which;
        
        //if not this
        if(type != 4){
            nullError(ret1);
        }
        
        addIndentation(indent_tracker);
        System.out.println("t."+ String.valueOf(t_counter) + " = [" + ret1 + "]");
        
        
        
        String ret2 = n.f2.accept(this, argu);
        
        int methodNum;
        if(type == 4){
            String tempType = (String)argu.parent;
            methodNum = getMethodOrder(tempType, ret2);
        }
        else{
            methodNum = getMethodOrder(m_varType, ret2);
        }
        
        methodNum *= 4;
        
        addIndentation(indent_tracker);
        System.out.println("t."+ String.valueOf(t_counter) + " = [t." + String.valueOf(t_counter) + "+" + String.valueOf(methodNum) + "]");
        String callVar = "t." + String.valueOf(t_counter);
        t_counter += 1;
        
        if(n.f4 != null){
            n.f4.accept(this, argu);
        }
        
        String retString = "call " + callVar + "(" + ret1;
        
        int m_vecSize = paramList.size();
        for(int i = 0; i < m_vecSize; i++){
            String tempStr = (String)paramList.elementAt(i);
            retString += " " + tempStr;
        }
        paramList.clear();
        retString += ")";
        
        return retString;
    }
    
    @Override
    public String visit(ExpressionList n , SymbolTable argu){
        String ret1 = (String)n.f0.accept(this, argu);
        ret1 = validString(ret1);
        
        if(ret1 != null){
            paramList.add(ret1);
        }
        
        for(Node node : n.f1.nodes) {
            node.accept(this, argu);
        }
        
        return null;
    }
    
    @Override
    public String visit(ExpressionRest n , SymbolTable argu){
        
        String ret1 = n.f1.accept(this, argu);
        ret1 = validString(ret1);
        
        if(ret1 != null){
            paramList.add(ret1);
        }
        
        return null;
    }
    
    @Override
    public String visit(PrimaryExpression n , SymbolTable argu){
        
        return n.f0.accept(this, argu);
    }
    
    @Override
    public String visit(IntegerLiteral n , SymbolTable argu){
        String intVal = n.f0.tokenImage;
        
        return intVal;
    }
    
    @Override
    public String visit(TrueLiteral n , SymbolTable argu){
        
        return "1";
    }
    
    @Override
    public String visit(FalseLiteral n , SymbolTable argu){
        
        return "0";
    }
    
    @Override
    public String visit(Identifier n , SymbolTable argu){
        int m_valOrder = -1;
        String iden = n.f0.tokenImage;
        boolean found = false;
        
        m_valOrder = getVarOrder(iden, argu);
        
        if(m_valOrder != -1){
            m_valOrder = (m_valOrder+1)*4;
            m_varType = getType(iden, argu);
            
            return "[this+" + String.valueOf(m_valOrder) + "]";
        }
        
        if(argu.variables != null){
            if(argu.variables.containsKey(iden)){
                m_varType = argu.variables.get(iden);
                found = true;
            }
        }
        
        if(argu.param != null && !found){
            if(argu.param.containsKey(iden)){
                m_varType = argu.param.get(iden);
            }
        }
        
        return iden;
    }
    
    @Override
    public String visit(ThisExpression n , SymbolTable argu){
        
        return "this";
    }
    
    @Override
    public String visit(ArrayAllocationExpression n , SymbolTable argu){
        String ret1 = n.f3.accept(this, argu);
        ret1 = validString(ret1);
        
        addIndentation(indent_tracker);
        System.out.println("t."+ String.valueOf(t_counter) + " = call :AllocArray(" + ret1 +")");
        t_counter += 1;
        
        
        arrfunc = true;
        return "t." + String.valueOf(t_counter -1);
    }
    
    @Override
    public String visit(AllocationExpression n , SymbolTable argu){
        String ret1 = (String)n.f1.accept(this, argu);
        int varNum = getVarNum(ret1) +1;
        varNum *= 4;
        m_varType = ret1;
        
        addIndentation(indent_tracker);
        System.out.println("t."+ String.valueOf(t_counter) + " = HeapAllocZ(" + String.valueOf(varNum) + ")");
        
        
        addIndentation(indent_tracker);
        System.out.println("[t."+ String.valueOf(t_counter) + "] = :vmt_" + ret1);
        
        t_counter += 1;
        
        return "t." + String.valueOf(t_counter -1);
    }
    
    @Override
    public String visit(NotExpression n , SymbolTable argu){
        String ret1 = n.f1.accept(this, argu);
        ret1 = validString(ret1);
        
        addIndentation(indent_tracker);
        System.out.println("t."+ String.valueOf(t_counter) + " = Sub(1 " + ret1 + ")");
        t_counter += 1;
        
        return "t." + String.valueOf(t_counter -1);
    }
    
    @Override
    public String visit(BracketExpression n , SymbolTable argu){
        return n.f1.accept(this, argu);
    }
}
