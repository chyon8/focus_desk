# Focus Desk 앱 요약 및 정리

## 1. 앱 개요
**Focus Desk**는 사용자의 생산성 향상과 집중력 강화를 위해 설계된 데스크탑 애플리케이션입니다. Electron과 React를 기반으로 구축되었으며, 사용자가 자신만의 디지털 작업 공간(Desk)을 커스터마이징하고 다양한 위젯을 배치하여 몰입할 수 있는 환경을 제공합니다.

## 2. 주요 기능 (Key Features)

### 2.1. 작업 공간 (Spaces) & 테마
- **멀티 스페이스 지원**: 'Morning Focus', 'Deep Work' 등 상황에 맞는 여러 작업 공간을 생성하고 전환할 수 있습니다.
- **배경 커스터마이징**: 단색 컬러 또는 이미지 배경을 설정할 수 있습니다.
- **테마 모드**: 'LOFI'(감성적), 'REALISTIC'(현실적) 등 분위기에 맞는 테마를 선택할 수 있습니다.

### 2.2. 위젯 시스템 (Widgets)
다양한 생산성 도구를 드래그 앤 드롭으로 배치할 수 있는 위젯 시스템을 제공합니다.
- **할 일 관리 (Todo)**: 작업 목록 관리 및 완료 체크.
- **타이머 (Timer)**: 포모도로 타이머 등 집중 시간 관리.
- **캘린더 (Calendar)**: 일정 확인.
- **브라우저 (Browser)**: 앱 내에서 웹 탐색 가능.
- **메모 (Memo/Editor)**: 간단한 메모 작성 및 텍스트 편집.
- **칸반 보드 (Kanban)**: 작업 진행 상황 시각화.
- **유튜브 뮤직 (YoutubeMusic)**: 음악 재생.
- **기타**: 시계(Clock), 사진(Photo), 캔버스(Canvas/Whiteboard), 리더(Reader).

### 2.3. 앰비언스 사운드 (Ambience)
집중력을 높여주는 백색 소음을 믹싱하여 재생할 수 있습니다.
- **소운드 종류**: 빗소리(Rain), 장작 타는 소리(Fire), 카페 소음(Cafe).
- **볼륨 조절**: 각 소리의 볼륨을 개별적으로 조절하여 나만의 분위기를 조성할 수 있습니다.

### 2.4. 포커스 세션 & 통계
- **세션 관리**: 집중 시간을 기록하고 관리합니다.
- **통계 (Focus Insights)**: 사용자의 집중 시간 패턴과 성과를 시각적으로 보여줍니다.

### 2.5. 유틸리티
- **데스크 공유 (Share Desk)**: 현재 구성한 데스크 셋업을 이미지로 캡처하여 공유할 수 있습니다.
- **단축키 (Keyboard Shortcuts)**: 키보드를 통한 빠른 제어 기능을 제공합니다.

## 3. 기술 스택 (Tech Stack)
- **Core**: [Electron](https://www.electronjs.org/), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (추정), Framer Motion (애니메이션)
- **Icons**: Lucide React
- **Utils**: html2canvas (스크린샷 캡처)

## 4. 프로젝트 구조 (Project Structure)
- **`/electron`**: Electron 메인 프로세스 및 프리로드 스크립트.
- **`/src`**
    - **`App.tsx`**: 메인 애플리케이션 로직, 상태 관리 (Space, Widget, Audio 등).
    - **`/components`**: UI 컴포넌트 (`AmbienceDock`, `FocusSessionBar`, `Sidebar` 등).
        - **`/widgets`**: 개별 위젯 컴포넌트 모음 (`TodoWidget`, `TimerWidget`, `CalendarWidget` 등).
    - **`/types.ts`**: 데이터 타입 정의 (Space, Widget, Ambience 등).

## 5. 요약
Focus Desk는 단순한 할 일 관리 도구를 넘어, 시각적/청각적 요소를 포함한 통합적인 "디지털 책상" 경험을 제공하는 생산성 플랫폼입니다. 유연한 위젯 시스템과 감성적인 앰비언스 기능을 통해 사용자가 가장 편안하게 집중할 수 있는 환경을 스스로 구축할 수 있도록 돕습니다.
