import { generateInterviewQuestions } from './gemini';

const AI_AVATAR = "https://api.dicebear.com/7.x/bottts/svg?seed=AI";

export { AI_AVATAR };

export async function getIdealAnswer(question) {
  // Use Gemini to generate an ideal answer for the question
  const prompt = `Provide a concise, high-quality answer for the following interview question:\n${question}`;
  return await generateInterviewQuestions(prompt);
}

export async function getMatchScore(question, ideal, user) {
  // Enhanced scoring system with detailed evaluation criteria
  const prompt = `Evaluate the user's answer against the ideal answer for this interview question.

Question: ${question}
Ideal Answer: ${ideal}
User Answer: ${user}

Please evaluate the user's answer based on these criteria:
1. **Content Accuracy (40%)**: How well does the answer address the question? Is the information correct and relevant?
2. **Completeness (25%)**: Does the answer cover the key points that should be mentioned?
3. **Clarity (20%)**: Is the answer clear, well-structured, and easy to understand?
4. **Relevance (15%)**: Is the answer directly related to the question asked?

Scoring Guidelines:
- 9-10: Excellent - Comprehensive, accurate, and well-articulated answer
- 7-8: Good - Mostly accurate with minor gaps or clarity issues
- 5-6: Average - Partially correct but missing key points or unclear
- 3-4: Below Average - Some relevance but significant inaccuracies or gaps
- 1-2: Poor - Mostly irrelevant or incorrect information
- 0: Completely wrong or irrelevant answer

If the user's answer is completely unrelated to the question, irrelevant, or shows no understanding, score it 0-2.

Return only the final score (0-10) as a number.`;

  try {
    const scoreText = await generateInterviewQuestions(prompt);
    const score = parseInt(scoreText.match(/\d+/)?.[0] || '0', 10);
    return isNaN(score) ? 0 : Math.max(0, Math.min(10, score));
  } catch (error) {
    console.error('Score calculation error:', error);
    // Enhanced fallback scoring based on answer quality
    if (!user || user.trim().length === 0) return 0;
    
    const userText = user.trim().toLowerCase();
    const questionText = question.trim().toLowerCase();
    
    // Check for relevance using keyword matching
    const questionWords = questionText.split(/\s+/).filter(word => word.length > 3);
    const userWords = userText.split(/\s+/).filter(word => word.length > 3);
    const commonWords = questionWords.filter(word => userWords.includes(word));
    
    // Calculate relevance score
    const relevanceScore = commonWords.length > 0 ? Math.min(6, commonWords.length * 2) : 1;
    
    // Calculate length score
    const lengthScore = userText.length > 50 ? 3 : userText.length > 20 ? 2 : 1;
    
    // Combine scores
    const fallbackScore = Math.min(7, relevanceScore + lengthScore);
    
    console.log('Using fallback scoring:', { relevanceScore, lengthScore, fallbackScore });
    return fallbackScore;
  }
}

export async function analyzeSkills(userAnswer, question, audioURL) {
  const prompt = `Analyze the following interview response and provide detailed scores out of 10 for each skill category.

Question: ${question}
User Answer: ${userAnswer}
${audioURL ? 'Note: Audio recording is available for analysis.' : ''}

Evaluation Criteria:
1. **Communication (0-10)**: 
   - Clarity and articulation
   - Confidence in speech delivery
   - Logical flow and structure
   - Ability to convey ideas effectively

2. **Grammar & Language (0-10)**:
   - Proper sentence structure
   - Vocabulary usage and variety
   - Language proficiency
   - Professional tone

3. **Professional Attitude (0-10)**:
   - Enthusiasm and engagement
   - Professional demeanor
   - Positive attitude
   - Willingness to learn

4. **Soft Skills (0-10)**:
   - Problem-solving approach
   - Adaptability and flexibility
   - Interpersonal skills
   - Critical thinking

Scoring Guidelines:
- 9-10: Exceptional performance in this area
- 7-8: Good performance with minor areas for improvement
- 5-6: Average performance, needs development
- 3-4: Below average, significant improvement needed
- 1-2: Poor performance, major development required
- 0: No demonstration of this skill

If the answer is completely irrelevant or shows no understanding of the question, score communication and soft skills very low (1-3).

Return only the four scores separated by commas in this exact format: communication_score,grammar_score,attitude_score,soft_skills_score`;

  try {
    const result = await generateInterviewQuestions(prompt);
    const scores = result.split(',').map(s => parseInt(s.trim().match(/\d+/)?.[0] || '5', 10));
    return {
      communication: Math.max(0, Math.min(10, scores[0] || 5)),
      grammar: Math.max(0, Math.min(10, scores[1] || 5)),
      attitude: Math.max(0, Math.min(10, scores[2] || 5)),
      softSkills: Math.max(0, Math.min(10, scores[3] || 5))
    };
  } catch (error) {
    console.error('Skill analysis error:', error);
    // Enhanced fallback skill analysis
    if (!userAnswer || userAnswer.trim().length === 0) {
      return {
        communication: 1,
        grammar: 1,
        attitude: 1,
        softSkills: 1
      };
    }
    
    const text = userAnswer.trim().toLowerCase();
    
    // Analyze communication based on text structure and length
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.length > 0 ? sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length : 0;
    const communication = Math.min(8, Math.max(2, sentences.length * 0.5 + (avgSentenceLength > 20 ? 2 : 1)));
    
    // Analyze grammar based on common patterns
    const hasProperStructure = sentences.length > 1 && avgSentenceLength > 10;
    const grammar = hasProperStructure ? 6 : 4;
    
    // Analyze attitude based on positive/negative words
    const positiveWords = ['good', 'great', 'excellent', 'positive', 'helpful', 'improve', 'learn', 'understand'];
    const negativeWords = ['bad', 'terrible', 'hate', 'difficult', 'problem', 'issue', 'wrong'];
    const positiveCount = positiveWords.filter(word => text.includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.includes(word)).length;
    const attitude = Math.min(8, Math.max(3, 5 + positiveCount - negativeCount));
    
    // Analyze soft skills based on content relevance and structure
    const softSkills = Math.min(7, Math.max(3, communication * 0.8 + (hasProperStructure ? 1 : 0)));
    
    console.log('Using fallback skill analysis:', { communication, grammar, attitude, softSkills });
    
    return {
      communication: Math.round(communication),
      grammar: Math.round(grammar),
      attitude: Math.round(attitude),
      softSkills: Math.round(softSkills)
    };
  }
}

