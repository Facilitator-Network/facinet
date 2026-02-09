export const X402_DATA = {
  title: "What is X402?",
  description:
    "Payments on the internet are broken. Credit cards are high-friction, hard to accept, and unfit for the programmatic nature of AI. x402 is the open, neutral standard that absolves the Internet's original sin by natively enabling payments between clients and servers. It creates a win-win economy free from high minimums, empowering both humans and agents to build a more free and fair internet.",
  codeSection: {
    title: "Accept payments with a single line of code",
    code: `app.use(
  paymentMiddleware(
    {
      "GET /weather": {
        accepts: [...],                 // As many networks / schemes as you want to support
        description: "Weather data",    // What your endpoint does
      },
    },
  )
);`,
    description:
      "That's it. Add one line of code to require payment for each incoming request. If a request arrives without payment, the server responds with HTTP 402, prompting the client to pay and retry.",
  },
}
