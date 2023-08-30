![hackathon](https://user-images.githubusercontent.com/109493423/196602490-c73a44f0-16f8-4321-9538-244b3e6fc09d.png)

# Higher
- 두장의 카드중 높은 숫자의 카드를 예측하는 게임

# 게임 설명
- 이 게임은 1부터 13까지의 네 종류로 된 카드 덱을 사용합니다. 
- RED와 BLUE가 각각 카드를 받고, 이들 중에서 숫자가 높은 카드가 승리하는 게임입니다. 
- 단, 두 카드의 숫자가 동일하면 TIE가 승리합니다.
- 플레이어는 RED나 BLUE 중에서 승리할 카드를 예측하여 선택합니다. 
- 만약 예측이 성공하여 RED나 BLUE가 승리한 경우, 두 배의 보상을 받게 됩니다. 
- 또한, TIE 승리를 예측한 경우에는 8배의 보상을 얻을 수 있습니다.

# 화면 구성

![image](https://github.com/mossland/Hackathon/assets/13128375/2b7e1e50-d27c-41eb-b6df-198f02000891)

1. 유저 아이디
2. 보유 포인트
3. 레드카드
4. 블루카드
5. 승부 결과 표시
6. START버튼, RED카드 선택버튼, TIE 선택버튼, BLUE카드 선택버튼

# 플레이 방법
1. <kbd>START</kbd>버튼을 눌러 게임을 시작하고 원하는 금액을 설정합니다.

![image](https://github.com/mossland/Hackathon/assets/13128375/0aeb1de7-661f-4b0b-86d1-3f791b8b251b)

2. 두 장의 카드 중에서 이기는 카드 색상을 선택합니다. <kbd>RED</kbd> <kbd>TIE</kbd> <kbd>BLUE</kbd> 중에서 하나를 고를 수 있습니다.

![image](https://github.com/mossland/Hackathon/assets/13128375/1a14e27d-0302-4fd2-8413-64d38419ecf3)

3. 두 장의 카드가 오픈되며, 숫자가 더 큰 카드가 승리합니다.

![image](https://github.com/mossland/Hackathon/assets/13128375/710f8929-5c7e-4bd4-95c5-50d3cbd94e5c)
![image](https://github.com/mossland/Hackathon/assets/13128375/89d826aa-f8e8-4b5f-83c2-56551d77d548)

4. 만약 승리하는 카드를 정확하게 예측하면, RED와 BLUE는 2배, TIE는 8배의 보상을 받을 수 있습니다.

![image](https://github.com/mossland/Hackathon/assets/13128375/fcaa1f96-d3cc-4317-b760-01a4f776fd49)
![image](https://github.com/mossland/Hackathon/assets/13128375/ccd990f1-240a-4fa8-8fb5-0806ffd934d1)

# 실행
[npm](https://www.npmjs.com) 및 [http-server](https://www.npmjs.com/package/http-server)를 전역으로 설치합니다.
```
npm install --global http-server
```

프로젝트를 다운로드한 폴더에서 http-server를 실행한 후,   
로컬호스트로 접속하여 간단한 테스트를 진행할 수 있습니다.

# 플레이 영상
![h-play](https://github.com/mossland/Hackathon/assets/13128375/965af1e9-6775-43dc-a4bf-77b716e11643)

# 데모 페이지
[데모 페이지](http://asset.moss.land/Higher/index.html)

# Credits
PlayCanvas WebGL: https://playcanvas.com/
