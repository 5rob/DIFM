/* DIFM Tax Guide Entry Point */
console.log('DIFM canvas initialized');

document.getElementById('canvas-app').addEventListener('doubleclick', (e) => {
  alert('Tap and hold to add your answer.\nClick browser embed to confirm action.\nPress \u23ce to continue.');
});

// Signal completion to parent agent
window.difmReady = true;