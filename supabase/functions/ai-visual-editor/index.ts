/**
 * Supabase Edge Function: AI Visual Editor (Framework-Grade)
 * Uses OpenAI GPT-4o with unified mutation API for DOM editing
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { applyMutations } from './lib/mutations.ts';
import type { MutationOp } from './lib/types.ts';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';

interface EditRequest {
  htmlContent: string;
  selector: string;
  instruction: string;
  uploadedImageUrl?: string;
  elementContext: {
    tagName: string;
    textContent: string;
    outerHTML: string;
    attributes: { [key: string]: string };
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    console.log('\n' + '='.repeat(60));
    console.log('🤖 AI Visual Editor invoked');
    const body = await req.json();
    const { htmlContent, selector, instruction, uploadedImageUrl, elementContext }: EditRequest = body;

    // Validation
    if (!htmlContent) throw new Error('htmlContent is required');
    if (!selector) throw new Error('selector is required');
    if (!instruction) throw new Error('instruction is required');
    if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY environment variable is not set');

    console.log(`📝 Request:`, {
      selector,
      instruction,
      elementTag: elementContext.tagName,
      htmlLength: htmlContent.length,
      hasUploadedImage: !!uploadedImageUrl,
    });

    // SPECIAL CASE: Direct image replacement (bypass AI for performance)
    if (uploadedImageUrl && elementContext.tagName.toLowerCase() === 'img' && elementContext.attributes?.src) {
      console.log(`🎯 Direct image replacement detected`);

      const operations: MutationOp[] = [{
        op: 'update_attr',
        selector,
        attr: 'src',
        value: uploadedImageUrl,
      }];

      const result = await applyMutations(htmlContent, operations);

      if (result.success) {
        console.log('✅ Direct image replacement successful');
        console.log('='.repeat(60) + '\n');
        return new Response(
          JSON.stringify({
            success: true,
            updatedHtml: result.htmlAfter,
            changes: `Changed image src to "${uploadedImageUrl}"`,
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }
    }

    // Call OpenAI with unified mutation API
    console.log(`🧠 Calling OpenAI for instruction: "${instruction}"`);

    const tools = [
      {
        type: 'function',
        function: {
          name: 'apply_dom_mutations',
          description: 'Apply one or more DOM mutations transactionally using CSS selectors',
          parameters: {
            type: 'object',
            properties: {
              operations: {
                type: 'array',
                description: 'Array of DOM mutation operations to apply',
                items: {
                  type: 'object',
                  properties: {
                    op: {
                      type: 'string',
                      enum: ['delete', 'insert', 'update_text', 'update_attr', 'move'],
                      description: 'Type of operation: delete (remove element), insert (add new element), update_text (change text content), update_attr (modify attribute), move (relocate element)'
                    },
                    selector: {
                      type: 'string',
                      description: 'CSS selector to find the target element'
                    },
                    target: {
                      type: 'string',
                      description: 'Target selector for move operations'
                    },
                    position: {
                      type: 'string',
                      enum: ['before', 'after', 'prepend', 'append'],
                      description: 'Where to insert/move the element'
                    },
                    html: {
                      type: 'string',
                      description: 'HTML string for insert operations'
                    },
                    attr: {
                      type: 'string',
                      description: 'Attribute name for update_attr operations'
                    },
                    value: {
                      type: 'string',
                      description: 'New value for update_text or update_attr operations'
                    }
                  },
                  required: ['op', 'selector']
                }
              },
              confidence: {
                type: 'number',
                description: 'AI confidence in the mutation (0-1)',
                minimum: 0,
                maximum: 1
              }
            },
            required: ['operations']
          }
        }
      }
    ];

    const messages = [
      {
        role: 'system',
        content: `You are an HTML editing assistant using a unified mutation API. You can perform multiple DOM operations in one transaction.

IMPORTANT RULES:
1. Use the CSS selector provided by the user: "${selector}"
2. Analyze the instruction and determine which operation(s) to perform
3. For deletions: use op="delete" with the selector
4. For text changes: use op="update_text" with value
5. For image changes: use op="update_attr" with attr="src" and value
6. For new elements: use op="insert" with html and position
7. For moving elements: use op="move" with target selector
8. Multiple operations will be applied in order
9. If any operation fails, all will rollback
${uploadedImageUrl ? `\n10. CRITICAL: User uploaded an image. Use update_attr to set src="${uploadedImageUrl}"` : ''}

Element Context:
- Selector: ${selector}
- Tag: ${elementContext.tagName}
- Current Text: "${elementContext.textContent}"
- Attributes: ${JSON.stringify(elementContext.attributes)}`,
      },
      {
        role: 'user',
        content: `User instruction: "${instruction}"

${uploadedImageUrl ? `\nIMPORTANT: An image was uploaded. You MUST call apply_dom_mutations with:
{ op: "update_attr", selector: "${selector}", attr: "src", value: "${uploadedImageUrl}" }` : ''}

Please call apply_dom_mutations with the appropriate operations.`,
      },
    ];

    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        tools,
        tool_choice: 'auto',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', errorText);
      throw new Error(`OpenAI API failed: ${errorText}`);
    }

    const completion = await response.json();
    const assistantMessage = completion.choices[0].message;

    if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
      throw new Error('AI did not provide an edit action. Please rephrase your instruction.');
    }

    // Parse AI response
    const toolCall = assistantMessage.tool_calls[0];
    const functionArgs = JSON.parse(toolCall.function.arguments);
    const operations: MutationOp[] = functionArgs.operations || [];
    const confidence = functionArgs.confidence || 1.0;

    console.log(`🎯 AI returned ${operations.length} operation(s) with confidence ${(confidence * 100).toFixed(0)}%`);
    operations.forEach((op, i) => {
      console.log(`  ${i + 1}. ${op.op} on ${op.selector}`);
    });

    // Apply mutations using our modular engine
    const result = await applyMutations(htmlContent, operations);

    if (!result.success) {
      console.error('❌ Mutation failed:', result.verification.issues);
      console.log('='.repeat(60) + '\n');
      return new Response(
        JSON.stringify({
          success: false,
          error: result.verification.issues.join('; '),
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Success!
    const changes = result.operations.map(op => op.message).join('; ');
    console.log(`✅ Success! Changes: ${changes}`);
    console.log(`📊 Performance:`, {
      operations: result.operations.length,
      totalDuration_ms: result.operations.reduce((sum, op) => sum + op.duration_ms, 0),
      htmlSizeBefore: result.htmlBefore.length,
      htmlSizeAfter: result.htmlAfter.length,
      diff: result.diff.size.diff,
    });
    console.log('='.repeat(60) + '\n');

    return new Response(
      JSON.stringify({
        success: true,
        updatedHtml: result.htmlAfter,
        changes,
        meta: {
          operations: result.operations.length,
          confidence,
          duration_ms: result.operations.reduce((sum, op) => sum + op.duration_ms, 0),
        }
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );

  } catch (error) {
    console.error('❌ AI Visual Editor error:', error);
    console.log('='.repeat(60) + '\n');
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || String(error),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
