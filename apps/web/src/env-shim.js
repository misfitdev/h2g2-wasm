// Get reference to WASM module for reading strings from memory
let wasmModule = null;

export const setWasmModule = (module) => {
  wasmModule = module;
};

export const js_message = (typePtr, msgPtr) => {
  if (!wasmModule) {
    console.log('[env-shim] js_message called but WASM module not set');
    return;
  }

  if (!wasmModule.memory) {
    console.error('[env-shim] WASM memory not available');
    return;
  }

  const memory = new Uint8Array(wasmModule.memory.buffer);

  const readCString = (ptr) => {
    let end = ptr;
    while (memory[end] !== 0) end++;
    const bytes = memory.slice(ptr, end);
    return new TextDecoder().decode(bytes);
  };

  const msgType = readCString(typePtr);
  const message = readCString(msgPtr);

  console.log('[env-shim] Message received:', msgType, '=', message);

  // Call store_message in WASM to save it
  if (wasmModule.store_message) {
    wasmModule.store_message(msgType, message);
  }
};
