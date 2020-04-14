import java.io.*;
import java.util.*;

public class genTOTP{
    
    public static void main(String[] args){
        // the key is the secret key
        String key = "HiMyNaMeIsHun";
        TOTP m_totp = new TOTP(key, 8, 30);
            
        System.out.println(m_totp.get_TOPT());
    }
}