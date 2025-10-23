# Claude AI Prompt Engineering Guide

## Overview

This document explains the prompt design for the website import feature and how to optimize it for better conversions.

## Current Prompt Strategy

### Prompt Structure

1. **Role Definition**
   - Sets Claude as an "expert web developer and designer"
   - Establishes expertise in both technical and visual aspects

2. **Task Context**
   - Explains RosterUp's block-based architecture
   - Lists all 37 available block types with descriptions
   - Defines 3 section types (header, content, footer)

3. **Detailed Instructions**
   - 5-step analysis process
   - JSON schema with examples
   - Important guidelines for accuracy

4. **Input Data**
   - Website URL for context
   - HTML content (truncated to 50,000 chars)
   - CSS content (truncated to 20,000 chars)

### Why This Works

**Comprehensive Block Type List**
- Claude knows exactly what options are available
- Can make intelligent decisions about element mapping
- Reduces hallucination of non-existent block types

**JSON Schema Definition**
- Structured output ensures parsing reliability
- Examples guide Claude's response format
- Type hints prevent errors

**Contextual Guidelines**
- "Preserve original content exactly" → prevents summarization
- "Map semantic HTML" → ensures logical conversions
- "Extract prominent colors" → gets brand colors, not just black/white
- "Maintain order" → preserves visual hierarchy

## Prompt Optimization Tips

### 1. Token Management

**Current Limits:**
- HTML: 50,000 characters
- CSS: 20,000 characters
- Total input: ~70,000 tokens
- Max output: 16,000 tokens

**Why These Limits:**
- Claude 3.5 Sonnet has 200K token context window
- Need room for prompt (5K tokens) + response (16K tokens)
- Prevents timeout on very large sites

**Optimization Strategy:**
```typescript
// Prioritize meaningful content
const htmlPriority = [
  'body > header',
  'body > main',
  'body > footer',
  'section',
  'article'
];

// Remove noise before sending to Claude
const removeSelectors = [
  'script',
  'style',
  'noscript',
  'svg',
  'iframe'
];
```

### 2. Improving Color Extraction

**Current Approach:**
```
Extract the most prominent colors (not just background/foreground)
```

**Enhanced Prompt Addition:**
```
When extracting colors:
1. Identify the primary brand color (most used for CTAs, headers)
2. Find the secondary/accent color (highlights, links)
3. Detect background colors (hero sections, cards)
4. Extract text colors (heading, body, muted)
5. Ignore pure black (#000), pure white (#fff), transparent
```

### 3. Better Font Detection

**Current Approach:**
```
Identify the fonts being used
```

**Enhanced Prompt Addition:**
```
For typography:
1. Find the heading font (h1-h6 elements)
2. Find the body font (p, div, span elements)
3. If same font is used for both, it's acceptable
4. Extract font weights used throughout the site
5. Prefer web-safe fonts or common Google Fonts
```

### 4. Semantic Section Detection

**Current Logic:**
```
Analyze the HTML structure and identify semantic sections
```

**Enhanced Instructions:**
```
Section identification rules:
1. HEADER: <header>, <nav>, [role="banner"], top navigation
2. HERO: First large section after header, often has large text + CTA
3. CONTENT: Everything between hero and footer
4. FOOTER: <footer>, [role="contentinfo"], copyright notices

Split content sections when:
- Background color changes significantly
- Clear visual break (large margin/padding)
- Different content purpose (features → testimonials)
```

### 5. Block Type Mapping Accuracy

**Add Decision Matrix:**
```
Block type selection guide:
- <h1-h6> → Always "heading"
- <p> with <50 chars → Consider "heading" level 5-6
- <button> → Always "button"
- <a> with .btn, .button, .cta class → "button"
- <a> without styling → Keep in paragraph or make "button" if standalone
- <img> in <figure> → "image" with figcaption as caption
- <img> standalone → "image" without caption
- <ul>/<ol> → "list"/"numbered-list"
- <form> → "contact-form" if has name/email/message
- <video> → "video"
- <iframe> with youtube/vimeo → "video"
```

## Common Issues and Solutions

### Issue 1: Claude Returns Markdown-Wrapped JSON

**Problem:**
```json
```json
{
  "sections": [...]
}
```
```

**Current Solution:**
```typescript
const jsonMatch = content.match(/\{[\s\S]*\}/);
```

**Improved Prompt:**
```
IMPORTANT: Return ONLY the raw JSON object.
Do not wrap it in markdown code blocks.
Do not include any text before or after the JSON.
Your entire response should be valid JSON that starts with { and ends with }
```

### Issue 2: Inconsistent Color Format

**Problem:** Claude returns mix of hex, rgb, rgba

**Solution in Prompt:**
```
All colors must be in hex format (#RRGGBB or #RGB).
If you encounter rgb/rgba/hsl values, convert them to hex.
Example: rgb(59, 130, 246) → #3b82f6
```

### Issue 3: Missing section_order_index

