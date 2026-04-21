// Polyfills for simple-peer
window.global = window;
global = window;

// Buffer polyfill
import { Buffer } from 'buffer';
window.Buffer = Buffer;
global.Buffer = Buffer;

// Process polyfill
window.process = window.process || {};
window.process.env = window.process.env || {};
global.process = window.process;