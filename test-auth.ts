import { authClient } from "./src/lib/auth/client"

async function test() {
  const result = await authClient.signIn.email({
    email: "test",
    password: "test",
    fetchOptions: {
      onSuccess: () => {
        
      }
    }
  });
  console.log(result);
}
