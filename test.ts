import "dotenv/config";
import { classifyComplaint } from "./src/lib/ml";

async function main() {
  const teks = "Sistem ingin ditutup permanen #85903. Hai, sistem ingin ditutup permanen saat saya mencoba membuka lewat HP. Selain itu, pembayaran saya juga mengalami kendala serupa, apakah ini bug sistem?";
  const res = await classifyComplaint(teks);
  console.log(res);
}

main();
