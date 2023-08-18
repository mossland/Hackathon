## Hackathon 게임 프로젝트와 Backend를 local에서 구동하기 위한 proxy 서버


1. ```/Backend``` 경로에서 ```yarn dev``` 하면 dev server가 ```localhost:3000``` 에 뜹니다.
2. 이후 ```/DevEnvProxyServer``` 에서 ```yarn start``` 프록시 서버가 ```localhost:8090``` 에 뜹니다.


## Proxy Server Path
1. BaseURL
 ```http://localhost:8090```
2. Backend Path
```http://localhost:8090/api```
3. GameClient Path
```http://localhost:8090/```
** ```/DevEnvProxyServer/index.js``` 파일에서 프록시할 게임클라이언트의 경로를 변경해줘야합니다. 현재는 RockPaperScissors 게임이 기본으로 되어 있습니다.