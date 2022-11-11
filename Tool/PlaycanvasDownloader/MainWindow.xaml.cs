using Newtonsoft.Json;
using RestSharp;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using System.Windows.Threading;
using Microsoft.WindowsAPICodePack.Dialogs;

namespace PlaycanvasDownloader
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public class PlaycanvasProject
        {
            public string name;
            public int id;
            public int sceneNumber;
        }

        private bool isRunning = false;
        private bool needStop = false;

        private string failList;
        private string[] projectAllName = { "thug_war", "RockPaperScissors", "HGOE", "Lucky7Dice", "RYB", "Lucky11Ball", "HeadsAndTails", "CCR", "Higher", "PairPair" };

        public MainWindow()
        {
            InitializeComponent();

            Init();
        }

        public void Init()
        {
            GameCombo.Items.Add("All");
            foreach (string name in projectAllName)
            {
                GameCombo.Items.Add(name);
            }

            GameCombo.SelectedIndex = 0;
        }

        private  PlaycanvasProject GetProjectByName(string name)
        {
            if (name == "thug_war")
            {
                return new PlaycanvasProject()
                {
                    name = "thug_war",
                    id = 956605,
                    sceneNumber = 1471300,
                };
            }
            else if (name == "RockPaperScissors")
            {
                return new PlaycanvasProject()
                {
                    name = "RockPaperScissors",
                    id = 957312,
                    sceneNumber = 1472826,
                };
            }
            else if (name == "HGOE")
            {
                return new PlaycanvasProject()
                {
                    name = "HGOE",
                    id = 963562,
                    sceneNumber = 1486069,
                };
            }
            else if (name == "Lucky7Dice")
            {
                return new PlaycanvasProject()
                {
                    name = "Lucky7Dice",
                    id = 967132,
                    sceneNumber = 1495189,
                };
            }
            else if (name == "RYB")
            {
                return new PlaycanvasProject()
                {
                    name = "RYB",
                    id = 967971,
                    sceneNumber = 1497393,
                };
            }
            else if (name == "Lucky11Ball")
            {
                return new PlaycanvasProject()
                {
                    name = "Lucky11Ball",
                    id = 972598,
                    sceneNumber = 1508993,
                };
            }
            else if (name == "HeadsAndTails")
            {
                return new PlaycanvasProject()
                {
                    name = "HeadsAndTails",
                    id = 975302,
                    sceneNumber = 1515223,
                };
            }
            else if (name == "CCR")
            {
                return new PlaycanvasProject()
                {
                    name = "CCR",
                    id = 991183,
                    sceneNumber = 1550519,
                };
            }
            else if (name == "Higher")
            {
                return new PlaycanvasProject()
                {
                    name = "Higher",
                    id = 995180,
                    sceneNumber = 1559734,
                };
            }
            else if (name == "PairPair")
            {
                return new PlaycanvasProject()
                {
                    name = "PairPair",
                    id = 1004003,
                    sceneNumber = 1579160,
                };
            }

            throw new ArgumentException(name);
        }

        private void AddLog(string message)
        {
            Dispatcher.Invoke(DispatcherPriority.Normal, new Action(delegate
            {
                LogMessage.Text = message;
            }));
            }

        private void ClearLog()
        {
            Dispatcher.Invoke(DispatcherPriority.Normal, new Action(delegate
            {
                LogMessage.Text = "";
            }));
        }

        private string  GetProjectStr()
        {
            string value = "";

            Dispatcher.Invoke(DispatcherPriority.Normal, new Action(delegate
            {
                value = GameCombo.SelectedItem.ToString();
            }));

            return value;
        }

        private string GetTokenId()
        {
            string value = "";

            Dispatcher.Invoke(DispatcherPriority.Normal, new Action(delegate
            {
                value = TokenId.Text;
            }));

            return value;
        }

        private string GetOutputPath()
        {
            string value = "";

            Dispatcher.Invoke(DispatcherPriority.Normal, new Action(delegate
            {
                value = OutputPath.Text;
            }));

            return value;
        }

        private void bw_DoWork(object sender, DoWorkEventArgs e)
        {
            List<string> target = new List<string>();
            string projectName = GetProjectStr();
            if (projectName == "All")
                target = projectAllName.ToList();
            else
                target.Add(projectName);

            var token = GetTokenId();
            var outputPath = GetOutputPath();

            int doneCnt = 0;
            int totalCnt = target.Count;

            failList = "";


            foreach (string name in target)
            {
                if (needStop == true)
                    return;

                var p = GetProjectByName(name);
                var client = new RestClient("https://playcanvas.com/api/apps/download");

                
                var auth = "Bearer " + token;
                var request = new RestRequest("", Method.Post);
                request.AddHeader("Authorization", auth);
                request.AddHeader("Content-Type", "application/json");
                var body = @"{
            " + "\n" +
                $@"    ""project_id"": {p.id}, 
            " + "\n" +
                $@"    ""scenes"": [{p.sceneNumber}], 
            " + "\n" +
                $@"    ""name"": ""{p.name}"",
            " + "\n" +
                $@"    ""scripts_concatenate"": true
            " + "\n" +
                @"}";
                request.AddParameter("application/json", body, ParameterType.RequestBody);
                RestResponse response = client.Execute(request);

                dynamic jobj = JsonConvert.DeserializeObject(response.Content);
                var job = 0;
                try
                {
                    job = (int)jobj["id"];
                    AddLog($"{p.name} download start. ({doneCnt }/{totalCnt})");
                }
                catch (Exception ex)
                {
                    failList += p.name + ", ";
                    AddLog($"{p.name} download failed. ({doneCnt }/{totalCnt})");
                    continue;
                }
                string downloadUrl = "";
                string jobUrl = $"https://playcanvas.com/api/jobs/{job}";
                RestClient http = new RestClient(jobUrl);
                var request2 = new RestRequest("", Method.Get);
                request2.AddHeader("Authorization", auth);
                RestResponse response2 = null;
                AddLog($"{p.name} downloading.. ({doneCnt }/{totalCnt})");
                while (true)
                {
                    response2 = http.Execute(request2);

                    jobj = JsonConvert.DeserializeObject(response2.Content);
                    var status = (string)jobj["status"];
                    if (status == "complete")
                    {
                        downloadUrl = (string)jobj["data"]["download_url"];
                        break;
                    }
                }
                var downloadClient = new RestClient(downloadUrl);
                var zipContent = new RestRequest("", Method.Get);
                byte[] data = downloadClient.DownloadData(zipContent);
                string fileName = p.name;
                string fullPath = $"{outputPath}\\{p.name}.zip"; 

                int checkCnt = 1;
                while (true)
                {
                    if (File.Exists(fullPath) != true)
                    {
                        break;
                    }
                    else
                        fullPath = $"{outputPath}\\{p.name}({checkCnt}).zip";

                    checkCnt++;
                }

                File.WriteAllBytes(fullPath, data);

                doneCnt++;
                AddLog($"{p.name } download complete. ({doneCnt }/{totalCnt})");
            }
        }

        private void bw_RunWorkerCompleted
                (object sender, RunWorkerCompletedEventArgs e)
        {
            RunGCCollect();
            if (failList == string.Empty)
                MessageBox.Show(failList + "Complete!", "Alert", MessageBoxButton.OK);
            else
                MessageBox.Show(failList + " failed!", "Alert", MessageBoxButton.OK);
            StartBtn.Content = "Start";
            isRunning = false;
            needStop = false;
            AddLog("Ready");
        }

        private void RunGCCollect()
        {
            Application.Current.Dispatcher.Invoke(DispatcherPriority.ApplicationIdle, (Action)(() =>
            {
                System.GC.Collect(0, GCCollectionMode.Forced);
                System.GC.WaitForFullGCComplete();
            }));
        }

        private void StartBtn_Click(object sender, RoutedEventArgs e)
        {
            string id = GetTokenId();
            if (id == string.Empty)
            {
                MessageBox.Show("token id id empty!", "Alert", MessageBoxButton.OK);
                return;
            }

            string outputPath = GetOutputPath();
            if (id == string.Empty)
            {
                MessageBox.Show("output path is empty", "Alert", MessageBoxButton.OK);
                return;
            }
            if (isRunning == true)
            {
                needStop = true;
                return;
            }
            ClearLog();
            isRunning = true;
            StartBtn.Content = "Stop";

            // Create a background thread
            BackgroundWorker bw = new BackgroundWorker();
            bw.DoWork += new DoWorkEventHandler(bw_DoWork);
            bw.RunWorkerCompleted += new RunWorkerCompletedEventHandler
                            (bw_RunWorkerCompleted);

            // Kick off the Async thread
            bw.RunWorkerAsync();
        }

        private void BrowseBtn_Click(object sender, RoutedEventArgs e)
        {
            CommonOpenFileDialog dialog = new CommonOpenFileDialog();
            dialog.IsFolderPicker = true;
            if (dialog.ShowDialog() == CommonFileDialogResult.Ok)
            {
                OutputPath.Text = dialog.FileName;
            }
        }
    }
}