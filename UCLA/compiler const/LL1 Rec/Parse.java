import java.io.*;
import java.util.*;

class Parse{
    
    static void errExit(){
        System.out.println("Parse error");
        System.exit(0);
    }
    
    static boolean Isempty(Queue m_queue){
        return m_queue.isEmpty();
    }
    
    static void match(String token, Queue m_queue){
        String Token = "";
        if(!Isempty(m_queue)){
            Token = (String)m_queue.element();
        }
        else{
            errExit();
        }
        
        if(token.equals(Token)){
            m_queue.remove();
        }
        else{
            errExit();
        }
    }
    
    static void preStart(Queue m_queue){
        start(m_queue);
        match("EOF", m_queue);
    }
    
    static void start(Queue m_queue){
        String Token = "";
        if(!Isempty(m_queue)){
            Token = (String)m_queue.element();
        }
        else{
            errExit();
        }
        
        if(Token.equals("{")){
            match(Token, m_queue);
            Lstage(m_queue);
            match("}", m_queue);
        }
        else if(Token.equals("System.out.println")){
            match(Token, m_queue);
            match("(", m_queue);
            Estage(m_queue);
            match(")", m_queue);
            match(";", m_queue);
        }
        else if(Token.equals("if")){
            match(Token, m_queue);
            match("(", m_queue);
            Estage(m_queue);
            match(")", m_queue);
            start(m_queue);
            match("else", m_queue);
            start(m_queue);
        }
        else if(Token.equals("while")){
            match(Token, m_queue);
            match("(", m_queue);
            Estage(m_queue);
            match(")", m_queue);
            start(m_queue);
        }
        else{
            errExit();
        }
    }
    
    static void Lstage(Queue m_queue){
        String Token = "";
        if(!Isempty(m_queue)){
            Token = (String)m_queue.element();
        }
        else{
            errExit();
        }
        
        if(Token.equals("{") || Token.equals("System.out.println") || Token.equals("if") || Token.equals("while")){
            start(m_queue);
            Lstage(m_queue);
        }
        else{
        }
    }
    
