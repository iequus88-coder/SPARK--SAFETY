export default async function handler(req, res) {
  // Vercel 환경 변수에서 API 키를 안전하게 가져옵니다.
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: '서버에 API 키가 설정되지 않았습니다.' });
  }

  // 사용자의 질문에 심화 컨설팅 유도 프롬프트를 보이지 않게 덧붙입니다.
  const userMessage = req.body.contents[req.body.contents.length - 1].parts[0].text;
  const enhancedMessage = userMessage + "\n\n(※ 중요: 해설을 마친 후, 반드시 마지막에 '추가 심화 질문 및 대책 마련'이라는 섹션을 만들어, 질문자의 구체적인 현장 상황이나 추가적인 궁금증을 이끌어내고, 실질적인 해결 방안을 함께 모색하겠다는 안내 멘트를 친절하게 작성해 줘.)";
  req.body.contents[req.body.contents.length - 1].parts[0].text = enhancedMessage;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      throw new Error(`Google API 오류: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('API 통신 에러:', error);
    return res.status(500).json({ error: '답변을 생성하는 중 통신 오류가 발생했습니다.' });
  }
}
