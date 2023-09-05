![image](https://github.com/mossland/Hackathon/assets/13128375/1c4fa0e4-aaa6-4bb8-9fc8-ebb6543acb9f)![hackathon](https://user-images.githubusercontent.com/109493423/196602490-c73a44f0-16f8-4321-9538-244b3e6fc09d.png)

# Lucky7Dice

- 두 주사위의 합이 7 보다 큰 수인지 작은 수인지 예측하는 게임
  
# 게임 설명

- 이 게임은 6면체 레드 주사위와 블루 주사위를 사용하여 진행됩니다.
- 게임이 시작되면 두 주사위의 합을 선택합니다. 선택할 수 있는 옵션은 "언더", "7", "오버" 세 가지입니다.
- 각각의 선택지에는 언더와 오버는 수익률이 2배이며, 7은 수익률이 5배입니다.
- 두 주사위의 합이 2부터 6까지인 경우 결과는 언더로 처리됩니다.
- 합이 7이면 결과는 7이며, 합이 8부터 12까지인 경우 결과는 오버로 처리됩니다.

# 화면 구성

![image](https://github.com/mossland/Hackathon/assets/13128375/331f8177-e503-403c-a3b4-5e82a3b03b02)
![image](https://github.com/mossland/Hackathon/assets/13128375/242d476b-3b72-4bf0-a7b7-1bf8db7beee8)

1. 사운드 On/Off버튼
2. 플레이어 이름
3. 보유 포인트
4. 레드 주사위 눈과 주사위 숫자
5. 블루 주사위 눈과 주사위 숫자
6. 주사와 합 결과
7. 시작 버튼
8. 언더, 7, 오버 선택버튼
9. 결과 팝업 승패 텍스트
10. 승리시 획득 포인트

# 플레이 방법
1. 게임을 시작하기 전, 금액을 선택합니다.

![image](https://github.com/mossland/Hackathon/assets/13128375/d27ba782-0e2b-47bc-9177-131d7dde4497)


2. 플레이어는 두 주사위의 합이 언더일지 7일지 오버일지 예측합니다..

![image](https://github.com/mossland/Hackathon/assets/13128375/ad351887-aea1-4e8b-b049-1ead0f3f3880)


3. 선택이 완료되면 결과가 공개됩니다.

![image](https://github.com/mossland/Hackathon/assets/13128375/2241294b-f72c-4eb4-a0b3-dd908f706c8c)


4. 주사위 합 결과 부분에서 언더인지 7인지 오버인지 확인할 수 있습니다.

![image](https://github.com/mossland/Hackathon/assets/13128375/51bf7269-0a1e-4c46-a13a-a25cc2dc96a2)


5. 다시한번 팝업을통해 게임결과를 확인할 수 있습니다.

![image](https://github.com/mossland/Hackathon/assets/13128375/da838385-e7bc-43f9-bef9-41c006a18dfa)

# 실행

[npm](https://www.npmjs.com) 및 [http-server](https://www.npmjs.com/package/http-server)를 전역으로 설치합니다.
```
npm install --global http-server
```

프로젝트를 다운로드한 폴더에서 http-server를 실행한 후,   
로컬호스트로 접속하여 간단한 테스트를 진행할 수 있습니다.

# 플레이 영상

![demo](https://github.com/mossland/Hackathon/assets/13128375/cb872ad7-18ab-49fe-961d-55051ec39db2)

# 데모 페이지
- [데모 페이지](http://asset.moss.land/Lucky7Dice/index.html)

# Credits
PlayCanvas WebGL: https://playcanvas.com/
