export function createChatCompletion200() {
  const body = {
    id: "chatcmpl-XXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    object: "chat.completion",
    created: 888888888,
    model: "gpt-3.5-turbo-0301",
    usage: {
      prompt_tokens: 11,
      completion_tokens: 9,
      total_tokens: 20,
    },
    choices: [
      {
        message: {
          role: "assistant",
          content: "Hello! How may I assist you today?",
        },
        finish_reason: "stop",
        index: 0,
      },
    ],
  };
  return (_req: Request) => {
    return new Response(JSON.stringify(body), { status: 200 });
  };
}

export function createChatCompletion401() {
  const body = {
    error: {
      message:
        "Incorrect API key provided: test. You can find your API key at https://platform.openai.com/account/api-keys.",
      type: "invalid_request_error",
      param: null,
      code: "invalid_api_key",
    },
  };
  return (_req: Request) => {
    return new Response(JSON.stringify(body), { status: 401 });
  };
}