    static void Estage(Queue m_queue){
        String Token = "";
        if(!Isempty(m_queue)){
            Token = (String)m_queue.element();
        }
        else{
            errExit();
        }
        
        
        if(Token.equals("true")){
            
            match(Token, m_queue);
        }
        else if(Token.equals("false")){
            
            match(Token, m_queue);
        }
        else if(Token.equals("!")){
            
            match(Token, m_queue);
            Estage(m_queue);
        }
        else{
            
            errExit();
        }
    }
    
    
    public static void main (String[] args){

        Set<Integer> Accept = new HashSet<Integer>();
        Accept.add(1);
        Accept.add(2);
        Accept.add(3);
        Accept.add(4);
        Accept.add(5);
        Accept.add(6);
        Accept.add(24);
        Accept.add(26);
        Accept.add(30);
        Accept.add(35);
        Accept.add(39);
        Accept.add(44);
        
        int stage = 0;
        int subStage = 0;
        String m_string = "";
        
        Queue<String> m_queue = new LinkedList<>();
        String Token = "";
        
        try{
            BufferedReader m_char = new BufferedReader(new InputStreamReader(System.in));
            int data = m_char.read();
            
            while(data != -1){
                if(Character.isWhitespace((char)data)){
                    if(stage == 0){
                        data = m_char.read();
                        continue;
                    }
                    errExit();
                }
                
                switch(stage){
		case 0:
		    if((char)data == '{'){
			m_string += (char)data;
			subStage = 1;
			break;
		    }
		    if((char)data == '}'){
			m_string += (char)data;
			subStage = 2;
			break;
		    }
		    if((char)data == '('){
			m_string += (char)data;
			subStage = 3;
			break;
		    }
		    if((char)data == ')'){
			m_string += (char)data;
			subStage = 4;
			break;
		    }
		    if((char)data == ';'){
			m_string += (char)data;
			subStage = 5;
			break;
		    }
		    if((char)data == '!'){
			m_string += (char)data;
			subStage = 6;
			break;
		    }
		    if((char)data == 'S'){
			m_string += (char)data;
			subStage = 7;
			stage = 1;
			break;
		    }
		    if((char)data == 'i'){
			m_string += (char)data;
			subStage = 25;
			stage = 2;
			break;
		    }
		    if((char)data == 'e'){
			m_string += (char)data;
			subStage = 27;
			stage = 3;
			break;
		    }
		    if((char)data == 'w'){
			m_string += (char)data;
			subStage = 31;
			stage = 4;
			break;
		    }
		    if((char)data == 't'){
			m_string += (char)data;
			subStage = 36;
			stage = 5;
			break;
		    }
		    if((char)data == 'f'){
			m_string += (char)data;
			subStage = 40;
			stage = 6;
			break;
		    }
		    //ends if no character matches
                        
		    errExit();
		case 1:
		    switch(subStage){
		    case 7:
			if((char)data == 'y'){
			    subStage += 1;
			    m_string += (char)data;
			    break;
			}

			errExit();
		    case 8:
			if((char)data == 's'){
			    subStage += 1;
			    m_string += (char)data;
			    break;
			}
                                
			errExit();
		    case 9:
			if((char)data == 't'){
			    subStage += 1;
			    m_string += (char)data;
			    break;
			}
                                
			errExit();
		    case 10:
			if((char)data == 'e'){
			    subStage += 1;
			    m_string += (char)data;
			    break;
			}
                                
			errExit();
		    case 11:
			if((char)data == 'm'){
			    subStage += 1;
			    m_string += (char)data;
			    break;
			}
                                
			errExit();
		    case 12:
			if((char)data == '.'){
			    subStage += 1;
			    m_string += (char)data;
			    break;
			}
                                
			errExit();
		    case 13:
			if((char)data == 'o'){
			    subStage += 1;
			    m_string += (char)data;
			    break;
			}
                                
			errExit();
		    case 14:
			if((char)data == 'u'){
			    subStage += 1;
			    m_string += (char)data;
			    break;
			}
                                
			errExit();
		    case 15:
			if((char)data == 't'){
			    subStage += 1;
			    m_string += (char)data;
			    break;
			}
                                
			errExit();
		    case 16:
			if((char)data == '.'){
			    subStage += 1;
			    m_string += (char)data;
			    break;
			}
                                
			errExit();
		    case 17:
			if((char)data == 'p'){
			    subStage += 1;
			    m_string += (char)data;
			    break;
			}
                                
			errExit();
		    case 18:
			if((char)data == 'r'){
			    subStage += 1;
			    m_string += (char)data;
			    break;
			}
                                
			errExit();
		    case 19:
			if((char)data == 'i'){
			    subStage += 1;
			    m_string += (char)data;
			    break;
			}
                                
			errExit();
		    case 20:
			if((char)data == 'n'){
			    subStage += 1;
			    m_string += (char)data;
			    break;
			}
                                
			errExit();
		    case 21:
			if((char)data == 't'){
			    subStage += 1;
			    m_string += (char)data;
			    break;
			}
			errExit();
		    case 22:
			if((char)data == 'l'){
			    subStage += 1;
			    m_string += (char)data;
			    break;
			}
			errExit();
		    case 23:
			if((char)data == 'n'){
			    subStage += 1;
			    m_string += (char)data;
			    break;
			}
			errExit();
		    default:
			errExit();
		    }
		    break;
		case 2:
		    if((char)data == 'f' && subStage == 25){
			m_string += (char)data;
			subStage += 1;
		    }
		    else{
			errExit();
		    }
		    break;
		case 3:
		    switch(subStage){
		    case 27:
			if((char)data == 'l'){
			    subStage += 1;
			    m_string += (char)data;
			    break;
			}
			errExit();
		    case 28:
			if((char)data == 's'){
			    subStage += 1;
			    m_string += (char)data;
			    break;
			}
			errExit();
		    case 29:
			if((char)data == 'e'){
			    subStage += 1;
			    m_string += (char)data;
			    break;
			}
			errExit();
		    default:
			errExit();
		    }
		    break;
		case 4:
		    switch(subStage){
		    case 31:
			if((char)data == 'h'){
			    subStage += 1;
			    m_string += (char)data;
			    break;
			}
			errExit();
		    case 32:
			if((char)data == 'i'){
			    subStage += 1;
			    m_string += (char)data;
			    break;
			}
			errExit();
		    case 33:
			if((char)data == 'l'){
			    subStage += 1;
			    m_string += (char)data;
			    break;
			}
			errExit();
		    case 34:
			if((char)data == 'e'){
			    subStage += 1;
			    m_string += (char)data;
			    break;
			}
			errExit();
		    default:
			errExit();
		    }
		    break;
		case 5:
		    switch(subStage){
		    case 36:
			if((char)data == 'r'){
			    subStage += 1;
			    m_string += (char)data;
			    break;
			}
			errExit();
		    case 37:
			if((char)data == 'u'){
			    subStage += 1;
			    m_string += (char)data;
			    break;
			}
			errExit();
		    case 38:
			if((char)data == 'e'){
			    subStage += 1;
			    m_string += (char)data;
			    break;
			}
			errExit();
		    default:
			errExit();
		    }
		    break;
		case 6:
		    switch(subStage){
		    case 40:
			if((char)data == 'a'){
			    subStage += 1;
			    m_string += (char)data;
			    break;
			}
			errExit();
		    case 41:
			if((char)data == 'l'){
			    subStage += 1;
			    m_string += (char)data;
			    break;
			}
			errExit();
		    case 42:
			if((char)data == 's'){
			    subStage += 1;
			    m_string += (char)data;
			    break;
			}
			errExit();
		    case 43:
			if((char)data == 'e'){
			    subStage += 1;
			    m_string += (char)data;
			    break;
			}
			errExit();
		    default:
			errExit();
		    }
		    break;
		default:
                        
                }
                if(Accept.contains(subStage)){
                    stage = 0;
                    try{
                        m_queue.add(m_string);
                    }
                    catch(IllegalStateException ise){
                        errExit();
                    }
                    m_string = "";
                }
                data = m_char.read();
            }
            m_queue.add("EOF");
            String m_test = m_queue.element();
            
            preStart(m_queue);
            
            
            System.out.println("Program parsed successfully");
        }
        catch(IOException ioe){
            System.out.println("Parse error");
        }

    }
}
