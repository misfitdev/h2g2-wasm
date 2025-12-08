## Security Audit Report

Here is the security audit report for the current pull request.

### 1. Critical Vulnerability: Arbitrary Code Execution via WASM Save State Restoration

**Severity:** Critical
**Location:** WASM module (`h2g2_wasm.wasm`), specifically its save state restoration logic.

**Description:**
The WASM module's save state restoration logic directly manipulates the WASM module's memory using a byte array derived from user-controlled save state data. This data is base64 decoded and then used to populate memory.

The parsing logic within the WASM module, particularly in functions responsible for reading chunks and stack bodies from the save data (as observed in the `quetzal.rs` and `zmachine.rs` Rust source code, which is compiled into the WASM), involves reading specific byte lengths and offsets from the provided save data. This process is highly vulnerable to crafted input:
*   In functions like `read_chunk`, `body_length` is constructed from 4 bytes of input. A large `body_length` could lead to an out-of-bounds read when slicing memory, causing a panic (Denial of Service).
*   Similarly, in functions like `read_stks_body`, the calculation of `end` for slicing can also lead to out-of-bounds reads if crafted input causes `end` to exceed the bounds of the provided data.

An attacker can craft a malicious save state (e.g., via `localStorage` manipulation or a URL parameter) and inject it into the WASM module's restore function. Since this logic directly writes this untrusted and inadequately validated data into the WASM memory, it creates an arbitrary code execution vulnerability within the WebAssembly module. This can lead to a full compromise of the client-side application, including persistent Cross-Site Scripting (XSS), data exfiltration, or other malicious activities.

**Recommendation:**
This is a critical vulnerability that requires a robust solution. The save state data must be thoroughly validated and sanitized before it is used to manipulate memory within the WASM module.

*   **Implement strict validation:** Define a strict schema for what a valid save state should look like (e.g., expected data types, ranges, lengths for various memory segments). Any incoming save state must be validated against this schema, and any deviations should be rejected.
*   **Memory safety checks:** Ensure that memory write operations within the WASM module's restore logic (and related functions) perform bounds checking to prevent writing outside allocated memory regions. **Specifically, ensure that calculated lengths and offsets do not exceed the provided data's boundaries.**
*   **Deserialization safety:** If any part of the save state involves deserializing complex data structures, use a deserialization mechanism that is not susceptible to gadget chain attacks.
*   **Isolate WASM execution:** Consider running the WASM module in a more sandboxed environment, if feasible, although this may introduce performance overhead.

Given the direct memory manipulation, careful and comprehensive validation of all incoming save state data is paramount.
