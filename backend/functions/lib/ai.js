"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecommendations = exports.visualSearch = exports.generateProductEmbeddings = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
// 1. Text Embeddings (Stub)
// In a real app, this would call OpenAI API or a local model
exports.generateProductEmbeddings = functions.firestore
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
exports.visualSearch = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
    }
    const { imageUrl } = data;
    console.log(`Processing visual search for image: ${imageUrl}`);
    // Mock: Return random products as "visually similar" results
    const productsSnap = await db.collection("products").limit(5).get();
    const results = productsSnap.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
    return { results };
});
// 3. Recommendations (Rule-based + Vector Stub)
exports.getRecommendations = functions.https.onCall(async (data, context) => {
    var _a, _b;
    const userId = (_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid;
    const { productId } = data; // Optional: for "similar to this product"
    let query = db.collection("products").limit(10);
    if (productId) {
        // If productId provided, find similar items (e.g., same category)
        const productDoc = await db.collection("products").doc(productId).get();
        const category = (_b = productDoc.data()) === null || _b === void 0 ? void 0 : _b.category;
        if (category) {
            query = db.collection("products").where("category", "==", category).limit(10);
        }
    }
    else if (userId) {
        // If user provided, find based on history (stub: just return popular items)
        // In real app: Fetch user vector, query vector DB
    }
    const snap = await query.get();
    const recommendations = snap.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
    return { recommendations };
});
//# sourceMappingURL=ai.js.map