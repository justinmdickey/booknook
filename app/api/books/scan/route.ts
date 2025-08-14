import { NextRequest, NextResponse } from 'next/server';
import { ollama } from '@/lib/ollama';

export async function GET() {
  try {
    const isAvailable = await ollama.isAvailable();
    if (!isAvailable) {
      return NextResponse.json(
        { available: false, models: [], error: 'Ollama is not available' },
        { status: 503 }
      );
    }

    const models = await ollama.listModels();
    return NextResponse.json({ available: true, models });
  } catch (error) {
    console.error('Error checking Ollama availability:', error);
    return NextResponse.json(
      { available: false, models: [], error: 'Failed to check Ollama status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAvailable = await ollama.isAvailable();
    if (!isAvailable) {
      return NextResponse.json(
        { success: false, error: 'Ollama service is not available' },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const image = formData.get('image') as File;
    const model = formData.get('model') as string;

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'No image provided' },
        { status: 400 }
      );
    }

    if (!model) {
      return NextResponse.json(
        { success: false, error: 'No model specified' },
        { status: 400 }
      );
    }

    // Validate image type
    if (!image.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Please upload an image.' },
        { status: 400 }
      );
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Process with Ollama
    const result = await ollama.analyzeBookImage(base64Image, model);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to analyze image' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        title: result.title,
        author: result.author,
        isbn: result.isbn,
        publisher: result.publisher
      }
    });

  } catch (error) {
    console.error('Error processing book scan:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}