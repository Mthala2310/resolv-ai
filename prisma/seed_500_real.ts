import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { classifyComplaint } from "../src/lib/ml";
import { computePriority } from "../src/lib/priority";

const adapter = new PrismaPg({
  connectionString: `${process.env.DATABASE_URL}`,
});
const prisma = new PrismaClient({ adapter });

// --- GENERATOR KELUHAN UNIK ---
const subjects = [
  "Saya", "Akun saya", "Perusahaan kami", "Aplikasi ini", "Sistem",
  "Pembayaran saya", "Kartu kredit saya", "Tagihan bulan ini", "Paket langganan saya", "Fitur export"
];

const issues = [
  "mengalami error 500", "ditagih dua kali", "tidak bisa diakses", "ingin dibatalkan", "minta refund",
  "salah transfer", "loading sangat lama", "crash saat dibuka", "gagal login terus", "kurang responsif",
  "tidak sesuai ekspektasi", "belum aktif fiturnya", "menghilang dari dashboard", "terpotong saldonya tapi gagal", "ingin ditutup permanen"
];

const contexts = [
  "saat saya mencoba membuka lewat HP.", "sejak update versi terbaru.", "padahal saya sudah bayar kemarin.",
  "dan ini sangat menghambat pekerjaan tim.", "tolong segera diperbaiki.", "saya butuh uangnya kembali.",
  "apakah ada solusi cepat?", "saya sangat kecewa dengan ini.", "bagaimana prosedur pembatalannya?",
  "mohon pencerahannya secepatnya.", "ini terjadi berulang kali.", "saya tidak pernah mengaktifkan ini.",
  "apakah ini bug sistem?", "saya tunggu tanggapan dari tim support.", "sangat merugikan kami."
];

const greetings = [
  "Halo,", "Siang admin,", "Permisi,", "Tolong dibantu,", "Mohon maaf,", 
  "Dear tim support,", "Hai,", "Yth. Customer Service,", "Selamat pagi,"
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateUniqueComplaints(count: number) {
  const complaints = [];
  const usedTitles = new Set();

  for (let i = 0; i < count; i++) {
    let title = "";
    let desc = "";
    let attempts = 0;
    
    // Pastikan judul unik
    do {
      const sub = getRandomItem(subjects);
      const iss = getRandomItem(issues);
      title = `${sub} ${iss} #${Math.floor(Math.random() * 99999)}`;
      attempts++;
    } while (usedTitles.has(title) && attempts < 100);
    
    usedTitles.add(title);

    const greet = getRandomItem(greetings);
    const sub = getRandomItem(subjects);
    const iss = getRandomItem(issues);
    const ctx = getRandomItem(contexts);
    const ctx2 = getRandomItem(contexts);

    desc = `${greet} ${sub.toLowerCase()} ${iss} ${ctx} Selain itu, ${getRandomItem(subjects).toLowerCase()} juga mengalami kendala serupa, ${ctx2}`;

    complaints.push({ judul: title, deskripsi: desc });
  }

  return complaints;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log("🚀 Memulai proses seeding 400 keluhan UNIK via REAL AI mBERT SEQUENTIAL...");

  // 1) Cari customer
  let customer = await prisma.user.findFirst({
    where: { role: "customer" }
  });

  if (!customer) {
    customer = await prisma.user.create({
      data: {
        name: "User Penguji Unik",
        email: "penguji@resolv.ai",
        password: "password123",
        role: "customer"
      }
    });
  }
  
  const generated = generateUniqueComplaints(400);
  console.log(`✅ Berhasil meng-generate ${generated.length} teks keluhan unik.`);

  let successCount = 0;

  for (let i = 0; i < generated.length; i++) {
    const item = generated[i];
    const teks = `${item.judul}. ${item.deskripsi}`;
    
    let pred: any = null;
    let retries = 3;
    
    // Retry logic if HF Space rate limits
    while (retries > 0) {
      pred = await classifyComplaint(teks);
      if (pred.ok) break;
      console.log(`⚠️ Klasifikasi gagal: ${pred.error}. Retrying in 3s...`);
      await sleep(3000);
      retries--;
    }

    if (!pred || !pred.ok) {
      console.log(`❌ Gagal mengklasifikasikan item ke-${i+1} setelah retries. Dilewati.`);
      continue;
    }
    
    const prio = computePriority(pred.category, pred.confidence, teks);
    const kategori = pred.category;
    const confidence = pred.confidence;
    const prioritas = prio.priority;

    // Status
    const status = getRandomItem(["BARU", "DITINJAU", "DIPROSES", "SELESAI"]);
    const today = new Date();
    const randomPastDays = Math.floor(Math.random() * 14);
    const createdAt = new Date(today);
    createdAt.setDate(today.getDate() - randomPastDays);
    createdAt.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

    await prisma.complaint.create({
      data: {
        userId: customer!.id,
        judul: item.judul,
        deskripsi: item.deskripsi,
        kategoriPrediksi: kategori,
        confidenceKategori: confidence,
        prioritasPrediksi: prioritas,
        kategoriFinal: kategori, // Sesuai sistem
        prioritasFinal: prioritas, // Sesuai sistem
        status: status as any,
        createdAt,
        updatedAt: createdAt
      }
    });

    successCount++;
    console.log(`✨ Progress: ${successCount}/${generated.length} keluhan berhasil diklasifikasi AI & disimpan. [${kategori}]`);
    
    // Delay 1.5s per item to prevent HF Space from blocking us
    await sleep(1500);
  }

  console.log(`\n🎉 SELESAI! ${successCount} keluhan unik berhasil diproses oleh sistem AI.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
