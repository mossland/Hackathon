import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;

public class Main {

    public static void main(String[] args) throws NoSuchAlgorithmException, InvalidKeyException {
        // Test #1
        FairServer server = new FairServer();
        byte[] hash = server.startSession();

        System.out.println("== Test #1 ==");
        System.out.println("Hashed server seed: " + bytesToHexString(hash));

        for (int i = 0; i < 10; i++) {
            FairServer.Result roll = server.roll("My Key");
            System.out.println("Client seed + Nonce: " + roll.getHmacMessage() + ", Result: " + roll.getRoll());
        }

        byte[] key = server.endSession();
        System.out.println("Server Seed: " + bytesToHexString(key));

        // Test #2
        ReverseHashChain rhc = new ReverseHashChain(10, 100);

        System.out.println("");
        System.out.println("== Test #2 ==");

        for (int i = 0; i < rhc.getHashList().size(); i++) {
            // hash-chain 에서 결과 가져오기
            ReverseHashChain.ReverseHashChainResult rhcr = rhc.getHashList().get(i);
            System.out.println("Index: " + i + ", Random: " + rhcr.getRandom() + ", Hash: " + bytesToHexString(rhcr.getSeed()));
        }
    }

    private static String bytesToHexString(byte[] bytes) {
        StringBuilder hexString = new StringBuilder();
        for (byte b : bytes) {
            String hex = Integer.toHexString(b & 0xFF);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString().toUpperCase();
    }
}
