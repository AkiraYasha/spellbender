WASI_SDK_PATH = ${shell pwd}/../wasi-sdk-20.0

CC = $(WASI_SDK_PATH)/bin/clang --sysroot=$(WASI_SDK_PATH)/share/wasi-sysroot
LD = $(WASI_SDK_PATH)/bin/wasm-ld $(WASI_SDK_PATH)/share/wasi-sysroot/lib/wasm32-wasi/libc.a

CFLAGS += -DEMSCRIPTEN
CFLAGS += -DCONFIG_VERSION=\"spellbender\"
CFLAGS += -Oz


build: out out.wasm

clean:
	rm -rf out

out:
	mkdir out

out/%.o: %.c
	$(CC) -c $^ -o $@ $(CFLAGS)

out.wasm: out/api.o out/quickjs.o out/cutils.o out/libregexp.o out/libunicode.o out/libbf.o
	$(LD) $^ -o out/$@ \
		--no-entry \
		--export=malloc \
		--export=free \
		--export=JS_NewContext \
		--export=JS_NewRuntime \
		--export=SB_Init \
		--export=SB_Eval \
		--allow-undefined-file=imports.syms

.PHONY: build
