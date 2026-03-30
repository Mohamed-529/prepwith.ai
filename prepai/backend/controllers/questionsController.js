// Hardcoded mock interview questions
const questions = [
  {
    id: 1,
    category: "JavaScript",
    question: "What is the difference between var, let, and const in JavaScript?",
    hint: "Think about scope, hoisting, and reassignment.",
    keywords: ["scope", "hoisting", "block", "function", "reassign", "const", "let", "var"],
    sampleAnswer:
      "var is function-scoped and hoisted. let is block-scoped and not hoisted. const is block-scoped, not hoisted, and cannot be reassigned.",
  },
  {
    id: 2,
    category: "React",
    question: "Explain the concept of React hooks and why they were introduced.",
    hint: "Consider state management in functional components.",
    keywords: ["state", "functional", "component", "lifecycle", "useState", "useEffect", "class"],
    sampleAnswer:
      "React hooks allow functional components to use state and lifecycle features. They were introduced to avoid class components and share stateful logic between components.",
  },
  {
    id: 3,
    category: "Node.js",
    question: "What is the event loop in Node.js and how does it work?",
    hint: "Think about asynchronous operations and the call stack.",
    keywords: ["async", "callback", "non-blocking", "event", "loop", "call stack", "queue"],
    sampleAnswer:
      "The event loop allows Node.js to perform non-blocking I/O operations by offloading tasks to the system kernel and processing callbacks in a loop.",
  },
  {
    id: 4,
    category: "Database",
    question: "What is the difference between SQL and NoSQL databases?",
    hint: "Consider structure, scalability, and use cases.",
    keywords: ["relational", "schema", "scalable", "flexible", "structured", "document", "table"],
    sampleAnswer:
      "SQL databases are relational with fixed schemas. NoSQL databases are non-relational, flexible, and better suited for unstructured or rapidly changing data.",
  },
  {
    id: 5,
    category: "General CS",
    question: "Explain the concept of RESTful APIs and their key principles.",
    hint: "Think about HTTP methods and statelessness.",
    keywords: ["stateless", "http", "get", "post", "put", "delete", "resource", "endpoint"],
    sampleAnswer:
      "RESTful APIs use HTTP methods (GET, POST, PUT, DELETE) to perform CRUD operations on resources. They are stateless, meaning each request contains all needed information.",
  },
  {
    id: 6,
    category: "JavaScript",
    question: "What is a Promise in JavaScript and how does async/await work?",
    hint: "Consider asynchronous operations and error handling.",
    keywords: ["async", "await", "promise", "resolve", "reject", "then", "catch", "asynchronous"],
    sampleAnswer:
      "A Promise represents a value that may be available now, later, or never. async/await is syntactic sugar over promises, making async code look synchronous.",
  },
  {
    id: 7,
    category: "React",
    question: "What is the Virtual DOM and how does React use it?",
    hint: "Think about performance optimization and DOM updates.",
    keywords: ["virtual", "dom", "reconciliation", "diff", "performance", "update", "render"],
    sampleAnswer:
      "The Virtual DOM is a lightweight copy of the real DOM. React uses it to compute minimal DOM updates through a diffing algorithm called reconciliation.",
  },
  {
    id: 8,
    category: "CSS",
    question: "Explain the CSS Box Model and its components.",
    hint: "Think about content, padding, border, and margin.",
    keywords: ["content", "padding", "border", "margin", "box", "width", "height"],
    sampleAnswer:
      "The CSS Box Model describes element layout: content area, surrounded by padding, then border, then margin. Box-sizing controls how dimensions are calculated.",
  },
];

// @desc    Get all interview questions
// @route   GET /api/questions
// @access  Private
const getQuestions = async (req, res) => {
  try {
    // Return questions without sample answers (to avoid cheating)
    const questionsForUser = questions.map(({ sampleAnswer, keywords, ...q }) => q);
    res.status(200).json({
      success: true,
      count: questionsForUser.length,
      questions: questionsForUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Export questions for use in other controllers
module.exports = { getQuestions, questions };
