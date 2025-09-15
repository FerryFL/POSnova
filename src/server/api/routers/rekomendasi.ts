import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import * as tf from "@tensorflow/tfjs-node";
import fs from "fs";
import path from "path";
import assert from "assert";

type Pair = { a: string; b: string };

const MODELS_DIR = path.join(process.cwd(), "models", "rekomendasi");

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function buildPairsFromTransactions(transactions: any[]): Pair[] {
  const pairs: Pair[] = [];
  transactions.forEach((t) => {
    const produkIds = t.transaksiItem.map((i: any) => i.produkId);

    for (let i = 0; i < produkIds.length; i++) {
      for (let j = i + 1; j < produkIds.length; j++) {
        // add both directions
        pairs.push({ a: produkIds[i], b: produkIds[j] });
        pairs.push({ a: produkIds[j], b: produkIds[i] });
      }
    }
  });
  return pairs;
}

function buildIndexMaps(pairs: Pair[]) {
  const uniqueProducts = Array.from(new Set(pairs.flatMap((p) => [p.a, p.b])));
  const productIndexMap: Record<string, number> = Object.fromEntries(
    uniqueProducts.map((id, i) => [id, i])
  );
  const indexProductMap: Record<number, string> = Object.fromEntries(
    uniqueProducts.map((id, i) => [i, id])
  );
  return { productIndexMap, indexProductMap, vocabSize: uniqueProducts.length };
}

function generateSamples(
  pairs: Pair[],
  productIndexMap: Record<string, number>,
  negativeRatio = 0.5
) {
  const posA: number[] = [];
  const posB: number[] = [];
  const labels: number[] = [];

  const posSet = new Set<string>();

  pairs.forEach((p) => {
    const ia = productIndexMap[p.a];
    const ib = productIndexMap[p.b];
    if (ia === undefined || ib === undefined) return;
    posA.push(ia);
    posB.push(ib);
    labels.push(1);
    posSet.add(`${ia}:${ib}`);
  });

  const vocab = Object.values(productIndexMap) as number[];
  if (posA.length === 0) {
    const emptyA = tf.tensor2d([], [0, 1], "int32");
    const emptyB = tf.tensor2d([], [0, 1], "int32");
    const emptyL = tf.tensor2d([], [0, 1], "float32");
    return { tensorA: emptyA, tensorB: emptyB, labelTensor: emptyL, sampleCount: 0 };
  }

  const rngChoice = (arr: number[]) => arr[Math.floor(Math.random() * arr.length)];

  for (let i = 0; i < posA.length * negativeRatio; i++) {
    const a = posA[i % posA.length];
    let b = rngChoice(vocab);
    let tries = 0;
    while ((b === a || posSet.has(`${a}:${b}`)) && tries < 50) {
      b = rngChoice(vocab);
      tries++;
    }
    if (b === a || posSet.has(`${a}:${b}`)) continue; // couldn't find negative
    posA.push(a!);
    posB.push(b!);
    labels.push(0);
  }

// Subsample to avoid OOM on very large datasets
  const MAX_SAMPLES = 1000;
  if (posA.length > MAX_SAMPLES) {
    const idxs = tf.util.createShuffledIndices(posA.length).slice(0, MAX_SAMPLES);
    const newPosA: number[] = [];
    const newPosB: number[] = [];
    const newLabels: number[] = [];
    for (const i of idxs) {
      newPosA.push(posA[i]!);
      newPosB.push(posB[i]!);
      newLabels.push(labels[i]!);
    }
    posA.length = 0; posA.push(...newPosA);
    posB.length = 0; posB.push(...newPosB);
    labels.length = 0; labels.push(...newLabels);
  }

  const tensorA = tf.tensor2d(posA.map((x) => [x]), [posA.length, 1], "int32");
  const tensorB = tf.tensor2d(posB.map((x) => [x]), [posB.length, 1], "int32");
  const labelTensor = tf.tensor2d(labels.map((x) => [x]), [labels.length, 1], "float32");

  return { tensorA, tensorB, labelTensor, sampleCount: labels.length };
}