export async function checkAnswerRelevance(question, userAnswer) {
  const prompt = `Determine if the user's answer is relevant to the interview question.

Question: ${question}
User Answer: ${userAnswer}

Evaluate the relevance on a scale of 0-10:
- 9-10: Highly relevant and directly addresses the question
- 7-8: Mostly relevant with minor tangents
- 5-6: Somewhat relevant but missing key points
- 3-4: Partially relevant but mostly off-topic
- 1-2: Barely relevant or mostly unrelated
- 0: Completely irrelevant or wrong topic

Consider:
- Does the answer address what was asked?
- Is the content related to the question topic?
- Does it show understanding of the question?

Return only the relevance score (0-10) as a number.`;

  try {
    const result = await generateInterviewQuestions(prompt);
    const relevanceScore = parseInt(result.match(/\d+/)?.[0] || '5', 10);
    return Math.max(0, Math.min(10, relevanceScore));
  } catch (error) {
    console.error('Relevance check error:', error);
    // Enhanced fallback: better relevance check based on keyword matching
    if (!userAnswer || userAnswer.trim().length === 0) return 0;
    
    const userText = userAnswer.trim().toLowerCase();
    const questionText = question.trim().toLowerCase();
    
    // Extract key words from question (nouns, verbs, adjectives)
    const questionWords = questionText.split(/\s+/).filter(word => word.length > 3);
    const userWords = userText.split(/\s+/).filter(word => word.length > 3);
    const commonWords = questionWords.filter(word => userWords.includes(word));
    
    // Calculate relevance based on word overlap
    const relevanceRatio = questionWords.length > 0 ? commonWords.length / questionWords.length : 0;
    
    // Map to 0-10 scale
    if (relevanceRatio === 0) return 0;
    if (relevanceRatio < 0.1) return 1;
    if (relevanceRatio < 0.2) return 2;
    if (relevanceRatio < 0.3) return 3;
    if (relevanceRatio < 0.4) return 4;
    if (relevanceRatio < 0.5) return 5;
    if (relevanceRatio < 0.6) return 6;
    if (relevanceRatio < 0.7) return 7;
    if (relevanceRatio < 0.8) return 8;
    if (relevanceRatio < 0.9) return 9;
    return 10;
  }
}

export async function generateDetailedFeedback(question, userAnswer, idealAnswer, score, relevanceScore) {
  const prompt = `Provide detailed, constructive feedback for this interview response.

Question: ${question}
User Answer: ${userAnswer}
Ideal Answer: ${idealAnswer}
Score: ${score}/10
Relevance Score: ${relevanceScore}/10

Please provide specific, actionable feedback that includes:
1. What was done well
2. Areas for improvement
3. Specific suggestions for better answers
4. Tips for future interviews

Keep the feedback constructive and encouraging. If the score is low, focus on how to improve rather than just pointing out what's wrong.

Return only the feedback text (no additional formatting).`;

  try {
    return await generateInterviewQuestions(prompt);
  } catch (error) {
    console.error('Feedback generation error:', error);
    // Fallback feedback based on score
    if (score <= 2) {
      return "This answer doesn't address the question properly. Please focus on providing relevant information that directly answers what was asked.";
    } else if (score <= 5) {
      return "The answer needs improvement. Try to be more specific and provide more detailed information related to the question.";
    } else {
      return "Good effort! Consider adding more specific examples or details to strengthen your response.";
    }
  }
}

export function categorizeSkill(question, jobRole = '', jobDesc = '') {
  // Simple skill categorization based on keywords
  const q = question.toLowerCase();
  if (q.includes('experience') || q.includes('background') || q.includes('work')) return 'Experience';
  if (q.includes('skill') || q.includes('technology') || q.includes('tool')) return 'Technical Skills';
  if (q.includes('challenge') || q.includes('problem') || q.includes('difficult')) return 'Problem Solving';
  if (q.includes('team') || q.includes('collaboration') || q.includes('work with')) return 'Teamwork';
  if (q.includes('goal') || q.includes('future') || q.includes('plan')) return 'Career Goals';
  if (q.includes('strength') || q.includes('weakness') || q.includes('improve')) return 'Self Assessment';
  return 'General';
} 