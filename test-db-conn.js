const { Client } = require("pg");

const url = process.env.DATABASE_URL || "";

(async () => {
  if (!url) {
    console.log("DATABASE_URL NOT FOUND");
    return;
  }

  console.log("Trying DB connection...");
  try {
    const client = new Client({
      connectionString: url,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    console.log("✅ Connected to database successfully!");

    const res = await client.query("SELECT NOW()");
    console.log("DB Time:", res.rows);

    await client.end();
  } catch (err) {
    console.error("❌ DB Connection Failed");
    console.error(err);
  }
})();
