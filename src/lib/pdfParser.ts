import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source using the vendored version
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export interface ParsedPDFResult {
  text: string;
  links: string[];
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    pageCount: number;
  };
}

export async function parsePDF(file: File): Promise<ParsedPDFResult> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const metadata = await pdf.getMetadata().catch(() => null);
  const numPages = pdf.numPages;
  const textParts: string[] = [];
  const links: Set<string> = new Set();

  // Extract text and links from each page
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    // Extract text
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    textParts.push(pageText);

    // Extract links from annotations
    const annotations = await page.getAnnotations().catch(() => []);
    for (const annot of annotations) {
      if (annot.url) {
        links.add(annot.url);
      }
      if (annot.unsafeUrl) {
        links.add(annot.unsafeUrl);
      }
    }
  }

  const fullText = textParts.join('\n\n');

  // Also extract URLs from the text content
  const urlRegex = /https?:\/\/[^\s\)]+/gi;
  const textUrls = fullText.match(urlRegex) || [];
  textUrls.forEach(url => links.add(url.trim()));

  // Extract email addresses
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = fullText.match(emailRegex) || [];

  // Extract LinkedIn URLs specifically
  const linkedinRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/gi;
  const linkedinUrls = fullText.match(linkedinRegex) || [];
  linkedinUrls.forEach(url => {
    if (!url.startsWith('http')) {
      links.add('https://' + url);
    } else {
      links.add(url);
    }
  });

  // Extract GitHub URLs
  const githubRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/gi;
  const githubUrls = fullText.match(githubRegex) || [];
  githubUrls.forEach(url => {
    if (!url.startsWith('http')) {
      links.add('https://' + url);
    } else {
      links.add(url);
    }
  });

  return {
    text: fullText,
    links: Array.from(links),
    metadata: {
      title: metadata?.info?.Title || undefined,
      author: metadata?.info?.Author || undefined,
      subject: metadata?.info?.Subject || undefined,
      creator: metadata?.info?.Creator || undefined,
      pageCount: numPages,
    },
  };
}

export function categorizeLinks(links: string[]): {
  linkedin: string[];
  github: string[];
  emails: string[];
  websites: string[];
  other: string[];
} {
  const result = {
    linkedin: [] as string[],
    github: [] as string[],
    emails: [] as string[],
    websites: [] as string[],
    other: [] as string[],
  };

  for (const link of links) {
    const lower = link.toLowerCase();
    if (lower.includes('linkedin.com')) {
      result.linkedin.push(link);
    } else if (lower.includes('github.com')) {
      result.github.push(link);
    } else if (lower.startsWith('mailto:') || lower.includes('@')) {
      result.emails.push(link.replace('mailto:', ''));
    } else if (lower.startsWith('http')) {
      result.websites.push(link);
    } else {
      result.other.push(link);
    }
  }

  return result;
}
