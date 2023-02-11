using System;
using System.Security.Cryptography;

namespace provably_fair
{
    public class ReverseHashChainResult
    {
        public int index { get; }
        public byte[] seed { get; }
        public float? random { get; }

        public ReverseHashChainResult(int index, byte[] seed, float? random)
        {
            this.index = index;
            this.seed = seed;
            this.random = random;
        }
    }

    public class ReverseHashChain
    {
        private int hashSize = 100;

        private byte[] salt;
        private byte[] seed;

        public List<ReverseHashChainResult> hashList { get; }

        public ReverseHashChain(int hashSize, int maxRandomValue)
        {
            // Generate a new seed hash.
            var rng = RandomNumberGenerator.Create();

            seed = new byte[128];
            rng.GetBytes(seed);

            salt = new byte[128];
            rng.GetBytes(salt);

            // Create a reverse hash-chain.
            byte[] hash = seed;

            var hmac = new HMACSHA256(salt);
            hashList = new List<ReverseHashChainResult>();

            for (int i = 0; i < hashSize; i++)
            {
                ReverseHashChainResult result = new ReverseHashChainResult(hashSize - i, hash, GetNumberFromByteArray(hash) * maxRandomValue);
                hashList.Add(result);

                hash = hmac.ComputeHash(hash);
            }

            hashList.Reverse();
        }

        private float? GetNumberFromByteArray(byte[] hash)
        {
            var hashString = string.Join("", hash.Select(x => x.ToString("X2")));
            const int chars = 5;
            for (int i = 0; i <= hashString.Length - chars; i += chars)
            {
                var substring = hashString.Substring(i, chars);
                var number = int.Parse(substring, System.Globalization.NumberStyles.HexNumber);
                if (number > 999999)
                    continue;
                return (number % 10000) / 10000.0f;
            }
            return null;
        }
    }
}

