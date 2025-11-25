export class BaseParser {
    constructor(lines) {
        this.lines = lines;
        this.strategies = [];
    }

    addStrategy(strategy) {
        this.strategies.push(strategy);
        return this;
    }

    parse() {
        let bestResult = null;
        let bestScore = -1;

        for (const strategy of this.strategies) {
            try {
                const result = strategy.execute(this.lines);
                if (result && result.score > bestScore) {
                    bestScore = result.score;
                    bestResult = result.value;
                }
            } catch (e) {
                console.warn(`Strategy failed: ${strategy.constructor.name}`, e);
            }
        }

        return bestResult;
    }
}
