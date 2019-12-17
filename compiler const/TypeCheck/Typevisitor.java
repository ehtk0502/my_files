import syntaxtree.*;
import visitor.GJDepthFirst;
import java.util.*;


public class Typevisitor extends GJDepthFirst<String, Hashtable<String, SymbolTable>>{
    public String firstLevel;
    public String SecondLevel;
    public String classExp;
    public String funcExp;
    
    public void error(){
        System.out.println("Type error");
        System.exit(0);
    }
    
    public String superClass(String m_var, Hashtable<String, SymbolTable> argu){
        String ext = argu.get(firstLevel).hasExtension;
        SymbolTable temp = null;
        String returnTYpe = null;
        
        if(ext == null){
            return null;
        }
        
        if(argu.containsKey(ext)){
            temp = argu.get(ext);
            if(temp.variables == null){
                return null;
            }
            else{
                if(temp.variables.containsKey(m_var)){
                    returnTYpe = temp.variables.get(m_var);
                }
                else{
                    return null;
                }
            }
        }
        else{
            return null;
        }
        return returnTYpe;
    }
    
    public String ChangeExp(String ret1, Hashtable<String, SymbolTable> argu){
        String retType = ret1;
        boolean proceed = true;
        
        //System.out.println("ChangeExp");
        
        if(retType.equals("0") || retType.equals("1") || retType.equals("2") || argu.containsKey(retType)){
        }
        else{
            SymbolTable first = argu.get(firstLevel);
            SymbolTable child = null;
            //System.out.println("1");
            
            if(first.childNodes != null){
                child = first.childNodes.get(SecondLevel);
            }
            //System.out.println("2");
            
            if(first.variables != null){
                if(first.variables.containsKey(retType)){
                    retType = first.variables.get(retType);
                    proceed = false;
                }
                //System.out.println("3");
            }
            
            if(child == null){
                return retType;
            }
            
            if(proceed){
                if(child.variables == null){
                }
                else{
                    if(child.variables.containsKey(retType)){
                        retType = child.variables.get(retType);
                        proceed = false;
                    }
                }
                //System.out.println("4");
            }
            if(proceed){
                if(child.param == null){
                }
                else{
                    if(child.param.containsKey(retType)){
                        retType = child.param.get(retType);
                    }
                }
                //System.out.println("5");
            }
        }
        
        return retType;
    }
    
    public boolean typeCheck(String isThere, String ExpType, Hashtable<String, SymbolTable> argu){
        if(isThere == null || ExpType == null){
            return false;
        }
        
        //System.out.println("type check: " + isThere + " and " + ExpType);    
        
        SymbolTable tempTable = argu.get(firstLevel);
        SymbolTable funcTable = null;
        String tempStr = ExpType;
        if(tempStr.equals("this")){
            tempStr = firstLevel;
        }
        
        if(SecondLevel != null){
            funcTable = tempTable.childNodes.get(SecondLevel);
            //System.out.println("a");  
            if(funcTable.variables != null){
                //System.out.println("b");  
                if(funcTable.variables.containsKey(isThere)){
                    String typeComp = (String)funcTable.variables.get(isThere);
                    if(typeComp.equals(tempStr)){
                        return true;
                    }
                }
            }
            if(funcTable.param != null){
                //System.out.println("c");  
                if(funcTable.param.containsKey(isThere)){ 
                    String typeComp = (String)funcTable.param.get(isThere);
                    if(typeComp.equals(tempStr)){
                        return true;
                    }
                }
            }
        }
        
        if(tempTable.variables != null){
            //System.out.println("d");  
            if(tempTable.variables.containsKey(isThere)){
                String typeComp = (String)tempTable.variables.get(isThere);
                if(typeComp.equals(tempStr)){
                    return true;
                }
            }
        }
        
        if(tempTable.hasExtension != null){
            if(argu.containsKey(tempTable.hasExtension)){
                SymbolTable extTemp = argu.get(tempTable.hasExtension);
                if(extTemp.variables != null){
                    if(extTemp.variables.containsKey(isThere)){
                        String extType = extTemp.variables.get(isThere);
                        if(extType.equals(tempStr)){
                            return true;
                        }
                    }
                }
            }
        }
        
        return false;
    }
    
    @Override
    public String visit(Goal n ,Hashtable<String, SymbolTable> argu){
        firstLevel = null;
        SecondLevel = null;
        classExp = null;
        funcExp = null;
        SymbolTable temp = argu.get("BT");
        
        n.f0.accept(this, argu);
        
        for(Node node : n.f1.nodes) {
            node.accept(this, argu);
        }
        
        return null;
    }
    
