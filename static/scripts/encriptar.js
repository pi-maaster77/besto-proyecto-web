export async function sha256(message) {
    // Convierte el mensaje a un array de bytes
    const msgBuffer = new TextEncoder().encode(message);
  
    // Genera el hash usando la API SubtleCrypto
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  
    // Convierte el ArrayBuffer a un Array de bytes
    const hashArray = Array.from(new Uint8Array(hashBuffer));
  
    // Convierte los bytes a una cadena hexadecimal
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  }
  
  // Ejemplo de uso
  