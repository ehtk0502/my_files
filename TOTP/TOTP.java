import java.io.*;
import java.util.*;
import java.math.BigInteger;
import javax.crypto.Mac;
import java.security.NoSuchAlgorithmException;
import javax.crypto.spec.SecretKeySpec;
import java.security.InvalidKeyException;
import java.nio.ByteBuffer;

// implementation of Time based One Time Password specified in rfc4226.

public class TOTP{
    private int C;
    private String key;
    private int m_digit;
    
    TOTP(String secret, int digit, int stepSize){
        
        long CurrentTime = System.currentTimeMillis() / 1000L;
        C = (int)(CurrentTime / stepSize);
        
        key = secret;
        m_digit = digit;
        
    }
    
    public String get_TOPT(){
        return HOTP(this.C, this.key);
    }
    
    
    private String HOTP(int C, String key){
        //The key and step value must be convered to hex byte forms
        String Cstr = Integer.toHexString(C).toUpperCase();
        
        while(Cstr.length() < 16){
            Cstr = "0" + Cstr;
        }
        
        byte[] Cbyte = str2byte(Cstr);
        
        
        byte[] Kbyte;
        
        try{
            Kbyte = key.getBytes("UTF-8");
        }
        catch(UnsupportedEncodingException uee){
            throw new IOError(null);
        }
        
        byte[] hmac = HMAC(Cbyte, Kbyte);
        for(int i = 0; i < hmac.length; i++){
            int a = hmac[i] & 0xff;
        }
        
        //truncate the value using offset and number of digits specified
        
        int offset = hmac[hmac.length - 1] & 0xf;
        
        int totp_value = ((hmac[offset] & 0x7f) << 24) | ((hmac[offset+1] & 0xff) << 16) 
            | ((hmac[offset+2] & 0xff) << 8) | ((hmac[offset+3] & 0xff));
        
        
        String strVal = Integer.toString(totp_value);
        
        if(strVal.length() > m_digit){
            strVal = strVal.substring(strVal.length() - m_digit);
        }
        
        return strVal;
    }
    
    private byte[] HMAC(byte[] C, byte[] key){
        Mac m_mac;
        
        try{        
            m_mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec macKey = new SecretKeySpec(key, "RAW");
            try{
                m_mac.init(macKey);
            }
            catch(InvalidKeyException ike){
                throw new IOError(null);
            }
            
            m_mac.update(C);
            return m_mac.doFinal();
        }
        catch(NoSuchAlgorithmException nsae){
            throw new IOError(null);
        }
        
    }
    
    private byte[] str2byte(String val){
        
        byte[] bArray = new BigInteger("10" + val,16).toByteArray();

        byte[] ret = new byte[bArray.length - 1];
        for (int i = 0; i < ret.length; i++){
            ret[i] = bArray[i+1];
        }    
        
        return ret;
    }

}