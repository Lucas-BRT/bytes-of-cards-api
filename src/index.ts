import app from "./server";
import db from "./database";
import env from "./env";

async function main() {
  try {
    // testa se o banco subiu corretamente
    await db.$queryRaw`SELECT 1`;

    app.listen(env.APP_PORT, () => {
      console.log(`Listening on http://localhost:${env.APP_PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed!", error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

main();
