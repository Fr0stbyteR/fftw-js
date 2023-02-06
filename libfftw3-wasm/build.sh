#!/bin/bash

(
    cd fftw-3.3.10
    emconfigure ./configure --disable-fortran --enable-single --host=x86_64 && emmake make
)

make -f Makefile.emscripten

