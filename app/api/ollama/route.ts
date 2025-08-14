import { NextResponse } from 'next/server';
import { ollama } from '@/lib/ollama';

export async function GET() {
  try {
    const isAvailable = await ollama.isAvailable();
    if (!isAvailable) {
      return NextResponse.json(
        { available: false, models: [] },
        { status: 200 }
      );
    }

    const models = await ollama.listModels();
    return NextResponse.json({ available: true, models });
  } catch (error) {
    console.error('Error fetching Ollama models:', error);
    return NextResponse.json(
      { available: false, models: [], error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}