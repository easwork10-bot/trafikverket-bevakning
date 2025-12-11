import { getCookie } from "./src/services/cookieStore.js";

async function test() {
  const userId = 1;
  const cookies = await getCookie(userId);

  console.log("YOUR SAVED COOKIES:");
  cookies.forEach(c => {
    console.log(
      `${c.name} = ${c.value}\n  domain=${c.domain}\n  expires=${c.expires}\n`
    );
  });
}

test();
