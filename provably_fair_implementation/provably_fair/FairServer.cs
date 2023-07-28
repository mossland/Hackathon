using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace provably_fair
{
    public class Result
    {
        public Result(string hmacMessage, float roll)
        {
            HmacMessage = hmacMessage;
            Roll = roll;
        }

        public string HmacMessage { get; }
        public float Roll { get; }
    }

    public class FairServer
    {
        private byte[] _serverKey;
        private ulong _nonce;

        public byte[] StartSession()
        {
            if (_serverKey != null)
                throw new InvalidOperationException("You must call EndSession before starting a new session");

            //Generate a new server key.
            using (var rng = RandomNumberGenerator.Create())
            {
                _serverKey = new byte[128];
                rng.GetBytes(_serverKey);
            }
            _nonce = 0;

            //Hash the server key and return it to the player.
            using (var sha = SHA256.Create())
            {
                return sha.ComputeHash(_serverKey);
            }
        }

        public Result Roll(string userKey)
        {
            if (_serverKey == null)
                throw new InvalidOperationException("You must call StartSession first");
            if (_nonce == ulong.MaxValue)
                throw new InvalidOperationException("Ran out of Nonce values, you must start a new session.");

            using (var hmac = new HMACSHA256(_serverKey))
            {
                float? roll = null;
                string message = null;
                while (roll == null)
                {
                    message = userKey + "-" + _nonce;
                    _nonce++;

                    var data = Encoding.UTF8.GetBytes(message);
                    var hash = hmac.ComputeHash(data);
                    roll = GetNumberFromByteArray(hash);
                }
                return new Result(message, roll.Value);
            }
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
                return (number % 10000) / 100.0f;
            }
            return null;
        }

        public byte[] EndSession()
        {
            var key = _serverKey;
            _serverKey = null;
            return key;
        }
    }
}