import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { code, language, testCases } = await req.json();
    if (!code || !language || !Array.isArray(testCases)) {
      return NextResponse.json({ error: 'Missing code, language, or testCases' }, { status: 400 });
    }

    // Map language names to Piston's expected values
    const langMap = {
      javascript: 'javascript',
      python: 'python3',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
    };
    const pistonLang = langMap[language] || language;

    // Run all test cases in parallel
    const results = await Promise.all(
      testCases.map(async (tc) => {
        let actual = '';
        let error = '';
        let passed = false;
        try {
          const res = await fetch('https://emkc.org/api/v2/piston/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              language: pistonLang,
              version: '*',
              files: [{ content: code }],
              stdin: tc.input,
            }),
          });
          const data = await res.json();
          const actual = (data.run?.stdout || '').trim();
          const error = data.run?.stderr || '';
          // Flexible output comparison
          const normalize = (val) => String(val).trim().toLowerCase();
          const expectedNorm = normalize(tc.output);
          const actualNorm = normalize(actual);
          // Accept 'true', 'True', true, etc. as equivalent
          passed = actualNorm === expectedNorm ||
                   (['true', 'false'].includes(expectedNorm) && actualNorm === expectedNorm);
        } catch (e) {
          error = 'Execution error';
        }
        return {
          input: tc.input,
          expected: tc.output,
          actual,
          passed,
          error,
        };
      })
    );

    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 