    @Override
    public String visit(MainClass n , Hashtable<String, SymbolTable> argu){
        firstLevel = n.f1.f0.toString();
        //System.out.println("main " + firstLevel);
        
        for(Node node : n.f15.nodes) {
            node.accept(this, argu);
        }
        
        firstLevel = null;
        return null;
    }
    
    @Override
    public String visit(TypeDeclaration n ,Hashtable<String, SymbolTable> argu){
        
        n.f0.accept(this, argu);
        
        return null;
    }
    
    @Override
    public String visit(ClassDeclaration n ,Hashtable<String, SymbolTable> argu){
        firstLevel = n.f1.f0.toString();
        
        //System.out.println("CD " + firstLevel);
        
        for(Node node : n.f4.nodes) {
            node.accept(this, argu);
        }
        
        firstLevel = null;
        return null;
    }
    
    @Override
    public String visit(ClassExtendsDeclaration n ,Hashtable<String, SymbolTable> argu){
        firstLevel = n.f1.f0.toString();
        //System.out.println("CED " + firstLevel);
        
        //no overloading imp.
        String ext = n.f3.f0.toString();
        if(argu.containsKey(ext)){
            SymbolTable extTable = argu.get(ext);
            SymbolTable m_Table = argu.get(firstLevel);
            
            Set<String> tempSet = m_Table.childNodes.keySet();
            Iterator iter = tempSet.iterator();
            while(iter.hasNext()){
                String methodName = (String)iter.next();
                if(extTable.childNodes.containsKey(methodName)){
                    String extType = (String)extTable.childNodes.get(methodName).methodType;
                    String m_type = (String)m_Table.childNodes.get(methodName).methodType;
                    if(!extType.equals(m_type)){
                        //System.out.println("overloading err");
                        error();
                    }
                }
            }
        }
        ////////
        
        for(Node node : n.f6.nodes) {
            node.accept(this, argu);
        }
        
        firstLevel = null;
        return null;
    }
    
    @Override
    public String visit(MethodDeclaration n ,Hashtable<String, SymbolTable> argu){
        SecondLevel = n.f2.f0.toString();
        //System.out.println("MD " + SecondLevel);
        
        for(Node node : n.f8.nodes) {
            node.accept(this, argu);
        }
        
        SymbolTable test = argu.get(firstLevel).childNodes.get(SecondLevel);
        //System.out.println(test.methodType);
        
        String retType = (String)n.f10.accept(this, argu);
        String metType = (String)argu.get(firstLevel).childNodes.get(SecondLevel).methodType;
        //System.out.println("ret Type: " + retType);
        boolean proceed = true;
        
        if(retType == null || metType == null){
            //System.out.println("null");
            error();
        }
        
        retType = ChangeExp(retType, argu);
        
        if(!metType.equals(retType)){
            //System.out.println("MD type not equal");
            error();
        }
        
        SecondLevel = null;
        
        return null;
    }
    ///////////////
    @Override
    public String visit(Statement n ,Hashtable<String, SymbolTable> argu){
        //System.out.println("statement and  class:" + firstLevel);
        
        if(SecondLevel != null){
            //System.out.println("statement and method:" + SecondLevel);
        }
        
        n.f0.accept(this, argu);
        
        return null;
    }
    
    @Override
    public String visit(Block n , Hashtable<String, SymbolTable> argu){
        //System.out.println("blockLevel" + firstLevel);
        
        if(SecondLevel != null){
            //System.out.println("and " + SecondLevel);
        }
        
        for(Node node : n.f1.nodes) {
            node.accept(this, argu);
        }
        
        return null;
    }
    
    @Override
    public String visit(AssignmentStatement n , Hashtable<String, SymbolTable> argu){
        //System.out.println("Assign");
        
        String ret1 = n.f0.accept(this, argu);
        String ret2 = n.f2.accept(this, argu);
        ret2 = ChangeExp(ret2, argu);
        
        //System.out.println("Trying to assign these two:");
        
        //System.out.println(ret1);
        //System.out.println(ret2);
        
        if(typeCheck(ret1, ret2, argu)){           
        }
        else{
            //System.out.println("Assign err");
            error();
        }
        
        return null;
    }
    
