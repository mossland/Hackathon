import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;


public class FairServer {

     public static class Result {

        private final String hmacMessage;
        private final float roll;

        public Result(String hmacMessage, float roll) {
            this.hmacMessage = hmacMessage;
            this.roll = roll;
        }

        public String getHmacMessage() {
            return hmacMessage;
        }

        public float getRoll() {
            return roll;
        }
    }

    private byte[] serverKey;
    private long nonce;

    public byte[] startSession() throws NoSuchAlgorithmException {
        if (serverKey != null) {
            throw new IllegalStateException("You must call EndSession before starting a new session");
        }

        // Generate a new server key.
        SecureRandom random = new SecureRandom();
        serverKey = new byte[128];
        random.nextBytes(serverKey);
        nonce = 0;

        // Hash the server key and return it to the player.
        MessageDigest sha = MessageDigest.getInstance("SHA-256");
        return sha.digest(serverKey);
    }

    public Result roll(String userKey) throws NoSuchAlgorithmException, InvalidKeyException {
        if (serverKey == null) {
            throw new IllegalStateException("You must call StartSession first");
        }
        if (nonce == Long.MAX_VALUE) {
            throw new IllegalStateException("Ran out of Nonce values, you must start a new session.");
        }

        Mac hmac = Mac.getInstance("HmacSHA256");
        SecretKeySpec keySpec = new SecretKeySpec(serverKey, "HmacSHA256");
        hmac.init(keySpec);

        Float roll = null;
        String message = null;
        while (roll == null) {
            message = userKey + "-" + nonce;
            nonce++;

            byte[] data = message.getBytes(StandardCharsets.UTF_8);
            byte[] hash = hmac.doFinal(data);
            roll = getNumberFromByteArray(hash);
        }
        return new Result(message, roll);
    }

    private Float getNumberFromByteArray(byte[] hash) {
        StringBuilder hashString = new StringBuilder();
        for (byte b : hash) {
            hashString.append(String.format("%02X", b));
        }

        final int chars = 5;
        for (int i = 0; i <= hashString.length() - chars; i += chars) {
            String substring = hashString.substring(i, i + chars);
            int number = Integer.parseInt(substring, 16);
            if (number > 999999) {
                continue;
            }
            return (number % 10000) / 100.0f;
        }
        return null;
    }

    public byte[] endSession() {
        byte[] key = serverKey;
        serverKey = null;
        return key;
    }
}