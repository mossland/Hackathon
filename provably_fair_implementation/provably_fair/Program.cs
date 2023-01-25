using System;
using System.Linq;

namespace provably_fair
{
    class Program
    {
        static void Main(string[] args)
        {
            var server = new FairServer();
            var hash = server.StartSession();
            Console.WriteLine("Hashed server seed: " + string.Join("", hash.Select(x => x.ToString("X2"))));

            for (int i = 0; i < 10; i++)
            {
                var roll = server.Roll("My Key");
                Console.WriteLine("Client seed + Nonce: {0}, Result: {1}", roll.HmacMessage, roll.Roll);
            }

            var key = server.EndSession();
            Console.WriteLine("Server Seed: " + string.Join("", key.Select(x => x.ToString("X2"))));
            Console.ReadLine();
        }
    }
}
