require('dotenv').config({ path: '.env' });
console.log("Loaded DATABASE_URL:", url ? (url.substring(0, 15) + "...") : "undefined");
console.log("Length:", url ? url.length : 0);
const gKey = process.env.GOOGLE_API_KEY;
console.log("Loaded GOOGLE_API_KEY:", gKey ? (gKey.substring(0, 5) + "...") : "undefined");
console.log("Key Length:", gKey ? gKey.length : 0);
