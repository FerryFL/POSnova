-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kategori" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UMKMId" TEXT,

    CONSTRAINT "Kategori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Varian" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UMKMId" TEXT,

    CONSTRAINT "Varian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produk" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "harga" INTEGER NOT NULL,
    "gambar" TEXT NOT NULL,
    "stok" INTEGER NOT NULL DEFAULT 0,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kategoriId" TEXT NOT NULL,
    "UMKMId" TEXT,

    CONSTRAINT "Produk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProdukVarian" (
    "produkId" TEXT NOT NULL,
    "varianId" TEXT NOT NULL,

    CONSTRAINT "ProdukVarian_pkey" PRIMARY KEY ("produkId","varianId")
);

-- CreateTable
CREATE TABLE "UMKM" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "noTelp" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UMKM_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Post_name_idx" ON "Post"("name");

-- AddForeignKey
ALTER TABLE "Kategori" ADD CONSTRAINT "Kategori_UMKMId_fkey" FOREIGN KEY ("UMKMId") REFERENCES "UMKM"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Varian" ADD CONSTRAINT "Varian_UMKMId_fkey" FOREIGN KEY ("UMKMId") REFERENCES "UMKM"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produk" ADD CONSTRAINT "Produk_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "Kategori"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produk" ADD CONSTRAINT "Produk_UMKMId_fkey" FOREIGN KEY ("UMKMId") REFERENCES "UMKM"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdukVarian" ADD CONSTRAINT "ProdukVarian_produkId_fkey" FOREIGN KEY ("produkId") REFERENCES "Produk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdukVarian" ADD CONSTRAINT "ProdukVarian_varianId_fkey" FOREIGN KEY ("varianId") REFERENCES "Varian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
