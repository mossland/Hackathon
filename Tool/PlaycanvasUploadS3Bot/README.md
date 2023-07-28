# PlaycanvasUploadS3Bot

## config.json
- config.json이 반드시 필요합니다.

```javascript
{
    "AWS_Config" : {
        "accessKeyId": "xxxxx",
        "secretAccessKey":  "xxxxxxxxx"
    },
    "Discord_Config" : {
        "botToken": "xxxxxxxxxxxx", // discord 봇 토큰
        "channel" : "xxxxxxxxxxxxxxxxxx", // discord 채널 아이디
    },
    "Playcanvas_Config" :{
        "accessToken": "xxxxxxxxxxxxxxxxxxx" //Playcanvas api 토큰
    },
    "DownloadPath" : "C:\\download",     // playcanvas zip파일 다운로드 경로
    "GameInfo" : {
        "Higher" : {                           // discord 커맨드 이름
            "scenes" : [1559734],              // playcanvas scenes id (하단에 설명)
            "projectId" : 995180,              // playcanvas project id (하단에 설명)
            "branchId" : "master",             // playcanvas branch id(그냥 master로 사용하면될듯)
            "projectName" : "Higher",          // 프로젝트 이름(playcanvas프로젝트 이름과 일치해야함
            "BucketName" : "asset.moss.land",  // s3버킷 이름
            "Prefix" : "prefix",               // 세부 경로
            "SubFolderName"  : "Higher",       // 최종 폴더 이름(asset.moss.land/prefix/dev[prod]/Higher)
            "region" : "ap-northeast-1"        // s3버킷 리전
        },
        "RockPaperScissors"  : {
            "scenes" : [1472826],
            "projectId" : 957312,
            "branchId" : "master",
            "projectName" : "RockPaperScissors",
            "BucketName" : "asset.moss.land",
            "Prefix" : "prefix",
            "SubFolderName" : "RockPaperScissors",
            "region" : "ap-northeast-1"
        }
    }
}
```
- 게임추가시 GameInfo에, Higher와 같은 똑같은 형식으로 추가를 해야합니다.
- playcanvas projectId 확인방법
    + playcanvas 프로젝트를 열면 주소에 빨간박스부분이 projectId 입니다.

![image](https://user-images.githubusercontent.com/13128375/218656273-d6090991-b557-4ec5-a308-7139c376d0f3.png)

- playcanvas scenesId 확인방법
    + playcanvas 프로젝트의 에디터를 열고 씬을 선택합니다.
    + 주소에 빨간박스부분이 scenesId 입니다.

![image](https://user-images.githubusercontent.com/13128375/218656173-2918a9a8-fdff-4370-b756-2d1b43b5c556.png)

## build
```
npm install
```
- 패키지 설치후에 패키지 코드를 수정해야 합니다.

- node_modules\s3-folder-upload\lib\upload-directory.js 26라인의 아래코드를
```
globby([`${directoryPath}/**/*`], {onlyFiles: true})
      .then(files => {
        const filesToUpload = files.map(file =>
          file.replace(`${directoryPath}/`, '')
        )
```

- 아래코드로 수정해야 합니다. 
- 윈도우에서는 동작이 안되므로 반드시 수정해야 합니다.
```
globby([`${directoryPath}/**/*`.replace(/\\/g, "/")], {onlyFiles: true}) 
      .then(files => {
        const filesToUpload = files.map(file =>
          file.replace(`${directoryPath}/`.replace(/\\/g, "/"), '')
        )
```

## run
```
node index.js
```

## discord command
```
!build Higher dev
!build Higher production
```
- 위의 명령어처럼 아래의 형식으로 discord 채널에 입력하면 다운로드/배포가 동작합니다.
```
!build [프로젝트 이름] [dev/production]
```
