import syntaxtree.*;
import visitor.GJVoidDepthFirst;
import java.util.*;


public class Myvisitor extends GJVoidDepthFirst<SymbolTable>{
    
    public void error(){
        System.out.println("error");
        System.exit(0);
    }
   
    public SymbolTable collection = new SymbolTable("collection");
    
    @Override
    public void visit(Goal n , SymbolTable argu){
        n.f0.accept(this, argu);
        n.f1.accept(this, argu);
    }
    
    @Override
    public void visit(MainClass n , SymbolTable argu){
        String mainName = n.f1.f0.toString();
        
        //System.out.println(mainName);
        
        SymbolTable mainSym = new SymbolTable(mainName);
        
        if(!this.collection.addChild(mainName, mainSym)){
            error();
        }
        
        n.f14.accept(this, mainSym);
        for(Node node : n.f14.nodes) {
            node.accept(this, mainSym);
        }
    }
    
    @Override
    public void visit(TypeDeclaration n , SymbolTable argu){
        n.f0.accept(this, argu);
    }
    
    @Override
    public void visit(ClassDeclaration n , SymbolTable argu){
        String name = n.f1.f0.toString();
        //System.out.println("ClassDeclaration: " + name);
        
        SymbolTable firstLevel = new SymbolTable(name);
        
        if(!this.collection.addChild(name, firstLevel)){
            error();
        }
        
        for(Node node : n.f3.nodes) {
            node.accept(this, firstLevel);
        }
        
        for(Node node : n.f4.nodes) {
            node.accept(this, firstLevel);
        }
    }
    
    @Override
    public void visit(ClassExtendsDeclaration n , SymbolTable argu){
        String name = n.f1.f0.toString();
        String ext = n.f3.f0.toString();
        //System.out.println("ClassExtendsDeclaration: " + name + " ext: " + ext);
        
        SymbolTable firstLevel = new SymbolTable(name);
        firstLevel.setExtension(ext);
        
        if(!this.collection.addChild(name, firstLevel)){
            error();
        }
        
        for(Node node : n.f5.nodes) {
            node.accept(this, firstLevel);
        }
        
        for(Node node : n.f6.nodes) {
            node.accept(this, firstLevel);
        }
    }
    
    @Override
    public void visit(VarDeclaration n , SymbolTable argu){
        String name = n.f1.f0.toString();
        String type = String.valueOf(n.f0.f0.which);
        
        //System.out.println("VarDeclaration:" + name + " and type: " + type);
        
        if(type.equals("3")){
            //System.out.println("type3: " + type);
            argu.setWhichType(2);
            argu.setWhichName(name);
            n.f0.accept(this, argu);
        }
        else if(!argu.addVar(name, type)){
            //System.out.println("VarDeclaration error");
            error();
        }
    }
    
    @Override
    public void visit(MethodDeclaration n , SymbolTable argu){
        String name = n.f2.f0.toString();
        String type = String.valueOf(n.f1.f0.which);
        //System.out.println("MethodDeclaration:" + name + " and type: " + type);
        
        SymbolTable methodTable = new SymbolTable(name);
        methodTable.setParent(argu.className, argu);
        
        if(argu.hasExtension != null){
            methodTable.setExtension(argu.hasExtension);
        }
        
        argu.addChild(name, methodTable);
        
        ////////////////////////////////////////////////////////
        if(type.equals("3")){
            //System.out.println("type3: " + type);
            methodTable.setWhichType(1);
            n.f1.accept(this, methodTable);
        }
        else{
            methodTable.setMethodType(type);
        }
        
        n.f4.accept(this, methodTable);
        
        for(Node node : n.f7.nodes) {
            node.accept(this, methodTable);
        }
    }
    
    @Override
    public void visit(FormalParameterList n , SymbolTable argu){
        n.f0.accept(this, argu);
        for(Node node : n.f1.nodes) {
            node.accept(this, argu);
        }
    }
    
    @Override
    public void visit(FormalParameter n , SymbolTable argu){
        String name = n.f1.f0.toString();
        String type = String.valueOf(n.f0.f0.which);
        //System.out.println("FormalParameter:" + name + " and type: " + type);
        
        
        if(type.equals("3")){
            //System.out.println("type3: " + type);
            argu.setWhichType(3);
            argu.setWhichName(name);
            n.f0.accept(this, argu);
        }
        else if(!argu.addParam(name, type)){
            //System.out.println("FormalParameter error");
            error();
        }
    }
    
    @Override
    public void visit(FormalParameterRest n , SymbolTable argu){
        n.f1.accept(this, argu);
    }
    
    @Override
    public void visit(Type n , SymbolTable argu){
        n.f0.accept(this, argu);
    }
    
    @Override
    public void visit(Identifier n , SymbolTable argu){
        String type = n.f0.tokenImage;
        //System.out.println("Identifier: " + type);
        
        if(!argu.setTypeSpecial(type)){
            //System.out.println("special type error");
            error();
        }
    }
}

