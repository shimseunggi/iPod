# iPod Classic Simulator

맥북에서 실행 가능한 macOS 앱 번들(`.app`)을 만들 수 있도록 빌드 스크립트를 추가했습니다.

## macOS 앱 만들기

> **macOS에서만** 아래 명령을 실행하세요.

```bash
chmod +x build_macos_app.sh
./build_macos_app.sh
```

### 앱이 안 만들어질 때

- `❌ macOS에서만 .app 생성이 가능합니다`가 보이면, 현재 OS가 macOS가 아닙니다.
- `❌ Xcode Command Line Tools가 필요합니다`가 보이면 아래 명령을 먼저 실행하세요.

```bash
xcode-select --install
```

- 어떤 경로에서 실행하더라도 스크립트가 프로젝트 루트로 이동해 빌드하도록 되어 있습니다.

빌드가 완료되면 다음 경로에 앱이 생성됩니다.

- `build/macos/iPod Classic Simulator.app`

실행:

```bash
open "build/macos/iPod Classic Simulator.app"
```

## 구성

- `macos/main.swift`: WKWebView 기반 macOS 런처
- `index.html`: 앱 UI (웹 기반 iPod 시뮬레이터)
- `build_macos_app.sh`: `.app` 생성 스크립트
