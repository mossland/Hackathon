![hackathon](https://user-images.githubusercontent.com/109493423/196602490-c73a44f0-16f8-4321-9538-244b3e6fc09d.png)

# Mossland Hackathon

This repository is the **playground for Mossland Hackathon**:  
a place for MossCoin-related ideas, Mossland ecosystem services (including Mossverse mini-services),  
and lightweight projects you want to start quickly.

You can use this repository to:

- Propose and prototype **MossCoin (MOC) use cases** (payments, rewards, governance, machine-to-machine, etc.),
- Experiment with **Mossverse (Mossland Metaverse) mini-services**,
- Start any **small, hackathon-style project** connected to the Mossland ecosystem.

This repository is where anyone can suggest ideas and participate in development –  
especially during hackathons and community events.

> 💡 **Short-term experiments start here.  
> Long-term projects can be promoted to the**  
> [`MosslandDeveloperSupportProgram`](https://github.com/mossland/MosslandDeveloperSupportProgram)  
> and proposed to the DAO (Agora) for MOC grants.

---

## 🎯 Repository Role

- Entry point for **Mossland hackathons, university programs, and idea-thons**.
- Space for:
  - Quick prototypes
  - Experimental MossCoin / Mossland ecosystem ideas
  - Mossverse mini-services
  - Proof-of-concept implementations
- Code here **does not need to be production-ready**. It’s okay to be rough as long as the idea and structure are visible.

Organizers may create event-specific folders and instructions under this repository for each hackathon.

---

## 🏆 Events & MOC Rewards

Mossland runs both **internal company hackathons** and **public hackathons**,  
often with **MossCoin (MOC)** as prize or reward for top teams.

- **Regularly:**
  - Internal hackathons for Mossland team members
  - Public hackathons with open participation (students, external developers, etc.)
  - Winners and outstanding teams receive MossCoin (MOC) as prizes.

- **Irregularly (ad-hoc):**
  - Ideas, documents, or code that are pushed to this repository outside of official events
    may also be reviewed by the Mossland team.
  - When a contribution is considered meaningful for the Mossland ecosystem,
    the team may grant **MossCoin (MOC) rewards** through an irregular review process.

Promising projects from both regular events and ad-hoc contributions can be promoted to the  
[`MosslandDeveloperSupportProgram`](https://github.com/mossland/MosslandDeveloperSupportProgram)  
and then proposed to the DAO (Agora) for longer-term MOC grants.

---

## 🚀 How to Participate

> The exact process may be slightly customized per event,  
> but the general flow is:

1. **Check the current event section**
   - Look for `Current / Example Challenges` in this README or pinned issues.
   - Confirm which challenge/theme you want to join.

2. **Register your team (optional but recommended)**
   - Open a new Issue with:
     - Team name
     - Members
     - Short idea description
   - Event organizers may provide an Issue template like `Team Registration`.

3. **Create your team folder**
   - Inside this repository, create a folder such as:
     - `teams/<team-name>/`
   - Put your:
     - Idea documents / PRD
     - Slides or wireframes
     - Source code / prototypes

4. **Submit a Pull Request**
   - Create a PR from your branch to `main` with:
     - Problem definition
     - Proposed solution
     - How to run / demo (URL, screenshots, commands)
     - Whether you’re interested in continuing after the hackathon

5. **After the hackathon**
   - The Mossland team will review promising projects.
   - If a project has long-term potential, it may be:
     - Linked or moved into the [`MosslandDeveloperSupportProgram`](https://github.com/mossland/MosslandDeveloperSupportProgram) repository.
     - Prepared as a proposal to **Mossland DAO via Agora** for potential MOC funding.

---

## 🧪 Current / Example Challenges

Organizers can add active hackathon descriptions here.

For example:

- **Mossland Hackathon – MossCoin & Mini-service Challenge**
  - Build something that:
    - Uses **MossCoin (MOC)** in an interesting way (payments, rewards, DAO, machine-to-machine, etc.), or
    - Runs as a mini-service inside Mossverse (Mossland Metaverse).
  - Focus on:
    - Clear use case for MossCoin or Mossland ecosystem
    - Fun or useful user experience
    - Potential to grow into a long-term open source project

If there is no active event, you can still:

- Fork this repo
- Try the reference implementations below
- Propose your own idea or mini-service via PR or by contacting **contact@moss.land**

---

## 🧱 Reference Implementations

Below are example implementations that can be used as references or extended in new projects.

### 1. Provably Fair System

A provably fair system ensures transparency and fairness in online gambling.  
It uses cryptographic algorithms to prove that games are not manipulated.  
Players can verify the fairness of outcomes by checking seed generation and result disclosure.  
Trust is enhanced through transparency and verifiability.  
See [Wikipedia](https://simple.wikipedia.org/wiki/Provably_Fair) for a simple explanation.

- [.NET Implementation](https://github.com/mossland/Hackathon/tree/main/provably_fair_implementation/provably_fair)
- [Kotlin Implementation](https://github.com/mossland/Hackathon/tree/main/provably_fair_implementation/provably_fair_kotlin)
- [Java Implementation](https://github.com/mossland/Hackathon/tree/main/provably_fair_implementation/provably_fair_java)

These can be combined with the mini-games below or reused as a building block in new services.

---

## 🎮 Mini-services

### 1. Rock Paper Scissors

- Folder: [`Rock Paper Scissors`](RockPaperScissors/README.md)
- The user selects one of rock, paper, or scissors.
- The game proceeds and win or loss is confirmed.
- When you win, you get a profit of 1 ~ 10 times of the multiplier.

### 2. THUG War

- Folder: [`THUG War`](thug_war/README.md)
- The starting THUG character appears, and the user must guess whether the character ID is higher or lower than the starting character.
- THUG character IDs are displayed in ascending order on the top of the screen.

### 3. Holy Gali

- Folder: [`Holy Gali`](HGOE/README.md)
- A mini-game inspired by the Halligali card game.
- This is an odd-even game made using the card design of the Halligali card game.

### 4. Lucky7

- Folder: [`Lucky7`](Lucky7Dice/README.md)
- A game of predicting whether the sum of two dice is greater than or less than 7.

You can:

- Fork these mini-services
- Change rules, visuals, or rewards
- Combine them with the provably fair system
- Or build entirely new services or MossCoin use cases following a similar structure

---

## 👋 Community & Questions

- Discord: https://discord.com/invite/N6RCGZuDqV  
  - You can ask questions about:
    - How to participate in Mossland Hackathon
    - How to connect your project to MossCoin or Mossverse
    - How to apply for the Developer Support Program and DAO grants

---

---

## 🇰🇷 모스랜드 해커톤 리포지토리 소개

이 리포지토리는 **Mossland Hackathon**을 위한 놀이터입니다.  
모스코인(MOC)과 관련된 다양한 아이디어, 모스랜드 생태계 서비스(모스버스 미니서비스 포함),  
그리고 **가볍게 시작해볼 수 있는 작은 프로젝트들**을 올리는 공간입니다.

이 리포지토리를 통해:

- **모스코인 활용 아이디어**(결제, 리워드, 거버넌스, M2M 등)를 제안하고,
- **모스버스(모스랜드 메타버스)의 미니서비스**를 실험하거나,
- 모스랜드 생태계와 연결된 **작은 해커톤형 프로젝트**를 시작할 수 있습니다.

특히 해커톤·커뮤니티 이벤트 기간에는, 누구나 이 리포지토리를 통해 아이디어를 제안하고 개발에 참여할 수 있습니다.

> 💡 **단기 실험은 이곳에서 시작하고,  
> 장기적으로 키우고 싶은 프로젝트는**  
> [`MosslandDeveloperSupportProgram`](https://github.com/mossland/MosslandDeveloperSupportProgram) 리포로 승격된 뒤  
> DAO(Agora)를 통해 MOC 지원금을 신청할 수 있습니다.

---

## 🎯 리포지토리 역할

- 모스랜드와 함께하는 **해커톤, 대학교 연계 프로그램, 아이디어톤**의 공식 진입점
- 아래와 같은 것들을 올리는 공간:
  - 빠른 프로토타입
  - 실험적인 모스코인/모스랜드 생태계 아이디어
  - 모스버스 미니서비스
  - Proof-of-Concept(개념 증명) 구현
- 이 리포지토리의 코드는 **완성도가 높을 필요가 없습니다.**  
  아이디어와 구조만 잘 보이면 충분합니다.

각 해커톤마다, 주최 측이 이 리포지토리 하위에 이벤트 전용 폴더와 안내 문서를 추가할 수 있습니다.

---

## 🏆 이벤트 & MOC 보상

모스랜드는 **사내 해커톤**과 **공개 해커톤**을 정기적으로 진행하며,  
우수 팀에게는 **모스코인(MOC)** 을 상금/보상으로 지급하기도 합니다.

- **정기적으로:**
  - 모스랜드 구성원을 대상으로 한 사내 해커톤
  - 학생·외부 개발자도 참여 가능한 공개 해커톤
  - 상위 팀 및 우수 팀에게 모스코인(MOC) 상금/보상이 지급됩니다.

- **비정기적으로:**
  - 공식 이벤트 기간이 아니더라도, 이 리포지토리에 올라온 아이디어, 문서, 코드(push 등)를
    모스랜드 팀이 수시로 검토할 수 있습니다.
  - 모스랜드 생태계에 의미 있는 기여라고 판단되는 경우,
    **모스코인(MOC) 지원금**을 비정기적인 심사를 통해 지급하기도 합니다.

정기 해커톤과 비정기 기여 모두,  
유망한 프로젝트는 [`MosslandDeveloperSupportProgram`](https://github.com/mossland/MosslandDeveloperSupportProgram) 으로 승격되어  
DAO(Agora)를 통한 장기적인 MOC 지원금 심사로 이어질 수 있습니다.

---

## 🚀 참여 방법

> 이벤트마다 상세 규칙은 조금씩 다를 수 있지만,  
> 기본적인 흐름은 아래와 같습니다.

1. **현재 진행 중인 이벤트 확인**
   - 이 README 의 `Current / Example Challenges` 섹션 또는 pinned issue 를 확인합니다.
   - 참가하고 싶은 챌린지/주제를 고릅니다.

2. **팀 등록 (선택이지만 권장)**
   - 새 Issue 를 열고 다음 내용을 작성합니다:
     - 팀 이름
     - 팀원
     - 간단한 아이디어 설명
   - 주최 측에서 `Team Registration` 같은 이슈 템플릿을 제공할 수도 있습니다.

3. **팀 폴더 생성**
   - 이 리포지토리 내에 아래와 같은 폴더를 생성합니다:
     - `teams/<team-name>/`
   - 그 안에 다음 내용을 넣습니다:
     - 아이디어 문서 / PRD
     - 슬라이드 또는 와이어프레임
     - 소스 코드 / 프로토타입

4. **Pull Request 제출**
   - 작업 브랜치에서 `main`으로 PR을 생성하고 다음을 포함합니다:
     - 문제 정의
     - 제안 솔루션
     - 실행 방법 / 데모 방법 (URL, 스크린샷, 명령어 등)
     - 해커톤 이후에도 계속 개발을 이어가고 싶은지 여부

5. **해커톤 이후**
   - 모스랜드 팀이 제출된 프로젝트 중 유망한 것들을 검토합니다.
   - 장기적으로 발전 가능성이 있는 프로젝트는:
     - [`MosslandDeveloperSupportProgram`](https://github.com/mossland/MosslandDeveloperSupportProgram) 리포와 연결되거나 이동될 수 있고,
     - **Mossland DAO(Agora)** 에 제안으로 상정되어 MOC 지원금을 받을 수 있는 후보가 됩니다.

---

## 🧪 현재/예시 챌린지

운영자는 여기 영역에 진행 중인 해커톤 설명을 추가할 수 있습니다.

예시:

- **Mossland Hackathon – MossCoin & Mini-service Challenge**
  - 아래 중 하나 이상을 만족하는 프로젝트를 제작:
    - **모스코인(MOC)** 을 흥미롭게 활용하는 서비스 (결제, 리워드, DAO, M2M 등), 또는
    - 모스버스(Mossverse) 안에서 동작하는 미니서비스.
  - 중점 포인트:
    - 모스코인 또는 모스랜드 생태계와의 명확한 연결성
    - 재미있거나 유용한 사용자 경험
    - 장기 오픈소스 프로젝트로 성장할 수 있는 잠재력

현재 진행 중인 이벤트가 없더라도, 여러분은:

- 이 리포지토리를 fork 해서
- 아래 레퍼런스 구현들을 직접 실행해보고
- 새로운 아이디어나 미니서비스를 PR 또는 **contact@moss.land** 로 제안할 수 있습니다.

---

## 🧱 레퍼런스 구현

아래는 새로운 프로젝트를 만들 때 참고하거나 확장할 수 있는 예시 구현들입니다.

### 1. Provably Fair 시스템

Provably Fair 시스템은 온라인 게임(특히 도박/베팅)의 **투명성과 공정성**을 보장하기 위한 방식입니다.  
암호학적 알고리즘을 사용해, 게임 결과가 조작되지 않았음을 증명합니다.  
플레이어는 시드(seed) 생성 과정과 결과 공개를 검증함으로써, 결과의 공정성을 확인할 수 있습니다.  
이로 인해 투명성과 검증 가능성이 높아지고, 신뢰도가 향상됩니다.

- [.NET 구현](https://github.com/mossland/Hackathon/tree/main/provably_fair_implementation/provably_fair)
- [Kotlin 구현](https://github.com/mossland/Hackathon/tree/main/provably_fair_implementation/provably_fair_kotlin)
- [Java 구현](https://github.com/mossland/Hackathon/tree/main/provably_fair_implementation/provably_fair_java)

아래 미니게임들과 결합하거나, 새로운 서비스의 기본 블록으로 재사용할 수 있습니다.

---

## 🎮 미니서비스 목록

### 1. 가위바위보 (Rock Paper Scissors)

- 폴더: [`Rock Paper Scissors`](RockPaperScissors/README.md)
- 사용자가 가위/바위/보 중 하나를 선택합니다.
- 게임이 진행되고 승패가 결정됩니다.
- 승리 시, 배율에 따라 1 ~ 10배 이익을 얻습니다.

### 2. THUG War

- 폴더: [`THUG War`](thug_war/README.md)
- 시작 THUG 캐릭터가 등장하고, 사용자는 다음 캐릭터 ID가 더 높을지/낮을지를 맞춰야 합니다.
- 상단에는 THUG 캐릭터 ID 목록이 오름차순으로 표시됩니다.

### 3. Holy Gali

- 폴더: [`Holy Gali`](HGOE/README.md)
- Halli Galli 카드 게임에서 영감을 얻은 미니게임입니다.
- Halli Galli 카드 디자인을 활용한 **홀짝(odd–even) 게임** 형태로 구성되어 있습니다.

### 4. Lucky7

- 폴더: [`Lucky7`](Lucky7Dice/README.md)
- 주사위 두 개의 합이 7보다 클지/작을지 예측하는 게임입니다.

여러분은:

- 이 미니서비스들을 fork 해서 규칙/비주얼/보상 구조를 바꾸거나,
- Provably Fair 시스템과 결합해 보안성과 신뢰도를 높이거나,
- 이와 비슷한 구조를 참고해 **완전히 새로운 서비스나 모스코인 활용 사례**를 만들 수 있습니다.

---

## 👋 커뮤니티 & 문의

- 디스코드: https://discord.com/invite/N6RCGZuDqV  
  - 예를 들어 이런 내용을 편하게 질문하실 수 있습니다:
    - Mossland Hackathon 참여 방법
    - 프로젝트를 모스코인 또는 모스버스와 어떻게 연동하는지
    - Developer Support Program 및 DAO 지원금 신청 방법
