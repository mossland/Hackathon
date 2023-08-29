![hackathon](https://user-images.githubusercontent.com/109493423/196602490-c73a44f0-16f8-4321-9538-244b3e6fc09d.png)

# RockPaperScissors

- 가위, 바위, 보 중에서 하나를 선택하여 진행하는 게임입니다

# 게임 설명

- 플레이어는 가위, 바위, 보 중에서 선택하여 승부하는 게임입니다.
- 승부 결과는 승리, 패배, 무승부 중 하나로 결정됩니다
- 승리할 경우에는 1, 2, 4, 7, 10 중 하나의 배율에 따라 수익을 얻게 됩니다.
- 무승부는 게임 포인트를 잃지 않습니다.
- 가위 vs 바위: 바위가 승리합니다. 
- 바위 vs 보: 보가 승리합니다.
- 보 vs 가위: 가위가 승리합니다. 
- 같은 손동작끼리는 비깁니다

# 화면 구성

![캡처_2023_08_29_18_17_09_922](https://github.com/mossland/Hackathon/assets/13128375/941fce59-0711-427d-be00-3a646e9f6986)
![캡처_2023_08_29_18_42_29_562](https://github.com/mossland/Hackathon/assets/13128375/191c4b79-d125-470b-8ce2-63da86791ccc)

1. 보유 포인트
2. 승리 UI
3. 패배 UI
4. 무승부 UI
5. 사운드 On/Off버튼
6. 가위/바위/보 선택버튼
7. 포인트 선택 버튼
8. 가위/바위/보 결과 UI
9. 승/패/무승부 결과
10. 승리시 배율
11. 승리시 획득 포인트

# 플레이 방법
1. 게임을 시작하기 전, 금액을 선택합니다.

![캡처_2023_08_29_18_59_43_693](https://github.com/mossland/Hackathon/assets/13128375/0c6b882b-70cf-4561-a7da-2e839257bf42)

2. 플레이어는 가위, 바위, 보 중에서 이길 것으로 예상하는 손 모양을 선택합니다.

![캡처_2023_08_29_18_59_51_314](https://github.com/mossland/Hackathon/assets/13128375/44bda366-8224-414f-a785-1d28d6517d83)

3. 선택이 완료되면 결과가 공개됩니다.

![캡처_2023_08_29_19_00_03_166](https://github.com/mossland/Hackathon/assets/13128375/d2afa1a4-69c3-4fd0-a3c9-df886f10ec5d)

4. 결과가 승리인지 무승부인지 패배인지 확인할 수 있습니다.

![캡처_2023_08_29_19_00_55_733](https://github.com/mossland/Hackathon/assets/13128375/6ff7ccd3-8878-4c31-8ee1-cb2d6070aaa2)
![캡처_2023_08_29_19_01_08_610](https://github.com/mossland/Hackathon/assets/13128375/a1a5bb4d-ff10-4518-94b1-cd11f7b44329)
![캡처_2023_08_29_19_01_03_476](https://github.com/mossland/Hackathon/assets/13128375/b6164074-9581-4b7c-8b89-9f86bd809620)

5. 승리한 경우 얻을 수 있는 배율을 확인할 수 있습니다.

![캡처_2023_08_29_19_02_52_167](https://github.com/mossland/Hackathon/assets/13128375/fad25da2-b6e1-4f29-97b9-9b9b8df9b42a)
![캡처_2023_08_29_19_02_49_979](https://github.com/mossland/Hackathon/assets/13128375/b4aec892-18ca-44e8-b64d-744ae9e42d25)
![캡처_2023_08_29_19_02_46_367](https://github.com/mossland/Hackathon/assets/13128375/8246ef9c-9c63-4315-9779-57b3f71e8c84)
![캡처_2023_08_29_19_02_40_522](https://github.com/mossland/Hackathon/assets/13128375/61ed6f0d-dbbe-471f-a778-214a288e8b89)
![캡처_2023_08_29_19_02_36_724](https://github.com/mossland/Hackathon/assets/13128375/14145435-bce3-4cbe-be57-0162cded7ce5)

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

![demo](https://github.com/mossland/Hackathon/assets/13128375/ef429832-366e-488e-8fe6-d80ff929158d)

# 데모 페이지
- [데모 페이지](http://asset.moss.land/RockPaperScissors/index.html)

# Credits
PlayCanvas WebGL: https://playcanvas.com/



