#!/usr/bin/env bash
set -euo pipefail
# Normal installations use the official builder. Cloud fallback uses the same official
# platform-tools compiler without writing to a read-only ~/.cache directory.
if [[ -n "${SHIMOPAY_PLATFORM_TOOLS:-}" ]]; then
 export PATH="$SHIMOPAY_PLATFORM_TOOLS/rust/bin:$SHIMOPAY_PLATFORM_TOOLS/llvm/bin:$PATH"
 export LD_LIBRARY_PATH="$SHIMOPAY_PLATFORM_TOOLS/rust/lib${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
 export CC="$SHIMOPAY_PLATFORM_TOOLS/llvm/bin/clang"
 export AR="$SHIMOPAY_PLATFORM_TOOLS/llvm/bin/llvm-ar"
 export CARGO_TARGET_SBPF_SOLANA_SOLANA_RUSTFLAGS='-Zremap-cwd-prefix='
 cargo build --manifest-path programs/shimopay/Cargo.toml --target sbpf-solana-solana --release --locked
 mkdir -p target/deploy
 "$SHIMOPAY_PLATFORM_TOOLS/llvm/bin/llvm-objcopy" --strip-all target/sbpf-solana-solana/release/shimopay_solana.so target/deploy/shimopay_solana.so
else
 cargo build-sbf --manifest-path programs/shimopay/Cargo.toml --sbf-out-dir target/deploy
fi
