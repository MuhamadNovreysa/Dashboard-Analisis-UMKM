// Strategy Scoring System untuk Dynamic Recommendations

// Step 1: Compute Condition Flags
function hitungKondisi(customer: any, benchmark: any) {
  const { avgTx, freq, recency, totalRevenue } = customer
  const { avgTxGlobal, freqP25, freqP75 } = benchmark

  return {
    avgTx_tinggi: avgTx > avgTxGlobal * 1.3,
    avgTx_sedang: avgTx >= avgTxGlobal * 1.1 && avgTx <= avgTxGlobal * 1.3,
    avgTx_rendah: avgTx < avgTxGlobal * 1.1,
    avgTx_sangat_rendah: avgTx < avgTxGlobal * 0.5,
    freq_tinggi: freq >= freqP75,
    freq_sedang: freq > freqP25 && freq < freqP75,
    freq_rendah: freq <= freqP25,
    recency_baru: recency < 30,
    recency_sedang: recency >= 30 && recency <= 60,
    recency_lama: recency > 60,
    totalRevenue_tinggi: totalRevenue > avgTxGlobal * 10,
  }
}

// Step 2: Score All Strategies
function pilihStrategi(customer: any, benchmark: any, pool: any[], topN = 3) {
  const kondisi = hitungKondisi(customer, benchmark)

  const scored = pool.map((s) => {
    const match = s.kondisi.filter((k: string) => kondisi[k as keyof typeof kondisi]).length
    const skor = s.kondisi.length === 0 ? 0 : match / s.kondisi.length + (match === s.kondisi.length ? 0.5 : 0)
    return { ...s, skor, match }
  })

  return scored.sort((a, b) => b.skor - a.skor || b.match - a.match).slice(0, topN)
}

// Step 3: Calculate Benchmark Values
export function calculateBenchmark(segments: any[]) {
  const allCustomers = segments.flatMap((seg) => seg.metricList || seg.customers || [])

  if (allCustomers.length === 0) {
    return { avgTxGlobal: 0, freqP25: 0, freqP75: 0 }
  }

  const avgTxValues = allCustomers.map((c: any) => c.monetary || 0)
  const freqValues = allCustomers.map((c: any) => c.frequency || 0)

  const avgTxGlobal = avgTxValues.reduce((a, b) => a + b, 0) / avgTxValues.length

  const sortedFreq = [...freqValues].sort((a, b) => a - b)
  const freqP25 = sortedFreq[Math.floor(sortedFreq.length * 0.25)] || 0
  const freqP75 = sortedFreq[Math.floor(sortedFreq.length * 0.75)] || 0

  return { avgTxGlobal, freqP25, freqP75 }
}

