import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";

export const auth = betterAuth({
  database: new Pool({
    connectionString: `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies()],
  // schema: {
  //   user: "user",
  //   session: "session",
  //   account: "account",
  //   verification: "verification",
  // },
  // other config...
});