function buildModel(vocabSize: number, embeddingDim = 32) {
  const inputA = tf.input({ shape: [1], dtype: "int32", name: "inputA" });
  const inputB = tf.input({ shape: [1], dtype: "int32", name: "inputB" });

  const embedding = tf.layers.embedding({ inputDim: vocabSize, outputDim: embeddingDim });

  const embedA = embedding.apply(inputA) as tf.SymbolicTensor;
  const embedB = embedding.apply(inputB) as tf.SymbolicTensor;

  const dot = tf.layers.dot({ axes: -1 }).apply([embedA, embedB]) as tf.SymbolicTensor;
  const flat = tf.layers.flatten().apply(dot) as tf.SymbolicTensor;

  const output = tf.layers.dense({ units: 1, activation: "sigmoid" }).apply(flat) as tf.SymbolicTensor;

  const model = tf.model({ inputs: [inputA, inputB], outputs: output });
  model.compile({ optimizer: tf.train.adam(0.01), loss: "binaryCrossentropy", metrics: ["accuracy"] });
  return model;
}

export const rekomendasiRouter = createTRPCRouter({
  trainModel: publicProcedure
    .input(
      z.object({
        umkmId: z.string(), 
        epochs: z.number().optional(), 
        negativeRatio: z.number().optional() 
    })
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      const transaksi = await db.transaksi.findMany({
        where: { UMKMId: input.umkmId },
        select: { transaksiItem: { select: { produkId: true } } },
      });

      const pairs = buildPairsFromTransactions(transaksi);

      if (pairs.length === 0) {
        return { success: false, reason: "Not enough data to train" };
      }

      const { productIndexMap, indexProductMap, vocabSize } = buildIndexMaps(pairs);

      if (vocabSize <= 1) {
        return { success: false, reason: "Not enough unique products to train" };
      }

      const { tensorA, tensorB, labelTensor, sampleCount } = generateSamples(
        pairs,
        productIndexMap,
        input.negativeRatio ?? 0.5
      );

      const epochs = input.epochs ?? 3;

      const model = buildModel(vocabSize, 64);

      await model.fit([tensorA, tensorB], labelTensor, {
        batchSize: 32,
        epochs,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`[rekomendasi][train] epoch ${epoch} loss=${logs?.loss} acc=${(logs as any)?.acc}`);
          },
        },
      });

      // save model and maps
      const modelDir = path.join(MODELS_DIR, input.umkmId, "model");
      ensureDir(modelDir);
      await model.save(`file://${modelDir}`);

      const mapDir = path.join(MODELS_DIR, input.umkmId);
      ensureDir(mapDir);
      fs.writeFileSync(path.join(mapDir, "productIndexMap.json"), JSON.stringify(productIndexMap));
      fs.writeFileSync(path.join(mapDir, "indexProductMap.json"), JSON.stringify(indexProductMap));
      fs.writeFileSync(path.join(mapDir, "pairs.json"), JSON.stringify(pairs));

      // Build coOccurrenceMap and save to coOccurrenceMap.json
      const coOccurrenceMap: Record<string, string[]> = {};
      for (const p of pairs) {
        if (!p || typeof p.a !== "string" || typeof p.b !== "string") continue;
        if (!coOccurrenceMap[p.a]) {
          coOccurrenceMap[p.a] = [];
        }
        if (!coOccurrenceMap[p.a]!.includes(p.b)) {
          coOccurrenceMap[p.a]!.push(p.b);
        }
      }
      fs.writeFileSync(path.join(mapDir, "coOccurrenceMap.json"), JSON.stringify(coOccurrenceMap));

      // dispose tensors
      try {
        tensorA.dispose();
        tensorB.dispose();
        labelTensor.dispose();
      } catch (e) {
        // ignore
      }

      return { success: true, vocabSize, pairsCount: pairs.length, sampleCount };
    }),

  rekomendasiProduk: publicProcedure
    .input(z.object({ umkmId: z.string(), produkIds: z.array(z.string()) }))
    .query(async ({ ctx, input }) => {
      const modelPath = path.join(MODELS_DIR, input.umkmId, "model", "model.json");
      if (!fs.existsSync(modelPath)) {
        return [];
      }

      const productIndexMapPath = path.join(MODELS_DIR, input.umkmId, "productIndexMap.json");
      const indexProductMapPath = path.join(MODELS_DIR, input.umkmId, "indexProductMap.json");

      if (!fs.existsSync(productIndexMapPath) || !fs.existsSync(indexProductMapPath)) {
        return [];
      }

      const productIndexMap: Record<string, number> = JSON.parse(fs.readFileSync(productIndexMapPath, "utf-8"));
      const indexProductMap: Record<string, string> = JSON.parse(fs.readFileSync(indexProductMapPath, "utf-8"));

      // Load co-occurrence map from coOccurrenceMap.json
      const coOccurrenceMapPath = path.join(MODELS_DIR, input.umkmId, "coOccurrenceMap.json");
      let coOccurrenceMap: Record<string, Set<string>> = {};
      if (fs.existsSync(coOccurrenceMapPath)) {
        const rawMap: Record<string, string[]> = JSON.parse(fs.readFileSync(coOccurrenceMapPath, "utf-8"));
        coOccurrenceMap = {};
        for (const key in rawMap) {
          coOccurrenceMap[key] = new Set(rawMap[key]);
        }
      }

      const model = await tf.loadLayersModel(`file://${modelPath}`);

      // Collect all candidate products from vocab excluding input products
      const allProdukIndices = Object.values(productIndexMap);
      const inputIndices = input.produkIds.map((id) => productIndexMap[id]).filter((v) => v !== undefined);

      if (inputIndices.length === 0) {
        return [];
      }

      const candidates: { produkId: string; score: number }[] = [];

      // For each input product, generate pairs with all other products
      for (const inputIdx of inputIndices) {
        const inputProduk = indexProductMap[inputIdx];
        const pairAs: number[] = [];
        const pairBs: number[] = [];

        for (const candidateIdx of allProdukIndices) {
          const candidateProduk = indexProductMap[candidateIdx];
          if (candidateIdx === inputIdx) continue;
          // Skip if candidate never co-occurred with input in training
          if (!inputProduk || !coOccurrenceMap[inputProduk] || !coOccurrenceMap[inputProduk].has(candidateProduk!)) continue;
          pairAs.push(inputIdx);
          pairBs.push(candidateIdx);
        }

        if (pairAs.length === 0) continue;

        const tensorA = tf.tensor2d(pairAs.map((x) => [x]), [pairAs.length, 1], "int32");
        const tensorB = tf.tensor2d(pairBs.map((x) => [x]), [pairBs.length, 1], "int32");

        const preds = model.predict([tensorA, tensorB]) as tf.Tensor;

        const scores = await preds.data();

        for (let i = 0; i < scores.length; i++) {
          const candidateIdx = pairBs[i];
          if (candidateIdx !== undefined) {
            const produkId = indexProductMap[candidateIdx];
            const score = scores[i] ?? 0;
            if (produkId) {
              candidates.push({ produkId, score });
            }
          }
        }

        tensorA.dispose();
        tensorB.dispose();
        preds.dispose();
      }

      // Aggregate scores by produkId (max score)
      const scoreMap: Record<string, number> = {};
      for (const c of candidates) {
        if (c && (!(c.produkId in scoreMap) || c.score > scoreMap[c.produkId]!)) {
          scoreMap[c.produkId] = c.score;
        }
      }

      // Sort by score desc and take top 10
      const topProduk = Object.entries(scoreMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([produkId, score]) => ({ produkId, score }));

      // Query produk data from DB
      const produkData = await ctx.db.produk.findMany({
        where: { id: { in: topProduk.map((p) => p.produkId) } },
        select: {
            id: true,
            nama: true,
            harga: true,
            gambar: true,
            status: true,
            stok: true,
            ProdukVarian: {
                select: {
                    varian: {
                        select: {
                            id: true,
                            nama: true,
                        },
                    },
                },
            },
            kategori: {
                select: {
                    id: true,
                    nama: true,
                    status: true,
                },
            },
            UMKM: {
                select: {
                    id: true,
                    nama: true,
                },
            },
        },
      });

      // Map produk data with score
      const produkMap = Object.fromEntries(produkData.map((p) => [p.id, p]));

      // Exclude produk from Cart
      const exclude = new Set(input.produkIds)
      const topProdukExcluded = topProduk.filter(p => !exclude.has(p.produkId));

      const result = topProdukExcluded
        .map(({ produkId, score }) => {
          const produk = produkMap[produkId];
          if (!produk) return null;
          return { ...produk, score };
        })
        .filter((x) => x !== null);

      return result;
    }),
});