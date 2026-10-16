const evaluationService = require("./evaluationService");
const ragService = require("./ragService");
const cacheService = require("./cacheService");

/**
 * Backward compatibility facade delegating to the decoupled Evaluation Module and RAG Service.
 * Follows SOA and SOLID Interface Segregation principles.
 */
class AIServiceFacade {
  constructor() {
    this.evaluationService = evaluationService;
    this.ragService = ragService;
    this.cacheService = cacheService;
  }

  retrieveRAGContext(questionText, category) {
    return this.ragService.retrieveContext(questionText, category);
  }

  async generateFeedback(userAnswer, questionContext) {
    return this.evaluationService.evaluateAnswer(userAnswer, questionContext);
  }
}

module.exports = new AIServiceFacade();
