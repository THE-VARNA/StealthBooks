import { db } from "./src/lib/db";
async function main() {
  const walletAddress = "FakeWallet123";
  try {
    const newOrg = await db.organization.create({
      data: {
        name: "My Organization",
        slug: `org-${walletAddress.slice(0, 8).toLowerCase()}`,
        memberships: {
          create: {
            walletAddress,
            role: "OWNER"
          }
        }
      }
    });
    console.log("Success:", newOrg);
  } catch(e) {
    console.error("Prisma Error:", e);
  }
}
main();
