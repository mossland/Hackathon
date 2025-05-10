# AI 기반 컴퓨터 견적 서비스

### Brief Description  
사용자가 컴퓨터의 활용 용도나 비용 등을 입력하면 AI 기반으로 하여 어떤 부품들이 들어가야 되는지 견적을 짜주는 서비스

### Problem Statement  
- 컴퓨터를 잘 모르는 초보자들은 자신의 활용 용도에 따라서 어느 정도의 성능과 비용이 필요한지 잘 모르는 경우가 많음
- 잘 알고 있다고 하더라도 일일히 사이트 들을 뒤져가며 찾아보기 힘듬

### Proposed Solution  
- 사용자가 컴퓨터를 신규로 구입했었을 때 어느 용도로 사용하는지 글로 입력하면 LLM으로 분석하여 견적을 짜줌
- 인터넷의 최신 데이터를 크롤링하여 데이터베이스를 들고 있고 MCP 등을 이용하여 LLM에 연동
- 추천한 견적으로 몇가지 보여주고 해당 제품으로 주문 연동까지 추후 구현
- 추후 판매점 등을 이용하여 수수료 모델도 고려

### Possible Challenges  
- 제품 추천 관련 정확도 확인 필요

---

### Author Information
- **Name:** Park Jeongwoo
- **Email:** jeong@moss.land
- **Submission Date:** May 10, 2025
