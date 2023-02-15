const S3 = require('aws-sdk/clients/s3');
const s3FolderUpload = require('s3-folder-upload')
const config = require("./config.json");

class S3Uploader{
    constructor(isDev, projectName, discordClient) {
        this.isDev = isDev;
        this.projectName = projectName;
        this.discordClient = discordClient;
        this.localPath = config.DownloadPath;

        this.s3 = new S3({
            signatureVersion: 'v4',
            accessKeyId: config.AWS_Config.accessKeyId,
            secretAccessKey:  config.AWS_Config.secretAccessKey
        });
        console.log(this.isDev, this.projectName);
    };

    sendLog(msg){
        let channel = this.discordClient.channels.cache.get(config.Discord_Config.channel);
        channel.send(`[${this.projectName}] ` + msg);
    };

    async upload(){
        const directoryName = this.localPath + '\\' + config.GameInfo[this.projectName].SubFolderName;
        let bn = `${config.GameInfo[this.projectName].BucketName}`;
        bn += `/${config.GameInfo[this.projectName].Prefix}`;
        if (this.isDev) bn += `/dev`;
        else            bn += `/prod`;

        bn += `/${config.GameInfo[this.projectName].SubFolderName}`;

        const credentials = {
            accessKeyId: config.AWS_Config.accessKeyId,
            secretAccessKey:  config.AWS_Config.secretAccessKey,
            "region": config.GameInfo[this.projectName].region,
            "bucket": bn,
        };

        const options = {
            useFoldersForFileTypes: false,
            useIAMRoleCredentials: false
        };

        const invalidation = {
        };
        
        await s3FolderUpload(directoryName, credentials, options, invalidation);
    };

    async removeBucket(bucket, dir){
        const listParams = {
            Bucket: bucket,
            Prefix: dir
        };
    
        const listedObjects = await this.s3.listObjectsV2(listParams).promise();
    
        if (listedObjects.Contents.length === 0) return;
    
        const deleteParams = {
            Bucket: bucket,
            Delete: { Objects: [] }
        };
    
        listedObjects.Contents.forEach(({ Key }) => {
            deleteParams.Delete.Objects.push({ Key });
        });
    
        await this.s3.deleteObjects(deleteParams).promise();
    
        if (listedObjects.IsTruncated) await removeBucket(bucket, dir);
    };

    async start(){
        let bn = '';
        bn += `${config.GameInfo[this.projectName].Prefix}`;
        if (this.isDev) bn += `/dev`;
        else            bn += `/prod`;
        bn += `/${config.GameInfo[this.projectName].SubFolderName}`;

        await this.removeBucket(config.GameInfo[this.projectName].BucketName, bn);
        this.sendLog(`bucket remove complete`);
        
        await this.upload();
        this.sendLog('s3 upload complete');
        
    };
};

module.exports = S3Uploader;