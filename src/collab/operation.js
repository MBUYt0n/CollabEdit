class Operation {
	constructor(type, line, position, text) {
		this.type = type;
		this.line = line;
		this.position = position;
		this.text = text;
	}

	static transform(op1, op2) {
		if (op1.line === op2.line) {
			if (op1.type === "insert" && op2.type === "insert") {
				if (op1.position < op2.position) {
					op2.position += op1.text.length;
				} else if (op1.position > op2.position) {
					op1.position += op2.text.length;
				}
			} else if (op1.type === "delete" && op2.type === "delete") {
				if (op1.position < op2.position) {
					op2.position -= Math.min(
						op1.text.length,
						op2.position - op1.position
					);
				} else {
					op1.position -= Math.min(
						op2.text.length,
						op1.position - op2.position
					);
				}
			} else if (op1.type === "insert" && op2.type === "delete") {
				if (op1.position <= op2.position) {
					op2.position += op1.text.length;
				} else {
				}
			} else if (op1.type === "delete" && op2.type === "insert") {
				if (op1.position < op2.position) {
					op2.position -= Math.min(
						op1.text.length,
						op2.position - op1.position
					);
				} else {
					op1.position += op2.text.length;
				}
			}
		} else {
			if (op1.type === "insert" && op1.text.includes("\n")) {
				const newLines = op1.text.split("\n").length - 1;
				if (op1.line < op2.line) {
					op2.line += newLines;
				} else if (
					op1.line === op2.line &&
					op1.position <= op2.position
				) {
					op2.line += newLines;
				}
			} else if (op1.type === "delete" && op1.text.includes("\n")) {
				const newLines = op1.text.split("\n").length - 1;
				if (op1.line < op2.line) {
					op2.line -= newLines;
				} else if (
					op1.line === op2.line &&
					op1.position <= op2.position
				) {
					op2.line -= newLines;
				}
			}
		}
		return [op1, op2];
	}
}

module.exports = Operation;