    @Override
    public String visit(ArrayAssignmentStatement n , Hashtable<String, SymbolTable> argu){
        //System.out.println("arr assign stage");
        
        String ret1 = n.f0.accept(this, argu);
        if(typeCheck(ret1, "0", argu)){           
        }
        else{
            //System.out.println("arr Assign1");
            error();
        }
        
        String ret2 = n.f2.accept(this, argu);
        ret2 = ChangeExp(ret2, argu);
        
        if(ret2.equals("2")){
        }
        else{
            //System.out.println("arr Assign2");
            error();
        }
        
        String ret3 = n.f5.accept(this, argu);
        ret3 = ChangeExp(ret2, argu);
        if(ret3.equals("2")){
        }
        else{
            //System.out.println("arr Assign3");
            error();
        }
        
        return null;
    }
    
    @Override
    public String visit(IfStatement n , Hashtable<String, SymbolTable> argu){
        String ret1 = n.f2.accept(this, argu);
        ret1 = ChangeExp(ret1, argu);
        
        if(ret1.equals("1")){}
        else{
            //System.out.println("while fail");
            error();
        }
        
        n.f4.accept(this, argu);
        n.f6.accept(this, argu);
        
        return null;
    }
    
    @Override
    public String visit(WhileStatement n , Hashtable<String, SymbolTable> argu){
        //System.out.println("while statement");
        String ret1 = n.f2.accept(this, argu);
        ret1 = ChangeExp(ret1, argu);
        
        //.out.println(ret1);
        
        if(ret1.equals("1")){}
        else{
            //System.out.println("while fail");
            error();
        }
        
        n.f4.accept(this, argu);
        
        return null;
    }
    
    @Override
    public String visit(PrintStatement n , Hashtable<String, SymbolTable> argu){
        //System.out.println("print statement");
        String ret1 = n.f2.accept(this, argu);
        ret1 = ChangeExp(ret1, argu);
        
        if(ret1.equals("2")){}
        else{
            //System.out.println("print fail");
            error();
        }
        
        return null;
    }
    
    ////////////////////////////////work on expression first////////////////////////
    @Override
    public String visit(Expression n , Hashtable<String, SymbolTable> argu){
       //System.out.println("exp");
       return n.f0.accept(this, argu);
    }
    
    @Override
    public String visit(AndExpression n , Hashtable<String, SymbolTable> argu){
        //System.out.println("andexp fail1");
        
        String ret1 = n.f0.accept(this, argu);
        ret1 = ChangeExp(ret1, argu);
        
        String ret2 = n.f2.accept(this, argu);
        ret2 = ChangeExp(ret2, argu);
        
        //System.out.println("ret1: " + ret1);
        //System.out.println("ret2: " + ret2);
        
        if(ret1.equals("1")){    
        }
        else if(typeCheck(ret1, "1", argu)){
        }
        else{
            //System.out.println("andExp1 fail1");
            error();
        }
        
        if(ret2.equals("1")){    
        }
        else if(typeCheck(ret2, "1", argu)){
        }
        else{
            //System.out.println("andExp1 fail1");
            error();
        }
        
        
        return "1";
    }
    
    @Override
    public String visit(CompareExpression n , Hashtable<String, SymbolTable> argu){
        //System.out.println("compexp fail1");
        String ret1 = n.f0.accept(this, argu);
        String ret2 = n.f2.accept(this, argu);
        
        if(ret1.equals("2")){    
        }
        else if(typeCheck(ret1, "2", argu)){
        }
        else{
            //System.out.println("compExp1 fail1");
            error();
        }
        
        if(ret2.equals("2")){    
        }
        else if(typeCheck(ret2, "2", argu)){
        }
        else{
            //System.out.println("compExp1 fail1");
            error();
        }
        
        
        return "1";
    }
    
    @Override
    public String visit(PlusExpression n , Hashtable<String, SymbolTable> argu){
        //System.out.println("plusexp fail1");
        String ret1 = n.f0.accept(this, argu);
        String ret2 = n.f2.accept(this, argu);
        
        if(ret1.equals("2")){    
        }
        else if(typeCheck(ret1, "2", argu)){
        }
        else{
            //System.out.println("plusExp1 fail1");
            error();
        }
        
        if(ret2.equals("2")){    
        }
        else if(typeCheck(ret2, "2", argu)){
        }
        else{
            //System.out.println("plusExp1 fail1");
            error();
        }
        
        return "2";
    }
    
