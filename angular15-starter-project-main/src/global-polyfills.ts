// src/global-polyfills.ts

// Vérifier si 'window' est défini pour éviter les erreurs dans des environnements de serveur
if (typeof window !== 'undefined') {
    // Définir 'global' si ce n'est pas déjà fait
    if (!window['global']) {
      window['global'] = window;
    }
  
    // Définir 'Buffer' si ce n'est pas déjà fait
    if (!window['Buffer']) {
      window['Buffer'] = require('buffer').Buffer;
    }
  
    // Définir 'process' si ce n'est pas déjà fait
    if (!window['process']) {
      window['process'] = require('process');
    }
  }
  