// Step 4: Strategy Pools
export const STRATEGY_POOLS = {
  "High Value": [
    { id: "HV-01", nama: "Program loyalitas berbasis poin — setiap pembelian dapat poin ditukar diskon atau hadiah", kondisi: ["freq_tinggi", "avgTx_tinggi"] },
    { id: "HV-02", nama: "Layanan pelanggan prioritas — antrian khusus atau pelayanan lebih cepat", kondisi: ["totalRevenue_tinggi", "freq_tinggi"] },
    { id: "HV-03", nama: "Early access penawaran — informasikan promo sebelum diumumkan ke publik", kondisi: ["freq_tinggi", "recency_baru"] },
    { id: "HV-04", nama: "Kartu pelanggan VIP dengan diskon tetap setiap transaksi 5–15%", kondisi: ["avgTx_tinggi", "freq_tinggi"] },
    { id: "HV-05", nama: "Undangan eksklusif event atau gathering khusus pelanggan setia", kondisi: ["totalRevenue_tinggi", "recency_baru"] },
    { id: "HV-06", nama: "Flash deal private — penawaran khusus tidak diumumkan ke publik", kondisi: ["recency_baru", "avgTx_tinggi"] },
    { id: "HV-07", nama: "Program referral premium — bonus lebih besar jika ajak teman belanja", kondisi: ["freq_tinggi", "recency_baru"] },
    { id: "HV-08", nama: "Hadiah gratis untuk setiap pembelian di atas nominal tertentu", kondisi: ["avgTx_tinggi", "totalRevenue_tinggi"] },
    { id: "HV-09", nama: "Gratis ongkir atau layanan antar ke rumah tanpa minimum pembelian", kondisi: ["freq_tinggi", "recency_baru"] },
    { id: "HV-10", nama: "Paket bundling produk utama dengan layanan tambahan spesial", kondisi: ["avgTx_tinggi", "freq_sedang"] },
    { id: "HV-11", nama: "Cashback langsung untuk setiap transaksi di atas threshold tertentu", kondisi: ["avgTx_tinggi", "totalRevenue_tinggi"] },
    { id: "HV-12", nama: "Program upgrade layanan — dapatkan layanan premium dengan harga reguler", kondisi: ["freq_tinggi", "avgTx_tinggi"] },
    { id: "HV-13", nama: "Notifikasi personal via WhatsApp untuk promo eksklusif atau stok terbatas", kondisi: ["recency_baru", "freq_tinggi"] },
    { id: "HV-14", nama: "Survey kepuasan eksklusif dengan imbalan voucher belanja", kondisi: ["totalRevenue_tinggi", "recency_baru"] },
    { id: "HV-15", nama: "Program apresiasi tahunan — hadiah khusus di akhir tahun untuk pelanggan HV", kondisi: ["totalRevenue_tinggi"] },
    { id: "HV-16", nama: "Hadiah ulang tahun pelanggan — diskon atau produk gratis di hari spesial", kondisi: ["totalRevenue_tinggi"] },
    { id: "HV-17", nama: "Pencatatan riwayat pesanan personal agar tidak perlu mengulang informasi", kondisi: ["freq_tinggi", "totalRevenue_tinggi"] },
    { id: "HV-18", nama: "Layanan pengiriman prioritas dengan estimasi waktu lebih cepat dari standar", kondisi: ["avgTx_tinggi", "recency_baru"] },
    { id: "HV-19", nama: "Program makin banyak makin hemat — diskon bertingkat sesuai jumlah pembelian", kondisi: ["freq_sedang", "avgTx_tinggi"] },
    { id: "HV-20", nama: "Update produk atau menu baru yang hanya dikirim ke pelanggan HV", kondisi: ["recency_baru", "freq_tinggi"] },
    { id: "HV-21", nama: "Prioritas penanganan komplain — keluhan diselesaikan lebih cepat dari biasa", kondisi: ["totalRevenue_tinggi", "freq_tinggi"] },
    { id: "HV-22", nama: "Hampers atau parcel spesial di momen Lebaran, Natal, atau Tahun Baru", kondisi: ["totalRevenue_tinggi", "recency_baru"] },
    { id: "HV-23", nama: "Program tier loyalitas — unlock keuntungan lebih besar setiap 3 atau 6 bulan", kondisi: ["freq_tinggi", "avgTx_tinggi"] },
    { id: "HV-24", nama: "Bonus produk atau jasa tambahan gratis di setiap pembelian di atas nominal", kondisi: ["avgTx_tinggi", "recency_baru"] },
    { id: "HV-25", nama: "Kontak langsung dengan pemilik usaha untuk keluhan atau pesanan khusus", kondisi: ["totalRevenue_tinggi", "freq_tinggi"] },
    { id: "HV-26", nama: "Pre-order eksklusif — pesan duluan sebelum stok atau menu resmi tersedia", kondisi: ["freq_tinggi", "avgTx_tinggi"] },
    { id: "HV-27", nama: "Rekomendasi produk personal berdasarkan histori pembelian mereka", kondisi: ["freq_tinggi", "totalRevenue_tinggi"] },
    { id: "HV-28", nama: "Opsi cicilan atau bayar nanti tanpa bunga khusus untuk pelanggan HV", kondisi: ["avgTx_tinggi", "freq_sedang"] },
    { id: "HV-29", nama: "Grup eksklusif WhatsApp atau Telegram khusus pelanggan setia", kondisi: ["freq_tinggi", "recency_baru"] },
    { id: "HV-30", nama: "Reward pencapaian — hadiah spesial setiap total belanja mencapai kelipatan tertentu", kondisi: ["totalRevenue_tinggi"] },
    { id: "HV-31", nama: "Tawaran mencoba produk atau menu baru sebelum dijual ke publik umum", kondisi: ["freq_tinggi", "recency_baru"] },
    { id: "HV-32", nama: "Program Pelanggan Bulan Ini — apresiasi publik di media sosial usaha", kondisi: ["freq_tinggi", "totalRevenue_tinggi"] },
    { id: "HV-33", nama: "Packaging atau penyajian spesial yang lebih premium dari biasa", kondisi: ["avgTx_tinggi", "totalRevenue_tinggi"] },
    { id: "HV-34", nama: "Layanan reservasi atau pre-order prioritas tanpa perlu antri", kondisi: ["freq_tinggi", "recency_baru"] },
    { id: "HV-35", nama: "Poin loyalitas tidak pernah hangus selama pelanggan masih aktif bertransaksi", kondisi: ["freq_tinggi", "recency_baru"] },
    { id: "HV-36", nama: "Penawaran spesial untuk pembelian ulang dalam waktu 30 hari", kondisi: ["recency_baru", "freq_sedang"] },
    { id: "HV-37", nama: "Layanan konsultasi gratis sebelum memutuskan membeli", kondisi: ["totalRevenue_tinggi", "freq_tinggi"] },
    { id: "HV-38", nama: "Program donasi bersama — sebagian keuntungan dari pembelian HV disumbangkan", kondisi: ["totalRevenue_tinggi", "recency_baru"] },
    { id: "HV-39", nama: "Produk atau menu seasonal eksklusif yang hanya tersedia untuk pelanggan HV", kondisi: ["recency_baru", "freq_tinggi"] },
    { id: "HV-40", nama: "Flash diskon personal via WhatsApp untuk HV yang mulai jarang bertransaksi", kondisi: ["recency_lama", "avgTx_tinggi"] },
    { id: "HV-41", nama: "Layanan kustomisasi pesanan sesuai permintaan khusus pelanggan", kondisi: ["avgTx_tinggi", "totalRevenue_tinggi"] },
    { id: "HV-42", nama: "Benefit yang bisa dibagikan ke anggota keluarga", kondisi: ["totalRevenue_tinggi", "freq_tinggi"] },
    { id: "HV-43", nama: "Update rutin tentang perubahan harga, menu baru, atau layanan terbaru", kondisi: ["freq_tinggi", "recency_baru"] },
    { id: "HV-44", nama: "Poin loyalitas yang bisa digunakan untuk berbagai jenis produk atau layanan", kondisi: ["freq_tinggi"] },
    { id: "HV-45", nama: "Notifikasi awal jika ada produk atau menu yang akan dihentikan", kondisi: ["freq_tinggi", "recency_baru"] },
    { id: "HV-46", nama: "Program reaktivasi personal jika pelanggan HV mulai tidak aktif", kondisi: ["recency_lama", "totalRevenue_tinggi"] },
    { id: "HV-47", nama: "Gratis biaya pengiriman atau layanan return tanpa syarat tambahan", kondisi: ["avgTx_tinggi", "freq_tinggi"] },
    { id: "HV-48", nama: "Diskon khusus di momen anniversary atau ulang tahun usaha", kondisi: ["recency_baru", "totalRevenue_tinggi"] },
    { id: "HV-49", nama: "Konten tips dan informasi eksklusif yang relevan dengan kebutuhan mereka", kondisi: ["freq_tinggi", "recency_baru"] },
    { id: "HV-50", nama: "Penawaran pre-order dengan harga early bird khusus untuk pelanggan HV", kondisi: ["freq_tinggi", "avgTx_tinggi"] },
  ],
  "Medium Value": [
    { id: "MV-01", nama: "Tawarkan produk satu level di atas yang biasa mereka beli (upselling)", kondisi: ["avgTx_sedang", "freq_sedang"] },
    { id: "MV-02", nama: "Paket hemat — produk utama dan tambahan dengan harga bundled", kondisi: ["avgTx_sedang", "freq_rendah"] },
    { id: "MV-03", nama: "Promosi musiman Lebaran, Tahun Baru, hari besar nasional", kondisi: ["recency_sedang", "avgTx_sedang"] },
    { id: "MV-04", nama: "Program membership dengan benefit yang jelas dan terukur", kondisi: ["freq_sedang", "avgTx_sedang"] },
    { id: "MV-05", nama: "Win-back campaign untuk MV yang mulai jarang beli", kondisi: ["recency_lama", "freq_rendah"] },
    { id: "MV-06", nama: "Diskon bertingkat — semakin banyak beli semakin besar diskon", kondisi: ["avgTx_sedang", "freq_sedang"] },
    { id: "MV-07", nama: "Program referral dengan reward menarik untuk keduanya", kondisi: ["freq_sedang", "recency_baru"] },
    { id: "MV-08", nama: "Re-engagement WA untuk MV yang tidak aktif", kondisi: ["recency_lama", "freq_rendah"] },
    { id: "MV-09", nama: "Flash sale eksklusif untuk pelanggan MV saja", kondisi: ["recency_sedang", "avgTx_sedang"] },
    { id: "MV-10", nama: "Tawaran upgrade ke layanan premium dengan harga spesial", kondisi: ["avgTx_sedang", "freq_sedang"] },
    { id: "MV-11", nama: "Voucher kejutan setelah pelanggan lama tidak bertransaksi", kondisi: ["recency_lama", "freq_rendah"] },
    { id: "MV-12", nama: "Program poin dengan milestone yang lebih dekat untuk dicapai", kondisi: ["freq_sedang", "recency_baru"] },
    { id: "MV-13", nama: "Cross-selling produk atau layanan pelengkap yang relevan", kondisi: ["avgTx_sedang", "freq_sedang"] },
    { id: "MV-14", nama: "Notifikasi personal ketika produk favorit mereka restock", kondisi: ["recency_sedang", "freq_sedang"] },
    { id: "MV-15", nama: "Diskon khusus untuk pembelian kedua dalam satu bulan", kondisi: ["freq_rendah", "recency_baru"] },
    { id: "MV-16", nama: "Cashback untuk transaksi di atas rata-rata mereka", kondisi: ["avgTx_sedang", "freq_sedang"] },
    { id: "MV-17", nama: "Hadiah surprise kecil yang tidak diumumkan sebelumnya", kondisi: ["recency_baru", "freq_sedang"] },
    { id: "MV-18", nama: "Program cicilan untuk mendorong transaksi bernilai lebih besar", kondisi: ["avgTx_sedang", "freq_rendah"] },
    { id: "MV-19", nama: "Konten edukasi produk agar mereka tahu manfaat lebih banyak", kondisi: ["freq_rendah", "avgTx_sedang"] },
    { id: "MV-20", nama: "Penawaran bundle eksklusif yang tidak ada di katalog publik", kondisi: ["avgTx_sedang", "recency_baru"] },
    { id: "MV-21", nama: "Program loyalitas dengan target terlihat — X poin lagi dapat hadiah", kondisi: ["freq_sedang", "recency_baru"] },
    { id: "MV-22", nama: "Promo ulang tahun pelanggan — diskon atau produk gratis", kondisi: ["recency_sedang", "avgTx_sedang"] },
    { id: "MV-23", nama: "Gamifikasi — tantangan belanja dengan reward di ujungnya", kondisi: ["freq_sedang", "recency_baru"] },
    { id: "MV-24", nama: "Rekomendasi produk personal berdasarkan histori pembelian", kondisi: ["freq_sedang", "totalRevenue_tinggi"] },
    { id: "MV-25", nama: "Gratis ongkir untuk pembelian di atas rata-rata transaksi mereka", kondisi: ["avgTx_sedang", "freq_sedang"] },
    { id: "MV-26", nama: "Penawaran limited edition atau produk eksklusif", kondisi: ["recency_baru", "avgTx_sedang"] },
    { id: "MV-27", nama: "Upselling paket premium dengan perbedaan harga yang kecil", kondisi: ["avgTx_sedang", "freq_rendah"] },
    { id: "MV-28", nama: "Notifikasi untuk mencoba produk baru yang belum pernah mereka beli", kondisi: ["freq_sedang", "recency_sedang"] },
    { id: "MV-29", nama: "Program tantangan beli 3 dapat bonus — dorong frekuensi naik", kondisi: ["freq_sedang", "recency_baru"] },
    { id: "MV-30", nama: "Penawaran eksklusif akhir bulan untuk mendorong transaksi rutin", kondisi: ["recency_sedang", "freq_sedang"] },
    { id: "MV-31", nama: "Diskon pada anniversary mereka bergabung sebagai pelanggan", kondisi: ["recency_baru", "totalRevenue_tinggi"] },
    { id: "MV-32", nama: "Add-on produk atau layanan tambahan dengan harga yang sangat hemat", kondisi: ["avgTx_sedang", "freq_sedang"] },
    { id: "MV-33", nama: "WA blast personal disesuaikan nama dan riwayat pembelian", kondisi: ["recency_lama", "freq_sedang"] },
    { id: "MV-34", nama: "Tawaran paket yang menghemat jika membeli lebih dari satu item", kondisi: ["avgTx_sedang", "freq_rendah"] },
    { id: "MV-35", nama: "Reward jika berhasil naik ke segmen High Value dalam 3 bulan", kondisi: ["freq_sedang", "avgTx_sedang"] },
    { id: "MV-36", nama: "Promo khusus hari kerja untuk meratakan beban transaksi", kondisi: ["freq_rendah", "recency_sedang"] },
    { id: "MV-37", nama: "Tawaran produk entry-level HV agar mulai kenal kualitas lebih tinggi", kondisi: ["avgTx_sedang", "freq_sedang"] },
    { id: "MV-38", nama: "Voucher yang bisa digunakan di transaksi berikutnya tanpa batas minimum", kondisi: ["recency_lama", "freq_rendah"] },
    { id: "MV-39", nama: "Konten social proof — pelanggan MV lain yang berhasil upgrade ke HV", kondisi: ["freq_sedang", "recency_sedang"] },
    { id: "MV-40", nama: "Penawaran bundel seasonal yang hanya tersedia 1–2 kali setahun", kondisi: ["recency_sedang", "avgTx_sedang"] },
    { id: "MV-41", nama: "Program undian — setiap transaksi di atas threshold masuk undian", kondisi: ["freq_sedang", "recency_baru"] },
    { id: "MV-42", nama: "Tawaran coba layanan premium sekali gratis tanpa komitmen", kondisi: ["avgTx_sedang", "recency_baru"] },
    { id: "MV-43", nama: "Penawaran hemat jika membeli 2 minggu lebih awal dari biasanya", kondisi: ["recency_sedang", "freq_sedang"] },
    { id: "MV-44", nama: "Diskon progresif — semakin sering beli semakin besar diskon per transaksi", kondisi: ["freq_rendah", "avgTx_sedang"] },
    { id: "MV-45", nama: "Layanan after-sales proaktif — follow up kepuasan setelah transaksi", kondisi: ["recency_baru", "freq_sedang"] },
    { id: "MV-46", nama: "Program saling untung dengan pelanggan MV lain lewat referral bersama", kondisi: ["freq_sedang", "recency_baru"] },
    { id: "MV-47", nama: "Notifikasi harga terbaik ketika ada penurunan harga produk favorit", kondisi: ["recency_lama", "avgTx_sedang"] },
    { id: "MV-48", nama: "Bonus poin double di hari ulang tahun usaha", kondisi: ["recency_baru", "freq_sedang"] },
    { id: "MV-49", nama: "Tawaran eksklusif untuk pembelian pertama di kategori yang belum dicoba", kondisi: ["freq_sedang", "recency_sedang"] },
    { id: "MV-50", nama: "Program achievement — badge dan reward untuk milestones tertentu", kondisi: ["freq_sedang", "recency_baru"] },
  ],
  "Low Value": [
    { id: "LV-01", nama: "Re-engagement campaign personal via WhatsApp", kondisi: ["recency_lama", "freq_rendah"] },
    { id: "LV-02", nama: "Diskon besar satu kali untuk mendorong kembali bertransaksi", kondisi: ["avgTx_rendah", "recency_lama"] },
    { id: "LV-03", nama: "Konten edukasi produk — tunjukkan manfaat yang belum mereka ketahui", kondisi: ["freq_rendah", "avgTx_rendah"] },
    { id: "LV-04", nama: "Voucher reaktivasi dengan masa berlaku terbatas", kondisi: ["recency_lama", "freq_rendah"] },
    { id: "LV-05", nama: "Flash sale produk entry-level dengan harga terendah", kondisi: ["avgTx_sangat_rendah", "recency_lama"] },
    { id: "LV-06", nama: "Program referral — ajak teman, dapatkan diskon untuk keduanya", kondisi: ["freq_rendah", "recency_sedang"] },
    { id: "LV-07", nama: "Pesan personal dari pemilik usaha sebagai bentuk apresiasi", kondisi: ["totalRevenue_tinggi", "recency_lama"] },
    { id: "LV-08", nama: "Win-back offer — penawaran terbaik untuk pelanggan lama tidak beli", kondisi: ["recency_lama", "freq_rendah"] },
    { id: "LV-09", nama: "Tawaran produk terlaris dengan harga spesial sebagai pintu masuk", kondisi: ["avgTx_rendah", "freq_rendah"] },
    { id: "LV-10", nama: "Program cicilan untuk produk yang lebih mahal dari biasa mereka beli", kondisi: ["avgTx_rendah", "freq_rendah"] },
    { id: "LV-11", nama: "Diskon 20–30% tanpa minimum pembelian untuk dorong transaksi", kondisi: ["avgTx_sangat_rendah", "recency_sedang"] },
    { id: "LV-12", nama: "Gamifikasi ringan — tantangan kecil dengan hadiah setelah 3 transaksi", kondisi: ["freq_rendah", "recency_sedang"] },
    { id: "LV-13", nama: "Konten ulasan positif pelanggan lain dengan profil yang mirip", kondisi: ["freq_rendah", "avgTx_rendah"] },
    { id: "LV-14", nama: "Gratis ongkir tanpa minimum untuk menghilangkan hambatan beli", kondisi: ["avgTx_rendah", "freq_rendah"] },
    { id: "LV-15", nama: "Penawaran beli sekarang bayar nanti untuk produk apapun", kondisi: ["avgTx_rendah", "freq_rendah"] },
    { id: "LV-16", nama: "Program poin dengan target sangat mudah dicapai", kondisi: ["freq_rendah", "recency_sedang"] },
    { id: "LV-17", nama: "WA broadcast personal dengan penawaran relevan riwayat mereka", kondisi: ["recency_lama", "freq_rendah"] },
    { id: "LV-18", nama: "Flash deal produk paling murah di katalog", kondisi: ["avgTx_sangat_rendah", "recency_sedang"] },
    { id: "LV-19", nama: "Survey singkat — tanya kenapa jarang beli dan beri reward", kondisi: ["recency_lama", "freq_rendah"] },
    { id: "LV-20", nama: "Paket mini — bundle hemat untuk coba beberapa produk sekaligus", kondisi: ["avgTx_rendah", "freq_rendah"] },
    { id: "LV-21", nama: "Notifikasi stok hampir habis untuk produk yang pernah mereka beli", kondisi: ["recency_sedang", "freq_rendah"] },
    { id: "LV-22", nama: "Retargeting via WhatsApp setelah 45 hari tidak ada transaksi", kondisi: ["recency_lama", "freq_rendah"] },
    { id: "LV-23", nama: "Diskon khusus hari tertentu (misal: Senin diskon 15%)", kondisi: ["freq_rendah", "avgTx_rendah"] },
    { id: "LV-24", nama: "Cashback kecil untuk setiap transaksi berapapun nilainya", kondisi: ["avgTx_sangat_rendah", "freq_rendah"] },
    { id: "LV-25", nama: "Konten tips hemat berbelanja — edukasi sambil tawarkan produk", kondisi: ["avgTx_rendah", "recency_sedang"] },
    { id: "LV-26", nama: "Undian berhadiah — setiap transaksi berapapun berhak ikut undian", kondisi: ["freq_rendah", "avgTx_rendah"] },
    { id: "LV-27", nama: "Program trial layanan premium untuk pertama kali gratis", kondisi: ["avgTx_rendah", "recency_sedang"] },
    { id: "LV-28", nama: "Tawaran paket yang menggabungkan produk murah dan premium", kondisi: ["avgTx_rendah", "freq_rendah"] },
    { id: "LV-29", nama: "Notifikasi harga turun atau promo terbaru via WA", kondisi: ["recency_lama", "avgTx_rendah"] },
    { id: "LV-30", nama: "Pesan reaktivasi — kami kangen kamu, ini hadiah kecil untuk kamu", kondisi: ["recency_lama", "freq_rendah"] },
  ],
  Potential: [
    { id: "PT-01", nama: "Konten edukasi produk untuk membangun awareness", kondisi: ["avgTx_rendah", "freq_rendah"] },
    { id: "PT-02", nama: "Diskon welcome untuk first-time buyer", kondisi: ["recency_baru"] },
    { id: "PT-03", nama: "Free trial atau sample produk gratis", kondisi: ["avgTx_sangat_rendah"] },
    { id: "PT-04", nama: "Program referral dengan incentive menarik", kondisi: ["freq_rendah"] },
    { id: "PT-05", nama: "Email nurturing campaign untuk segmen potential", kondisi: ["recency_lama"] },
    { id: "PT-06", nama: "Social media engagement untuk bangun relationship", kondisi: ["freq_rendah"] },
    { id: "PT-07", nama: "Retargeting ads untuk pelanggan yang belum convert", kondisi: ["avgTx_rendah"] },
    { id: "PT-08", nama: "Personal outreach via WhatsApp atau chat", kondisi: ["recency_lama", "freq_rendah"] },
    { id: "PT-09", nama: "Bundle offer produk dengan harga awal terendah", kondisi: ["avgTx_sangat_rendah"] },
    { id: "PT-10", nama: "Loyalty program intro — mudah untuk join dan mengerti", kondisi: ["freq_rendah"] },
  ],
}