    @Override
    public String visit(MinusExpression n , Hashtable<String, SymbolTable> argu){
        //System.out.println("minusexp fail1");
        String ret1 = n.f0.accept(this, argu);
        String ret2 = n.f2.accept(this, argu);
        
        if(ret1.equals("2")){    
        }
        else if(typeCheck(ret1, "2", argu)){
        }
        else{
            //System.out.println("minusExp1 fail1");
            error();
        }
        
        if(ret2.equals("2")){    
        }
        else if(typeCheck(ret2, "2", argu)){
        }
        else{
            //System.out.println("minusExp1 fail1");
            error();
        }
        
        return "2";
    }
    
    @Override
    public String visit(TimesExpression n , Hashtable<String, SymbolTable> argu){
        //System.out.println("timexp");
        String ret1 = n.f0.accept(this, argu);
        String ret2 = n.f2.accept(this, argu);
        
        if(ret1.equals("2")){    
        }
        else if(typeCheck(ret1, "2", argu)){
        }
        else{
            //System.out.println("minusExp1 fail1");
            error();
        }
        
        if(ret2.equals("2")){    
        }
        else if(typeCheck(ret2, "2", argu)){
        }
        else{
            //System.out.println("minusExp1 fail1");
            error();
        }
        
        return "2";
    }
    
    @Override
    public String visit(ArrayLookup n , Hashtable<String, SymbolTable> argu){
        //System.out.println("arrlook");
        if(!String.valueOf(n.f0.f0.which).equals("3")){
            //System.out.println("arrayLk fail");
            error();
        }
        
        String ret1 = n.f0.accept(this, argu);
        String ret2 = n.f2.accept(this, argu);
        
        if(typeCheck(ret1, "0", argu)){
        }
        else{
            //System.out.println("ArrayLookup1 fail1");
            error();
        }
        
        if(ret2.equals("2")){    
        }
        else if(typeCheck(ret2, "2", argu)){
        }
        else{
            //System.out.println("minusExp1 fail1");
            error();
        }
        
        return "2";
    }
    
    @Override
    public String visit(ArrayLength n , Hashtable<String, SymbolTable> argu){
        //System.out.println("arrlen");
        if(!String.valueOf(n.f0.f0.which).equals("3")){
            //ystem.out.println("arrayLen fail");
            error();
        }
        
        String ret1 = n.f0.accept(this, argu);
        
        if(typeCheck(ret1, "0", argu)){
        }
        else{
            //System.out.println("arrayLen type check fail");
            error();
        }

        return "2";
    }
    
    @Override
    public String visit(MessageSend n , Hashtable<String, SymbolTable> argu){
        //System.out.println("mess");
        String ret1 = n.f0.accept(this, argu);
        SymbolTable temp = null;
        
        if(!argu.containsKey(firstLevel)){
            error();
        }
        
        if(ret1.equals("this")){
            temp = argu.get(firstLevel);
        }
        else if(argu.containsKey(ret1)){
            temp = argu.get(ret1);
        }
        else{
            
            SymbolTable temp1 = argu.get(firstLevel);
            boolean stopFlag = true;
            
            if(SecondLevel != null){
                if(temp1.childNodes.get(SecondLevel).variables != null){
                    if(temp1.childNodes.get(SecondLevel).variables.containsKey(ret1)){
                        String classType = temp1.childNodes.get(SecondLevel).variables.get(ret1);
                        temp = argu.get(classType);
                        stopFlag = false;
                    }
                }
                if(stopFlag && (temp1.childNodes.get(SecondLevel).param != null)){
                    if(temp1.childNodes.get(SecondLevel).param.containsKey(ret1)){
                        String classType = temp1.childNodes.get(SecondLevel).param.get(ret1);
                        temp = argu.get(classType);
                        stopFlag = false;
                    }
                }
            }
            if(stopFlag){
                if(temp1.variables == null){
                    //System.out.println("err 1");
                    //error();
                }
                else{
                    if(temp1.variables.containsKey(ret1)){
                        String m_str = (String)temp1.variables.get(ret1);
                        temp = argu.get(m_str);
                        stopFlag = false;
                    }
                    else{
                        //System.out.println("err 2");
                        //error();
                    }
                }
            }
            if(stopFlag){
                String m_super = superClass(ret1, argu);
                if(m_super == null){
                    error();
                }
                else{
                    temp = argu.get(m_super);
                }
            }
        }
        
        //System.out.println("1");
        
        if(temp == null){
            error();
        } 
        
        String ret2 = n.f2.accept(this, argu);
        
        if(temp.childNodes == null){
            error();
        } 
        
        SymbolTable funcTable;
        if(!temp.childNodes.containsKey(ret2)){
            //System.out.println("MessageSend fail 2");
            error();
        }
        
        funcTable = temp.childNodes.get(ret2);
        String retType = funcTable.methodType;
        
        if(n.f4 == null){
            if(funcTable.param == null){
            }
            else if(funcTable.param.isEmpty()){
            }
            else{
                //System.out.println("MessageSend fail 3");
                error();
            }
        }
        else{
            classExp = temp.className;
            funcExp = ret2;
            n.f4.accept(this, argu);
        }
        
        classExp = null;
        funcExp = null;
        
        return retType;
        
    }
    
