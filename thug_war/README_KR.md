![hackathon](https://user-images.githubusercontent.com/109493423/196602490-c73a44f0-16f8-4321-9538-244b3e6fc09d.png)

# THUG War
- 두개의 Thug 캐릭터 아이디 숫자로 높고 낮음을 예측하는 게임입니다.

# 게임 설명
- 게임은 총 10개의 무작위 Thug 캐릭터로 진행됩니다.
- 첫 번째 Thug 캐릭터가 공개되면, 플레이어는 두 번째 Thug 캐릭터가 첫 번째 캐릭터보다 숫자가 높을지 아니면 낮을지를 예측합니다.
- 첫 번째 캐릭터의 위치에 따라 예측 성공시 보상 배율이 달라집니다.
- 만약 첫 번째 캐릭터가 상단의 10개 리스트에서 제일 왼쪽에 위치한다면, 두 번째 캐릭터는 남은 9개 캐릭터 중 하나가 나올 확률이 높습니다.
- 따라서 'HIGHER'를 선택했을 때 예측 성공 보상이 낮아집니다.
- 그러나 같은 캐릭터가 나올 확률은 매우 낮으므로 'LOWER'를 선택했을 때 예측 성공보상은 매우 높아집니다.

# 화면 구성

![image](https://github.com/mossland/Hackathon/assets/13128375/ab6e01e8-948f-458b-a08f-6deda450eac8)

1. 유저 아이디
2. 보유 포인트
3. 10개의 Thug 캐릭터 덱. 왼쪽에 있는 캐릭터가 제일 낮은 숫자의 캐릭터이고 오른쪽에 있는 캐릭터가 가장 높은 숫자의 캐릭터
4. 첫번째 Thug 캐릭터. 승부의 기준이 되는 캐릭터
5. 두번째 Thug 캐릭터.
6. 게임 시작버튼, 높고 낮음을 선택하는 버튼

# 플레이 방법
1. <kbd>START</kbd>버튼을 눌러 게임을 시작하고 원하는 금액을 설정합니다.

![image](https://github.com/mossland/Hackathon/assets/13128375/d2356633-ecd2-4e11-917b-bbfd24d94260)

2. 금액 설정이 끝나면 첫 번째 캐릭터가 선택되고 공개됩니다.

![image](https://github.com/mossland/Hackathon/assets/13128375/d590ef79-cc04-4093-8ebb-03435c24bde9)
![image](https://github.com/mossland/Hackathon/assets/13128375/4227fd4a-7458-414d-bef1-b4295c19c29d)


3. 플레이어는 두 번째 캐릭터가 첫 번째 캐릭터보다 높은(<kbd>LOWER</kbd>) 숫자가 나올지, 낮은(<kbd>HIGHER</kbd>) 숫자가 나올지를 선택합니다.

4. <kbd>LOWER</kbd> ,<kbd>HIGHER</kbd>버튼에 예측성공시 보상 배율이 표시됩니다.

![image](https://github.com/mossland/Hackathon/assets/13128375/76844b35-ac38-436b-addd-ccdebe86cf77)


5. 선택완료후 두 번째 캐릭터가 선택되고 공개됩니다.

![image](https://github.com/mossland/Hackathon/assets/13128375/76a46716-b4f3-43e4-a561-6ac75bc46985)

6. 승부결과를 확인할수있습니다.
   
![image](https://github.com/mossland/Hackathon/assets/13128375/6b1f3ff1-cb88-4dab-afdd-a20a77a86ea0)
![image](https://github.com/mossland/Hackathon/assets/13128375/6b49a253-9e05-477d-a42a-8fb830a7878a)


7. 예측이 성공하면 해당 배율에 따른 보상을 획득하게 됩니다.


# 실행
[npm](https://www.npmjs.com) 및 [http-server](https://www.npmjs.com/package/http-server)를 전역으로 설치합니다.
```
npm install --global http-server
```

프로젝트를 다운로드한 폴더에서 http-server를 실행한 후,   
로컬호스트로 접속하여 간단한 테스트를 진행할 수 있습니다.

# 플레이 영상
![t_w](https://github.com/mossland/Hackathon/assets/13128375/2ed897f0-4bcd-4d5e-aad3-55a9db5676c2)


# 데모 페이지
[데모 링크](http://asset.moss.land/ThugWar/index.html)

# Credits
PlayCanvas WebGL: https://playcanvas.com/
