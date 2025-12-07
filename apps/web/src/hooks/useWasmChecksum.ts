import { useEffect, useState } from 'react';

export function useWasmChecksum(): string {
  const [checksum, setChecksum] = useState('loading...');

  useEffect(() => {
    async function calculateChecksum() {
      try {
        const response = await fetch('/h2g2_wasm_bg.wasm');
        const arrayBuffer = await response.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        setChecksum(hashHex.substring(0, 8)); // First 8 chars of SHA-256
      } catch (error) {
        console.error('Failed to calculate WASM checksum:', error);
        setChecksum('unknown');
      }
    }

    calculateChecksum();
  }, []);

  return checksum;
}