    @Override
    public String visit(ExpressionList n , Hashtable<String, SymbolTable> argu){
        //System.out.println("mess1");
        
        SymbolTable funcTable = argu.get(classExp).childNodes.get(funcExp);
        if(funcTable.paramOrder == null){
            error();
        }
        Vector tempVec = funcTable.paramOrder;
        String ret1 = (String)n.f0.accept(this, argu);
        
        int i = 1;
        int sizeVec = tempVec.size();
        
        ret1 = ChangeExp(ret1, argu);
        if(ret1.equals("this")){
            ret1 = firstLevel;
        }
        
        //System.out.println(ret1);
        
        String toComp = (String)tempVec.get(0);
        //System.out.println((String)tempVec.get(0));
        
        if(ret1.equals(toComp)){
        }
        else if(argu.containsKey(ret1)){
            String ext = (String)argu.get(ret1).hasExtension;
            if(ext == null){
                error();
            }
            if(ext.equals(toComp)){
            }
            else{
                error();
            }
        }
        else{
            error();
        }
        
        for(Node node : n.f1.nodes) {
            //System.out.println(i);
            if(i >= sizeVec){
                //System.out.println("EXPList param num error");
                error();
            }
            String paramType = node.accept(this, argu);
            paramType = ChangeExp(paramType, argu);
            
            String match = (String)tempVec.get(i);
            
            if(match.equals(paramType)){                
            }
            else{
                //System.out.println("param type fail in EXPList");
                error();
            }
            
            i += 1;
        }
        
        if(i != sizeVec){
            //System.out.println("param size doesnt match");
            error();
        }
        
        return null;
    }
    
    @Override
    public String visit(ExpressionRest n , Hashtable<String, SymbolTable> argu){
        //System.out.println("mess2");
        return n.f1.accept(this, argu);
    }
    
    @Override
    public String visit(PrimaryExpression n , Hashtable<String, SymbolTable> argu){
        return n.f0.accept(this, argu);
    }
    
    @Override
    public String visit(IntegerLiteral n , Hashtable<String, SymbolTable> argu){
        return "2";
    }
    
    @Override
    public String visit(TrueLiteral n , Hashtable<String, SymbolTable> argu){
        return "1";
    }
    
    @Override
    public String visit(FalseLiteral n , Hashtable<String, SymbolTable> argu){
        return "1";
    }
    
    @Override
    public String visit(Identifier n , Hashtable<String, SymbolTable> argu){
        String iden = n.f0.tokenImage;
        //System.out.println("idenf " + iden);
        return iden;
    }
    
    @Override
    public String visit(ThisExpression n , Hashtable<String, SymbolTable> argu){
        
        return "this";
    }
    
    @Override
    public String visit(ArrayAllocationExpression n , Hashtable<String, SymbolTable> argu){
        String ret1 = n.f3.accept(this, argu);
        ret1 = ChangeExp(ret1, argu);
        
        if(ret1.equals("2")){
        }
        else if(typeCheck(ret1, "2", argu)){ 
        }
        else{
            //System.out.println("arrAlloc error");
            error();
        }
        
        return "0";
    }
    
    @Override
    public String visit(AllocationExpression n , Hashtable<String, SymbolTable> argu){
        //System.out.println("alloc exp");
        String ret1 = (String)n.f1.accept(this, argu);
        
        //System.out.println(ret1);
        
        if(!argu.containsKey(ret1)){
            //System.out.println("AllocEXP error");
            error();
        }
        return ret1;
    }
    
    @Override
    public String visit(NotExpression n , Hashtable<String, SymbolTable> argu){
        String ret1 = n.f1.accept(this, argu);
        ret1 = ChangeExp(ret1, argu);
        
        if(!ret1.equals("1")){
            //System.out.println("not error");
            error();
        }
        
        return "1";
    }
    
    @Override
    public String visit(BracketExpression n , Hashtable<String, SymbolTable> argu){
        return n.f1.accept(this, argu);
    }
    
}
