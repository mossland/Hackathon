import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;

public class ReverseHashChain {

    public static class ReverseHashChainResult {
        private final int index;
        private final byte[] seed;
        private final Float random;

        public ReverseHashChainResult(int index, byte[] seed, Float random) {
            this.index = index;
            this.seed = seed;
            this.random = random;
        }

        public int getIndex() {
            return index;
        }

        public byte[] getSeed() {
            return seed;
        }

        public Float getRandom() {
            return random;
        }
    }

    private final int hashSize = 100;
    private final byte[] salt;
    private final byte[] seed;

    private final List<ReverseHashChainResult> hashList;

    public ReverseHashChain(int hashSize, int maxRandomValue) {
        // Generate a new seed hash.
        SecureRandom rng;
        try {
            rng = SecureRandom.getInstanceStrong();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to create SecureRandom instance.");
        }

        seed = new byte[128];
        rng.nextBytes(seed);

        salt = new byte[128];
        rng.nextBytes(salt);

        // Create a reverse hash-chain.
        byte[] hash = seed;

        try {
            MessageDigest hmac = MessageDigest.getInstance("SHA-256");
            hashList = new ArrayList<>();

            for (int i = 0; i < hashSize; i++) {
                ReverseHashChainResult result = new ReverseHashChainResult(hashSize - i, hash, getNumberFromByteArray(hash) * maxRandomValue);
                hashList.add(result);

                hash = hmac.digest(hash);
            }

            java.util.Collections.reverse(hashList);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to create SHA-256 MessageDigest instance.");
        }
    }

    private float getNumberFromByteArray(byte[] hash) {
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
            return (number % 10000) / 10000.0f;
        }
        return Float.NaN;
    }

    public List<ReverseHashChainResult> getHashList() {
        return hashList;
    }
}