#!/bin/bash

(
    cd fftw-3.3.10
    emconfigure ./configure --disable-fortran --enable-single && emmake make
)

make -f Makefile.emscripten

