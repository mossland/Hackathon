![hackathon](https://user-images.githubusercontent.com/109493423/196602490-c73a44f0-16f8-4321-9538-244b3e6fc09d.png)

# Lucky7Dice

- 두 주사위의 합이 7 보다 큰 수인지 작은 수인지 예측하는 게임
  
# 게임 설명

- 이 게임은 6면체 레드 주사위와 블루 주사위를 사용하여 진행됩니다.
- 게임이 시작되면 두 주사위의 합을 선택합니다. 선택할 수 있는 옵션은 "언더", "7", "오버" 세 가지입니다.
- 각각의 선택지에는 언더와 오버는 수익률이 2배이며, 7은 수익률이 5배입니다.
- 두 주사위의 합이 2부터 6까지인 경우 결과는 언더로 처리됩니다.
- 합이 7이면 결과는 7이며, 합이 8부터 12까지인 경우 결과는 오버로 처리됩니다.

# 화면 구성

![image](https://github.com/mossland/Hackathon/assets/13128375/8edcacb8-2f68-42e7-ab01-64d6ec0be15e)
![image](https://github.com/mossland/Hackathon/assets/13128375/28acc948-306a-4de6-bbf1-c629f0b2562c)

1. 사운드 On/Off버튼
2. 색상별 크기 비교 UI
3. 플레이어 이름
4. 보유 포인트
5. red, yellow, blue 카드 위치
6. 결과 순서 표시 UI
7. 색상 순서 선택 버튼
8. 시작 버튼
9. 결과 팝업 승패 텍스트
10. 승리시 획득 포인트

# 플레이 방법
1. 게임을 시작하기 전, 금액을 선택합니다.

![image](https://github.com/mossland/Hackathon/assets/13128375/21dee2eb-2a30-4be6-b0e0-24537e3ac2b9)

2. 플레이어는 red, yellow, blue 카드중 큰 순서를 예측합니다.

![image](https://github.com/mossland/Hackathon/assets/13128375/467de630-b90c-4492-8391-69cbeae41989)

3. 선택이 완료되면 결과가 공개됩니다. 해당위치에 red, yellow, blue 카드가 오픈됩니다.

![image](https://github.com/mossland/Hackathon/assets/13128375/e5872281-dbf6-4c9f-ab25-8a5287aafced)
![image](https://github.com/mossland/Hackathon/assets/13128375/fd097239-6ec0-4bd4-bae9-6a96bb49e237)

4. RESULT 부분에서 순서 결과를 확인할수있습니다.

![image](https://github.com/mossland/Hackathon/assets/13128375/9c11b720-7b41-4dc6-9a8b-e5bd137db9a5)
![image](https://github.com/mossland/Hackathon/assets/13128375/03acfddb-c561-475c-9367-45d22ca7174e)

5. 다시한번 팝업을통해 게임결과를 확인할수있습니다.

![image](https://github.com/mossland/Hackathon/assets/13128375/bd2785af-731f-4aac-9123-5ca92c637771)

6. 결과 팝업을 통해 게임 결과를 다시 확인할 수 있습니다.

![캡처_2023_08_29_19_00_26_13](https://github.com/mossland/Hackathon/assets/13128375/b62ad6cd-9dba-4361-9aff-d3b36a7eba07)

# 실행

[npm](https://www.npmjs.com) 및 [http-server](https://www.npmjs.com/package/http-server)를 전역으로 설치합니다.
```
npm install --global http-server
```

프로젝트를 다운로드한 폴더에서 http-server를 실행한 후,   
로컬호스트로 접속하여 간단한 테스트를 진행할 수 있습니다.

# 플레이 영상
![demo](https://github.com/mossland/Hackathon/assets/13128375/9b2111d7-75a0-4977-8b3a-0e3e7f413d7a)

# 데모 페이지
- [데모 페이지](http://asset.moss.land/RYB/index.html)

# Credits
PlayCanvas WebGL: https://playcanvas.com/

# Lucky7Dice
- 두 주사위의 합이 7 보다 큰 수인지 작은 수인지 예측하는 게임
```
1. 게임은 6면체 레드 주사위와 블루 주사위로 진행
2. 게임 시작 후 두 주사위의 합을 선택합니다.
3. 선택지는 7언더, 7, 7오버 중 하나를 선택할 수 있습니다.
4. 각각의 수익률은 7언더와 7오버는 2배, 7은 5배입니다.
5. 두 주사위의 합이 2~6까지는 7언더입니다.
6. 두 주사위의 합이 7은 7입니다.
7. 두 주사위의 합이 8~12까지는 7 오버입니다.

```
[데모 페이지](http://asset.moss.land/Lucky7Dice/index.html)

![dice_new_ui](https://user-images.githubusercontent.com/13128375/191919669-dc28f26c-72ef-435a-b150-ac2ed250f943.gif)
