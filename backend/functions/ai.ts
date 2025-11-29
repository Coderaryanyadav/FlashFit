import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

// 1. Text Embeddings (Stub)
// In a real app, this would call OpenAI API or a local model
export const generateProductEmbeddings = functions.firestore
  .document("products/{productId}")
  .onCreate(async (snap, context) => {
    const product = snap.data();
    const text = `${product.title} ${product.description} ${product.category}`;

    // Mock embedding generation
    const embedding = Array(1536).fill(0).map(() => Math.random());

    await db.collection("products").doc(context.params.productId).update({
      embedding,
      embeddingStatus: "completed",
    });

    console.log(`Generated embedding for product ${context.params.productId}`);
  });

// 2. Visual Search (Stub)
// In a real app, this would process an uploaded image using CLIP/ResNet
export const visualSearch = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
  }

  const { imageUrl } = data;
  console.log(`Processing visual search for image: ${imageUrl}`);

  // Mock: Return random products as "visually similar" results
  const productsSnap = await db.collection("products").limit(5).get();
  const results = productsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  return { results };
});

// 3. Recommendations (Rule-based + Vector Stub)
export const getRecommendations = functions.https.onCall(async (data, context) => {
  const userId = context.auth?.uid;
  const { productId } = data; // Optional: for "similar to this product"

  let query = db.collection("products").limit(10);

  if (productId) {
    // If productId provided, find similar items (e.g., same category)
    const productDoc = await db.collection("products").doc(productId).get();
    const category = productDoc.data()?.category;
    if (category) {
      query = db.collection("products").where("category", "==", category).limit(10);
    }
  } else if (userId) {
    // If user provided, find based on history (stub: just return popular items)
    // In real app: Fetch user vector, query vector DB
  }

  const snap = await query.get();
  const recommendations = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  return { recommendations };
});