**Problem:** Blocks don't know which section they belong to

**Current Solution:** Added to schema

**Reinforcement in Prompt:**
```
CRITICAL: Every block must have "section_order_index" matching the order_index
of its parent section. This is how we know which section the block belongs to.
```

### Issue 4: Too Many Small Sections

**Problem:** Claude creates 20+ sections for simple sites

**Solution in Prompt:**
```
Aim for 3-7 logical sections total:
- 1 header (if nav exists)
- 1 hero (if large intro section)
- 2-4 content sections (group related content)
- 1 footer (if footer exists)

Don't create a new section for every <section> tag. Group logically.
```

## Testing the Prompt

### Test Cases

1. **Simple One-Page Site**
   - Expected: 3-4 sections, 10-15 blocks
   - Test URL: https://example.com

2. **Marketing Site**
   - Expected: 5-7 sections, 20-30 blocks
   - Test URL: https://stripe.com

3. **Blog Post**
   - Expected: 3 sections, 15-25 blocks (mostly paragraphs/headings)
   - Test URL: Any blog article

4. **E-commerce Product**
   - Expected: 4-6 sections, 20-40 blocks (images, buttons, lists)
   - Test URL: Any product page

### Evaluation Metrics

**Structure Accuracy:**
- Are sections logically grouped?
- Is hierarchy preserved?
- Are all important elements captured?

**Design Preservation:**
- Are brand colors extracted correctly?
- Are fonts identified accurately?
- Is spacing reasonable?

**Block Mapping:**
- Are block types appropriate?
- Is content preserved exactly?
- Are links working?

**Performance:**
- Time to complete: <60 seconds ✅
- Token usage: <70K input, <16K output ✅
- Success rate: >90% ✅

## Advanced Optimizations

### 1. Multi-Pass Processing

For very complex sites, consider two-pass approach:

**Pass 1: Structure Analysis**
```
Analyze this HTML and return:
1. List of main sections
2. Color palette (top 6 colors)
3. Font families used
4. Key content areas
```

**Pass 2: Detailed Conversion**
```
Using the structure from Pass 1, convert each section to blocks...
```

### 2. Screenshot Analysis

Future enhancement: Send screenshot with HTML

```typescript
const messages = [
  {
    role: 'user',
    content: [
      { type: 'image', source: { type: 'base64', data: screenshotBase64 } },
      { type: 'text', text: prompt }
    ]
  }
];
```

**Benefits:**
- Claude can see visual layout
- Better color extraction
- Understand visual hierarchy
- Detect hero sections visually

### 3. Incremental Refinement

Allow users to refine conversion:

```typescript
// After initial conversion
const refinePrompt = `
The user wants to adjust this conversion:
Original: ${JSON.stringify(originalResult)}
User feedback: "${userFeedback}"
Adjust the conversion accordingly.
`;
```

## Prompt Versioning

Track prompt versions for A/B testing:

```typescript
const PROMPT_VERSION = '1.0.0';

// Include in Edge Function logs
console.log(`Using prompt version: ${PROMPT_VERSION}`);
```

### Version History

**v1.0.0 (Current)**
- Initial implementation
- 37 block types
- Basic design system extraction
- JSON schema with examples

**Future v1.1.0**
- Enhanced color extraction rules
- Better section splitting logic
- Screenshot analysis support

**Future v2.0.0**
- Multi-pass processing
- User refinement support
- Template learning from successful conversions

## Cost Optimization

### Reduce Token Usage

1. **Pre-process HTML:**
   - Remove comments
   - Minify whitespace
   - Remove script/style tags
   - Keep only content areas

2. **Smarter CSS Extraction:**
   - Only send styles for visible elements
   - Remove unused CSS rules
   - Extract computed styles instead of full CSS

3. **Caching:**
   - Cache converted sites
   - Reuse designs for similar sites
   - Store common patterns

### Example Optimization:

```typescript
// Before: 70,000 tokens
const html = fullHtml;

// After: 40,000 tokens (43% reduction)
const html = cleanAndMinify(fullHtml);
```

## Monitoring and Improvement

### Log Key Metrics

```typescript
{
  promptVersion: '1.0.0',
  htmlSize: 50000,
  cssSize: 20000,
  inputTokens: 68432,
  outputTokens: 12456,
  processingTime: 45,
  sectionsCreated: 5,
  blocksCreated: 28,
  colorsParsed: 6,
  fontsDetected: 2,
  success: true
}
```

### Analyze Failures

When conversions fail:
1. Save the HTML/CSS that caused failure
2. Review Claude's response
3. Identify prompt improvements
4. Add to test suite

## Conclusion

The prompt is the brain of the conversion system. Regular testing, monitoring, and refinement will improve accuracy over time.

**Key Principles:**
1. Be explicit and specific
2. Provide examples
3. Handle edge cases
4. Validate output format
5. Monitor and iterate

---

**Questions or improvements?** Update this document as the prompt evolves!
