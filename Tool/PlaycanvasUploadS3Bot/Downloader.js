const axios = require("axios");
const fs = require("fs");
const jszip = require('jszip');
const config = require("./config.json");
const S3Uploader = require("./Uploader.js");

const playcanvasOptions = {
    accessToken: config.Playcanvas_Config.accessToken,
};

class PlaycanvasDownloader{
    constructor(isDev, projectName, discordClient) {
        this.isDev = isDev;
        this.projectName = projectName;
        this.discordClient = discordClient;
        this.localPath = config.DownloadPath;
    };

    sendLog(msg){
        let channel = this.discordClient.channels.cache.get(config.Discord_Config.channel);
        channel.send(`[${this.projectName}] ` + msg);
        console.log(`[${this.projectName}] ` + msg);
    };

    async unzip(){
        await new Promise(async (resolve, reject)=> {
            let filePath = this.localPath + '/' + this.projectName + '.zip';
            console.log('======================');
            console.log(filePath);
            const fileContent = fs.readFileSync(this.localPath + '/' + this.projectName + '.zip');


            const jz = new jszip();
            console.log('======================');
            console.log(fileContent);
            const result = await jz.loadAsync(fileContent);
            const keys = Object.keys(result.files);
            const dirName = '/' + config.GameInfo[this.projectName].SubFolderName;
            const tempPath = this.localPath + dirName;

            if (fs.existsSync(tempPath))
                fs.rmSync(tempPath, { recursive: true, force: true });
            
            fs.mkdirSync(tempPath);
            
            for(let key of keys){
                const item = result.files[key];
                if (item.dir){
                    fs.mkdirSync(tempPath + '/' + item.name);
                } else{
                    fs.writeFileSync(tempPath + '/' + item.name, Buffer.from(await item.async('arraybuffer')));
                }
            }
            //this.sendLog('unzip complete');
            resolve();
        });
    };

    async downloadFile(reqUrl, fileName){
        await new Promise(async (resolve, reject)=> {
            axios({
                method: "GET",
                url: reqUrl,
                responseType: "stream"
            }).then(res => {
                if (res.status == 200) {
                    const path = require("path");
                    const SUB_FOLDER = "";
                    fileName = fileName || reqUrl.split("/").pop();
                    
                    const dir = path.resolve(this.localPath , SUB_FOLDER, fileName);
    
                    if (fs.existsSync(dir))
                        fs.rmSync(dir, { recursive: true, force: true });
    
                    res.data.pipe(fs.createWriteStream(dir));
                    res.data.on("end", () => {
                        //this.sendLog('download completed');
                        resolve();
                    });
                } else {
                    console.log(`ERROR >> ${res.status}`);
                    reject();
                }
            }).catch(err => {
                console.log("Error ",err);
                reject();
            });
        });
    };

    async replaceService(filePath){
        if (this.isDev === false){
            //this.sendLog('replace service skip');
            return;
        }
        
        await new Promise(async (resolve, reject)=> {
            let filename = filePath;

            const data = fs.readFileSync(filename, 'utf8');
            var result = data.replace(/service./g, 'dev-service.');
            
            fs.writeFileSync(filename, result, 'utf8', function (err) {
            if (err) return console.log(err);
            });
            //this.sendLog('replace service complete');
            resolve();
        });
    };

    async downloadRequest(){
        let ret = await new Promise(async (resolve, reject)=> {
            const headers = {
                'Content-type'  : 'application/json',
                'Authorization' : 'Bearer ' + playcanvasOptions.accessToken,
                'Accept': '*/*'
            };
            const param = {
                'project_id': config.GameInfo[this.projectName].projectId,
                'name'      : config.GameInfo[this.projectName].projectName,
                'scenes'    : config.GameInfo[this.projectName].scenes,
                'scripts_concatenate' : true, 
                'scripts_minify'      : true,
        
            }
            axios.defaults.headers.post = null
            axios.post('https://playcanvas.com/api/apps/download', param, {headers})
            .then(res => { 
                resolve(res.data.id);
            })
        });
    
        return ret;
    };

    async statusRequest(id){
        let ret = await new Promise(async (resolve, reject)=> {
            let requst  = 'https://playcanvas.com/api/jobs/' + id;
    
            axios.get(requst,{
                headers: {
                    Authorization: `Bearer ${playcanvasOptions.accessToken}`
                }})
            .then(res => { 
                resolve(res.data);
            })
        });
    
        return ret;
    }

    async start(){
        this.sendLog(`deploy start`);
        const jobId = await this.downloadRequest();
        let itv;
        const completeData = await new Promise(async (resolve, reject) => {
            itv = setInterval(async () => {
                try {
                    const res = await this.statusRequest(jobId)
                    if (res.status === 'complete') {
                        clearInterval(itv);
                        
                        resolve(res);
                    }
                } catch (e) {
                    console.error(e);
                    reject();
                }
            }, 1000);
        });
    
        let result = {
            success: false,
            error: '',
        };
        try {
            await this.downloadFile(completeData.data.download_url, `${this.projectName}.zip`);
            await this.unzip();
            
            let param = this.localPath + `/${config.GameInfo[this.projectName].SubFolderName}/__game-scripts.js`;
            await this.replaceService(param);
            
            const ul = new S3Uploader(this.isDev, this.projectName, this.discordClient);
            await ul.start();
            
            this.sendLog(`deploy complete`);
            
            result.success = true;
        } catch (e) {
            result.error = e.toString()
        } finally {
            return result;
        }
    };
};

module.exports = PlaycanvasDownloader;