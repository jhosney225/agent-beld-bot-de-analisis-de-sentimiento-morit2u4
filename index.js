
```javascript
const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic();

// Sample financial news articles for sentiment analysis
const sampleNews = [
  {
    id: 1,
    title: "Tech Stocks Rally on Strong Earnings Reports",
    content:
      "Major technology companies reported better-than-expected quarterly earnings, driving investor confidence and pushing the NASDAQ up 2.5% today.",
  },
  {
    id: 2,
    title: "Market Crash Fears as Interest Rates Spike",
    content:
      "Bond markets are in turmoil as the Federal Reserve signals more aggressive rate hikes. Investors are fleeing to safer assets amid recession concerns.",
  },
  {
    id: 3,
    title: "Energy Sector Shows Mixed Signals",
    content:
      "While oil prices remain volatile, some energy companies are benefiting from increased demand. Others face headwinds from supply chain disruptions.",
  },
  {
    id: 4,
    title: "Banking Industry Steady Amid Economic Uncertainty",
    content:
      "Despite broader market volatility, major banks reported stable deposits and manageable loan portfolios. Analysts remain cautiously optimistic about sector resilience.",
  },
  {
    id: 5,
    title: "Retail Sales Collapse Signals Economic Downturn",
    content:
      "Unexpected sharp decline in consumer spending raises alarms about economic slowdown. Retailers warn of challenging quarter ahead.",
  },
];

async function analyzeSentiment(newsItem) {
  const systemPrompt = `You are an expert financial news sentiment analyzer. Analyze the given news article and provide:
1. Overall sentiment (Positive, Negative, Neutral)
2. Sentiment score (-1.0 to 1.0, where -1 is most negative, 0 is neutral, 1 is most positive)
3. Key financial indicators mentioned
4. Impact prediction (bullish, bearish, or mixed)
5. Confidence level (0-100%)

Respond in JSON format.`;

  const userPrompt = `Analyze this financial news article:
Title: ${newsItem.title}
Content: ${newsItem.content}

Provide your analysis in JSON format with keys: sentiment, score, indicators, impact, confidence`;

  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: userPrompt,
      },
    ],
    system: systemPrompt,
  });

  // Extract the text content from the response
  const analysisText =
    response.content[0].type === "text" ? response.content[0].text : "";

  // Parse JSON from response
  const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  // Fallback parsing if JSON extraction fails
  return {
    sentiment: "Neutral",
    score: 0,
    indicators: [],
    impact: "mixed",
    confidence: 50,
  };
}

async function generateMarketReport(analyses) {
  const summaryPrompt = `Based on the following sentiment analysis of financial news articles, provide a brief market outlook report.

Sentiment Analyses:
${JSON.stringify(analyses, null, 2)}

Provide a concise market analysis including:
1. Overall market sentiment trend
2. Key risks identified
3. Opportunities highlighted
4. Recommended investor actions`;

  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 800,
    messages: [
      {
        role: "user",
        content: summaryPrompt,
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

async function main() {
  console.log("🔍 Financial News Sentiment Analysis Bot");
  console.log("========================================\n");

  console.log("Processing news articles for sentiment analysis...\n");

  const analyses = [];

  // Analyze each news item
  for (const newsItem of sampleNews) {
    console.log(`📰 Analyzing: "${newsItem.title}"`);
    const analysis = await analyzeSentiment(newsItem);
    analyses.push({
      id: newsItem.id,
      title: newsItem.title,
      analysis: analysis,
    });

    // Display individual analysis
    console.log(`   Sentiment: ${analysis.sentiment}`);
    console.log(`   Score: ${analysis.score}`);
    console.log(`   Impact: ${analysis.impact}`);
    console.log(`   Confidence: ${analysis.confidence}%\n`);

    // Add a small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Generate market report
  console.log("\n📊 Generating Market Report...\n");
  const report = await generateMarketReport(analyses);
  console.log("Market Analysis Report:");
  console.log("----------------------");
  console.log(report);

  // Display summary statistics
  console.log("\n\n📈 Summary Statistics");
  console.log("---------------------");

  const sentimentCounts = {
    Positive: 0,
    Negative: 0,
    Neutral: 0,
  };

  let totalScore = 0;
  let averageConfidence = 0;

  for (const result of analyses) {
    const sentiment = result.analysis.sentiment || "Neutral";
    sentimentCounts[sentiment] = (sentimentCounts[sentiment] || 0) + 1;
    totalScore += result.analysis.score || 0;
    averageConfidence += result.analysis.confidence || 0;
  }

  console.log(
    `Total Articles Analyzed: ${analyses.length}`
  );
  console.log(`Positive Sentiment: ${sentimentCounts.Positive}`);
  console.log(`Negative Sentiment: ${