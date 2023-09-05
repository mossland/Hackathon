![hackathon](https://user-images.githubusercontent.com/109493423/196602490-c73a44f0-16f8-4321-9538-244b3e6fc09d.png)

# RYB

- 3장의 카드 순서를 예측하는 게임
  
# 게임 설명

- 이 게임은 총 48장의 카드로 진행되면 1부터 12까지의 숫자가 적힌 4종류의 카드로 구성되어있습니다.
- 카드는 red, yellow, blue에 위치할 수 있습니다.
- 각각의 게임마다 1개의 덱에서 랜덤하게 3장을 뽑습니다.
- 3장을 순서대로 red, yellow, blue 위치에 놓습니다.
- 플레이어는 red, yellow, blue에 위치한 카드를 높은 순서대로 예측하는 게임입니다.
- 단, 같은 숫자의 경우 red, green, blue, white 순서로 크기를 비교합니다.
- 1게임당 1개의 덱을 사용합니다.
- 예측 성공 시 5배의 수익을 얻을 수 있습니다.

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
