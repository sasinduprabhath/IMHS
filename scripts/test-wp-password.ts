import bcrypt from "bcryptjs";

async function main() {
  const wpHash = "$wp$2y$10$CwQrNwTgYYTiUBsCOd9rWObWEzIH00XZcB1j0lnbp0.nosqlf1s26";
  const standardBcrypt = wpHash.replace(/^\$wp\$/, "");
  console.log("Original WP Hash:", wpHash);
  console.log("Standard Bcrypt Hash:", standardBcrypt);
}

main();
