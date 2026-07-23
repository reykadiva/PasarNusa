import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/mongodb/client";
import mockData from "@/../server/mockDatabase.json";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const collectionName = searchParams.get("collection") || "status";

  try {
    const { db } = await connectToDatabase();

    if (collectionName === "status") {
      const collections = await db.listCollections().toArray();
      const desasCount = await db.collection("desas").countDocuments();
      const umkmsCount = await db.collection("umkms").countDocuments();
      const produksCount = await db.collection("produks").countDocuments();

      return NextResponse.json({
        status: "Connected to MongoDB Atlas",
        database: "pasarnusa",
        collections: collections.map((c: any) => c.name),
        counts: {
          desas: desasCount,
          umkms: umkmsCount,
          produks: produksCount,
        },
      });
    }

    // Fetch data from specified MongoDB collection
    const collection = db.collection(collectionName);
    const data = await collection.find({}).limit(100).toArray();

    return NextResponse.json({
      source: "MongoDB Atlas Cloud",
      collection: collectionName,
      total: data.length,
      data,
    });
  } catch (error: any) {
    console.warn("MongoDB connection warning, using fallback:", error.message);
    
    // Fallback response if MongoDB Atlas network is unreachable
    const fallbackData = (mockData as any)[collectionName] || [];
    return NextResponse.json({
      source: "Mock Fallback Data",
      collection: collectionName,
      total: fallbackData.length,
      data: fallbackData,
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { collectionName, item } = body;

    if (!collectionName || !item) {
      return NextResponse.json({ error: "collectionName and item are required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const result = await db.collection(collectionName).insertOne({
      ...item,
      created_at: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `Inserted into MongoDB ${collectionName}`,
      insertedId: result.insertedId,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
