#!/usr/bin/env bash
# 受控构建脚本：禁止联网构建，只用本地 node_modules/.bin
#
# 背景（2026-10-27 OOM 事故）：
#   之前用 npx vue-cli-service build，npx 在 cwd 内找不到 .bin 时会去 registry 联网下载，
#   每次重试都拉新进程，本机 7.6G 内存被 35+ 个 build 进程吃光，
#   OOM killer 反复把 gateway 杀掉（2026-10-27 08:06 / 08:09 / 08:14）。
#
# 硬约束：
#   1) 只调用本地 node_modules/.bin 下的可执行文件，禁止 npx / npm exec / yarn dlx / pnpm dlx
#   2) 本地 bin 不存在 → 立即报错退出，不允许任何联网回退
#   3) NODE_OPTIONS 限制 V8 heap
#   4) systemd-run 隔离内存，避免 build 与 gateway 抢 cgroup 配额
#
# 用法: scripts/build.sh [client|store] [h5|mp]   默认: client mp
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${1:-client}"
PLATFORM="${2:-mp}"

case "$TARGET" in
  client|store) ;;
  *) echo "[build] 未知目标: $TARGET (可选 client|store)"; exit 1 ;;
esac

case "$PLATFORM" in
  h5) UNI_PLATFORM=h5 ;;
  mp) UNI_PLATFORM=mp-weixin ;;
  *) echo "[build] 未知平台: $PLATFORM (可选 h5|mp)"; exit 1 ;;
esac

APP_DIR="$ROOT/$TARGET"
cd "$APP_DIR" || { echo "[build] 找不到目录: $APP_DIR"; exit 1; }

# --- 关键：本地 bin 优先 ---
export PATH="$APP_DIR/node_modules/.bin:$PATH"

# --- 禁掉 npm 的联网回退 ---
export npm_config_yes=false
export npm_config_offline=true          # 真正禁止 npm 访问 registry
export npm_config_prefer_offline=true
export npm_config_audit=false
export npm_config_fund=false

# --- 限制 V8 heap ---
export NODE_OPTIONS="--max-old-space-size=1536"

export UNI_CLI_CONTEXT=.
export NODE_ENV=production
export UNI_PLATFORM

# 本仓库用 Vite 版 uni-app，构建入口是本地 uni bin（不是 vue-cli-service）
BIN="$APP_DIR/node_modules/.bin/uni"
if [[ ! -x "$BIN" ]]; then
  echo "[build] 致命：本地 uni 不存在 -> $BIN"
  echo "[build] 禁止用 npx 代替；请先执行: cd $APP_DIR && npm install"
  exit 1
fi

# 二次保险：确保 PATH 上没有会联网的包装器
if command -v npx >/dev/null 2>&1; then
  echo "[build] 提示：环境里有 npx，但本脚本不会调用它"
fi

echo "[build] 目标=$TARGET platform=$UNI_PLATFORM"
echo "[build] 使用本地 bin: $BIN"

BUILD_ARGS=(build)
if [[ "$PLATFORM" == "mp" ]]; then
  BUILD_ARGS+=( -p mp-weixin )
fi

# systemd-run 隔离：build 进程组内存上限 2G，与 gateway 隔离
if command -v systemd-run >/dev/null 2>&1 && \
   systemd-run --user --scope --quiet -p MemoryMax=2G -p MemoryHigh=1500M /bin/true 2>/dev/null; then
  exec systemd-run --user --scope --quiet \
    -p MemoryMax=2G -p MemoryHigh=1500M \
    --collect \
    "$BIN" "${BUILD_ARGS[@]}"
else
  echo "[build] systemd-run 不可用，回退到直接执行（仍有 NODE_OPTIONS heap 限制）"
  exec "$BIN" "${BUILD_ARGS[@]}"
fi