// Main function to get dynamic recommendations
export function getDynamicRecommendations(segment: any, allSegments: any[]) {
  try {
    const benchmark = calculateBenchmark(allSegments)
    const pool = STRATEGY_POOLS[segment.name as keyof typeof STRATEGY_POOLS] || []

    // Handle both data structures: metricList (from data-processor) or customers (from data-store)
    const customerList = segment.metricList || segment.customers || []
    
    if (!customerList || customerList.length === 0) {
      console.log("[v0] No customer list found for segment:", segment.name)
      return []
    }

    // Calculate segment averages
    const avgTx = customerList.reduce((sum: number, c: any) => sum + (c.monetary || 0), 0) / customerList.length
    const avgFreq = customerList.reduce((sum: number, c: any) => sum + (c.frequency || 1), 0) / customerList.length
    const avgRecency = customerList.reduce((sum: number, c: any) => sum + (c.recency || 0), 0) / customerList.length
    const totalRevenue = customerList.reduce((sum: number, c: any) => sum + (c.monetary || 0), 0)

    const segmentCustomer = {
      avgTx,
      freq: avgFreq,
      recency: avgRecency,
      totalRevenue,
    }

    const recommendations = pilihStrategi(segmentCustomer, benchmark, pool, 3)
    console.log("[v0] Segment:", segment.name, "Recommendations:", recommendations)
    return recommendations
  } catch (error) {
    console.error("[v0] Error calculating recommendations:", error)
    return []
  }
}
