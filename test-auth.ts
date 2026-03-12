import { createClient } from "@supabase/supabase-js";
import "dotenv/config";
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
async function run() {
  const { data: { users }, error } = await db.auth.admin.listUsers();
  console.log(users.map(u => `${u.id} - ${u.email} - ${u.app_metadata.provider}`).join("\n"));
}
run();
