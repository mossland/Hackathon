using System;
using System.Linq;

namespace provably_fair
{
    class Program
    {
        static void Main(string[] args)
        {
            // Test #1
            var server = new FairServer();
            var hash = server.StartSession();

            Console.WriteLine("== Test #1 ==");
            Console.WriteLine("Hashed server seed: " + string.Join("", hash.Select(x => x.ToString("X2"))));

            for (int i = 0; i < 10; i++)
            {
                var roll = server.Roll("My Key");
                Console.WriteLine("Client seed + Nonce: {0}, Result: {1}", roll.HmacMessage, roll.Roll);
            }

            var key = server.EndSession();
            Console.WriteLine("Server Seed: " + string.Join("", key.Select(x => x.ToString("X2"))));


            // Test #2
            var rhc = new ReverseHashChain(10, 100);

            Console.WriteLine("");
            Console.WriteLine("== Test #2 ==");


            for (int i = 0; i < rhc.hashList.Count; i++)
            {
                // hash-chain 에서 결과 가져오기 
                ReverseHashChainResult rhcr = rhc.hashList[i];
                Console.WriteLine("Index: {0}, Random: {1}, Hash: {2}", i, rhcr.random, string.Join("", rhcr.seed.Select(x => x.ToString("X2"))));
            }
        }
    }
}
